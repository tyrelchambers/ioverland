package routes

import (
	"api/db"
	"api/domain/build"
	"api/domain/user"
	"api/utils"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/webhook"
	svix "github.com/svix/svix-webhooks/go"
)

func Webhooks(c *gin.Context) {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	var body map[string]interface{}

	payload, err := io.ReadAll(c.Request.Body)
	headers := c.Request.Header
	wh_secret := utils.GoDotEnvVariable("CLERK_WH_SECRET")

	wh, err := svix.NewWebhook(wh_secret)

	if err != nil {
		log.Fatal(err)
	}

	err = json.Unmarshal(payload, &body)
	if err != nil {
		log.Fatal(err)
	}

	err = wh.Verify(payload, headers)

	if err != nil {
		c.String(401, "Unauthorized - Could not verify webhook signature")
		return
	}

	evtType := utils.GetProperty(body, "type")

	if evtType == nil {
		c.String(202, "No event")
		return
	}

	switch evtType {
	case "session.created":
		var data struct {
			Data  clerk.Session `json:"data"`
			Event string        `json:"event"`
			Type  string        `json:"type"`
		}

		if err := json.Unmarshal(payload, &data); err != nil {
			c.String(400, "Bad Request")
			return
		}

		stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
		stripe.Key = stripe_key

		if err != nil {
			c.String(500, err.Error())
			return
		}

		clerk_user, err := utils.ClerkClient.Users().Read(data.Data.UserID)

		if err != nil {
			c.String(500, err.Error())
			return
		}
		domain_user, err := user.FindCurrentUser(db.Client, data.Data.UserID)

		update_new_user_with_customer_id := false

		if err != nil && err.Error() == "record not found" {
			new_user := user.User{
				Uuid:       data.Data.UserID,
				CustomerId: "",
			}

			user.Create(db.Client, &new_user)

			domain_user = new_user

			update_new_user_with_customer_id = true

		}

		params := &stripe.CustomerSearchParams{
			SearchParams: stripe.SearchParams{
				Query: fmt.Sprintf("metadata['clerk_id']:'%s'", data.Data.UserID),
			},
		}
		result := customer.Search(params)
		result_data := result.CustomerSearchResult()

		if len(result_data.Data) == 0 {
			fmt.Println("Couldn't find customer in Stripe - creating.")

			params := &stripe.CustomerParams{
				Email: stripe.String(clerk_user.EmailAddresses[0].EmailAddress),
			}

			cus, _ := customer.New(params)

			updateParams := &stripe.CustomerParams{}
			updateParams.AddMetadata("clerk_id", data.Data.UserID)

			customer.Update(cus.ID, updateParams)

			domain_user.CustomerId = cus.ID

			domain_user.Update(db.Client)
		}

		if update_new_user_with_customer_id {
			domain_user.CustomerId = result_data.Data[0].ID
			domain_user.Update(db.Client)
		}

	case "user.created":
		var data struct {
			Data  clerk.User `json:"data"`
			Event string     `json:"event"`
			Type  string     `json:"type"`
		}
		if err := json.Unmarshal(payload, &body); err != nil {
			c.String(400, "Bad Request")
			return
		}

		fmt.Println(data.Data.EmailAddresses)

		// Create stripe customer and update customer with clerk ID into metadata
		params := &stripe.CustomerParams{
			Email: stripe.String(data.Data.EmailAddresses[0].EmailAddress),
		}

		cus, _ := customer.New(params)

		updateParams := &stripe.CustomerParams{}
		updateParams.AddMetadata("clerk_id", data.Data.ID)

		customer.Update(cus.ID, updateParams)

		newUser := user.User{
			Uuid:       data.Data.ID,
			CustomerId: cus.ID,
		}

		// Create user from Clerk data
		err := user.Create(db.Client, &newUser)

		if err != nil {
			c.String(500, err.Error())
			return
		}

		c.String(200, "success")
		return
	}

	c.String(202, "success")
	return

}

func StripeWebhooks(c *gin.Context) {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading request body: %v\n", err)
		c.String(400, "Bad Request")
		return
	}

	event := stripe.Event{}

	if err := json.Unmarshal(payload, &event); err != nil {
		fmt.Fprintf(os.Stderr, "⚠️  Webhook error while parsing basic request. %v\n", err.Error())
		c.String(400, "Bad Request")
		return
	}

	endpointSecret := utils.GoDotEnvVariable("STRIPE_WH_SECRET")
	signatureHeader := c.Request.Header.Get("Stripe-Signature")
	event, err = webhook.ConstructEvent(payload, signatureHeader, endpointSecret)

	if err != nil {
		fmt.Fprintf(os.Stderr, "⚠️  Webhook signature verification failed. %v\n", err)
		c.String(400, "Bad Request")
		return
	}

	switch event.Type {
	case "customer.subscription.deleted":
		var subscriptionData stripe.Subscription

		if err := json.Unmarshal(event.Data.Raw, &subscriptionData); err != nil {
			fmt.Fprintf(os.Stderr, "⚠️  Webhook error while parsing basic request. %v\n", err.Error())
			c.String(400, "Bad Request")
			return
		}

		usr, err := user.FindUserByCustomerId(db.Client, subscriptionData.Customer.ID)

		if err != nil {
			fmt.Println("Error getting user in Stripe webhook event: ", err)
			c.String(500, "Something wen wrong")
			return
		}

		builds, err := build.AllByUser(db.Client, usr.Uuid)

		if err != nil {
			fmt.Println("Error getting builds in Stripe webhook event: ", err)
			c.String(500, "Something went wrong")
			return
		}

		if len(builds) > 1 {
			for _, build := range builds[1:] {
				build.Private = true
				build.Update(db.Client)
			}
		}
	}
	c.String(200, "success")
}
