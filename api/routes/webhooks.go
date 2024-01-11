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

	case "user.created":

		var data struct {
			Data  clerk.User `json:"data"`
			Event string     `json:"event"`
			Type  string     `json:"type"`
		}

		if err := json.Unmarshal(payload, &data); err != nil {
			c.String(400, "Bad Request")
			return
		}

		newUser := user.User{
			Uuid: data.Data.ID,
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
	case "checkout.session.completed":
		var data stripe.CheckoutSession

		if err := json.Unmarshal(event.Data.Raw, &data); err != nil {
			fmt.Fprintf(os.Stderr, "⚠️  Webhook error while parsing basic request. %v\n", err.Error())
			c.String(400, "Bad Request")
			return
		}

		usr, err := user.FindCurrentUser(db.Client, data.Metadata["clerk_user_id"])

		if err != nil {
			fmt.Println("Error getting user in Stripe webhook event: ", err)
			c.String(500, "Something went wrong")
			return
		}

		usr.CustomerId = data.Customer.ID

		usr.Update(db.Client)

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
			c.String(500, "Something went wrong")
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
