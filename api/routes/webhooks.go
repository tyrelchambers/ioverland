package routes

import (
	"api/db"
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
	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/customer"
	"github.com/stripe/stripe-go/webhook"
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

	if evtType == "user.created" {
		var body struct {
			Data  clerk.User `json:"data"`
			Event string     `json:"event"`
			Type  string     `json:"type"`
		}

		if err := json.Unmarshal(payload, &body); err != nil {
			c.String(400, "Bad Request")
			return
		}

		// Create stripe customer and update customer with clerk ID into metadata
		params := &stripe.CustomerParams{
			Email: stripe.String(body.Data.EmailAddresses[0].EmailAddress),
		}

		cus, _ := customer.New(params)

		updateParams := &stripe.CustomerParams{}
		updateParams.AddMetadata("clerk_id", body.Data.ID)

		customer.Update(cus.ID, updateParams)

		newUser := user.User{
			Uuid:       body.Data.ID,
			CustomerId: cus.ID,
		}

		// Create user from Clerk data
		err := user.Create(db.Client, &newUser)

		if err != nil {
			c.String(500, err.Error())
			return
		}

		c.String(200, "success")
	}

	c.String(202, "success")
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
	case "customer.created":
		var customerData stripe.Customer

		if err := json.Unmarshal(event.Data.Raw, &customerData); err != nil {
			fmt.Fprintf(os.Stderr, "⚠️  Webhook error while parsing basic request. %v\n", err.Error())
			c.String(400, "Bad Request")
			return
		}

		// we do this because if they cancel their plan we need to delete their user at the end of the billing cycle
	case "customer.subscription.deleted":
		var subscriptionData stripe.Subscription

		if err := json.Unmarshal(event.Data.Raw, &subscriptionData); err != nil {
			fmt.Fprintf(os.Stderr, "⚠️  Webhook error while parsing basic request. %v\n", err.Error())
			c.String(400, "Bad Request")
			return
		}

		usr, err := user.FindUserByCustomerId(db.Client, subscriptionData.Customer.ID)

		if err != nil {
			fmt.Fprintf(os.Stderr, "⚠️  Webhook error while parsing basic request for event: %v. %v\n", event.Type, err.Error())
			c.String(400, "Bad Request")
			return
		}

		usr.Delete(db.Client)
	}
	c.String(200, "success")
}
