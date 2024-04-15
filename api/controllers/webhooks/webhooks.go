package webhooks_controller

import (
	dbConfig "api/db"
	"api/models"
	"api/services/adventure_service"
	"api/services/build_service"
	"api/services/user_service"
	"api/utils"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/subscription"
	"github.com/stripe/stripe-go/v76/webhook"
	svix "github.com/svix/svix-webhooks/go"
)

func Webhooks(c *gin.Context) {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	var body map[string]interface{}

	payload, err := io.ReadAll(c.Request.Body)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[WEBHOOKS] [CLERK] Could not read request body",
			Extra: map[string]interface{}{
				"error": err.Error(),
			},
		})
		c.String(http.StatusBadRequest, "Bad Request")
		return
	}

	headers := c.Request.Header
	wh_secret := utils.GoDotEnvVariable("CLERK_WH_SECRET")

	wh, err := svix.NewWebhook(wh_secret)

	if err != nil {
		c.String(http.StatusInternalServerError, "Error creating webhook")
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[WEBHOOKS] [CLERK] Error creating webhook",
		})
		log.Fatal(err)
	}

	err = json.Unmarshal(payload, &body)
	if err != nil {
		log.Fatal(err)
	}

	err = wh.Verify(payload, headers)

	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized - Could not verify webhook signature")
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[WEBHOOKS] [CLERK] Unauthorized - Could not verify webhook signature",
		})
		return
	}

	evtType := utils.GetProperty(body, "type")

	if evtType == nil {
		c.String(http.StatusAccepted, "No event")
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[WEBHOOKS] [CLERK] No event",
		})
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
			c.String(http.StatusBadRequest, "Bad Request")
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [CLERK] [user.created] Could not unmarshal payload",
			})
			return
		}

		newUser := models.User{
			Uuid: data.Data.ID,
		}

		if data.Data.Username != nil {
			newUser.Username = *data.Data.Username
		}

		// Create user from Clerk data
		err := user_service.Create(dbConfig.Client, &newUser)

		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [CLERK] [user.created] Could not create user",
				Extra: map[string]interface{}{
					"error": err.Error(),
				},
			})
			return
		}
	case "user.updated":
		var data struct {
			Data  clerk.User `json:"data"`
			Event string     `json:"event"`
			Type  string     `json:"type"`
		}

		if err := json.Unmarshal(payload, &data); err != nil {
			c.String(http.StatusBadRequest, "Bad Request")
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [CLERK] [user.updated] Could not unmarshal payload",
			})
			return
		}

		u, err := user_service.FindUser(dbConfig.Client, data.Data.ID)

		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [CLERK] [user.updated] Could not find user",
				Extra: map[string]interface{}{
					"error": err.Error(),
				},
			})
			return
		}

		u.Username = *data.Data.Username
		u.ImageUrl = *data.Data.ImageURL

		err = user_service.Update(dbConfig.Client, u)

		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [CLERK] [user.updated] Could not update user",
				Extra: map[string]interface{}{
					"error": err.Error(),
				},
			})
			return
		}
	}

	c.String(http.StatusAccepted, "success")

}

func StripeWebhooks(c *gin.Context) {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[WEBHOOKS] [STRIPE] Could not read request body",
			Extra: map[string]interface{}{
				"error": err.Error(),
			},
		})
		c.String(http.StatusBadRequest, "Bad Request")
		return
	}

	event := stripe.Event{}

	if err := json.Unmarshal(payload, &event); err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[WEBHOOKS] [STRIPE] Could not unmarshal payload",
			Extra: map[string]interface{}{
				"error": err.Error(),
			},
		})
		c.String(http.StatusBadRequest, "Bad Request")
		return
	}

	endpointSecret := utils.GoDotEnvVariable("STRIPE_WH_SECRET")
	signatureHeader := c.Request.Header.Get("Stripe-Signature")
	event, err = webhook.ConstructEvent(payload, signatureHeader, endpointSecret)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[WEBHOOKS] [STRIPE] Could not construct event",
			Extra: map[string]interface{}{
				"error": err.Error(),
			},
		})
		c.String(http.StatusBadRequest, "Bad Request")
		return
	}

	switch event.Type {
	case "customer.subscription.updated":
		var data stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &data); err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [customer.subscription.updated] Could not read request body",
				Extra: map[string]interface{}{
					"error": err.Error(),
				},
			})
			c.String(http.StatusBadRequest, "Bad Request")
			return
		}

		fmt.Println(data)

		usr, err := user_service.FindUserByCustomerId(dbConfig.Client, data.Customer.ID)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [customer.subscription.updated] Could not find user",
				Extra: map[string]interface{}{
					"error":   err.Error(),
					"user_id": usr.Uuid,
				},
			})
			c.String(http.StatusInternalServerError, "Something went wrong")
			return
		}

		usr.CustomerId = data.Customer.ID

		cus_params := &stripe.CustomerParams{}
		cus_params.AddExpand("subscriptions")
		stripe_cus, err := customer.Get(usr.CustomerId, cus_params)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [customer.subscription.updated] Could not find user from Stripe API",
				Extra: map[string]interface{}{
					"error":   err.Error(),
					"user_id": usr.Uuid,
				},
			})
			c.String(http.StatusInternalServerError, "Something went wrong")
			return
		}

		params := &stripe.SubscriptionParams{}
		params.AddExpand("items.data.price.product")

		stripe_sub, err := subscription.Get(stripe_cus.Subscriptions.Data[0].ID, params)
		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [customer.subscription.updated] Could not find subscription from Stripe API",
				Extra: map[string]interface{}{
					"error":   err.Error(),
					"user_id": usr.Uuid,
				},
			})
			c.String(http.StatusInternalServerError, "Something went wrong")
			return
		}

		plan := stripe_sub.Items.Data[0].Price.Product.Name

		usr.MaxPublicBuilds = int(user_service.Plan_limits[plan].MaxBuilds)
		usr.MaxPublicAdventures = int(user_service.Plan_limits[plan].MaxAdventures)

		user_service.Update(dbConfig.Client, usr)

	case "checkout.session.completed":
		var data stripe.CheckoutSession

		if err := json.Unmarshal(event.Data.Raw, &data); err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [checkout.session.completed] Could not read request body",
				Extra: map[string]interface{}{
					"error": err.Error(),
				},
			})
			c.String(http.StatusBadRequest, "Bad Request")
			return
		}

		usr, err := user_service.FindUser(dbConfig.Client, data.Metadata["clerk_user_id"])

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [checkout.session.completed] Could not find user from user_service",
				Extra: map[string]interface{}{
					"error":   err.Error(),
					"user_id": usr.Uuid,
				},
			})
			c.String(http.StatusInternalServerError, "Something went wrong")
			return
		}

		usr.CustomerId = data.Customer.ID

		cus_params := &stripe.CustomerParams{}
		cus_params.AddExpand("subscriptions")
		stripe_cus, err := customer.Get(usr.CustomerId, cus_params)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [checkout.session.completed] Could not find user from Stripe API",
				Extra: map[string]interface{}{
					"error":   err.Error(),
					"user_id": usr.Uuid,
				},
			})
			c.String(http.StatusInternalServerError, "Something went wrong")
			return
		}

		params := &stripe.SubscriptionParams{}
		params.AddExpand("items.data.price.product")

		stripe_sub, err := subscription.Get(stripe_cus.Subscriptions.Data[0].ID, params)
		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [checkout.session.completed] Could not find subscription from Stripe API",
				Extra: map[string]interface{}{
					"error":   err.Error(),
					"user_id": usr.Uuid,
				},
			})
			c.String(http.StatusInternalServerError, "Something went wrong")
			return
		}
		usr.MaxPublicBuilds = int(user_service.Plan_limits[stripe_sub.Items.Data[0].Price.Product.Name].MaxBuilds)

		user_service.Update(dbConfig.Client, usr)

	case "customer.subscription.deleted":
		var subscriptionData stripe.Subscription

		if err := json.Unmarshal(event.Data.Raw, &subscriptionData); err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [customer.subscription.deleted] Could not read request body",
				Extra: map[string]interface{}{
					"error": err.Error(),
				},
			})
			c.String(http.StatusInternalServerError, "Bad Request")
			return
		}

		usr, err := user_service.FindUserByCustomerId(dbConfig.Client, subscriptionData.Customer.ID)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [customer.subscription.deleted] Could not find user from user_service",
				Extra: map[string]interface{}{
					"error":   err.Error(),
					"user_id": usr.Uuid,
				},
			})
			c.String(http.StatusInternalServerError, "Something went wrong")
			return
		}

		builds, err := build_service.AllByUser(dbConfig.Client, usr.Uuid)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [customer.subscription.deleted] Could not find builds for user from build_service",
				Extra: map[string]interface{}{
					"error":   err.Error(),
					"user_id": usr.Uuid,
				},
			})
			c.String(http.StatusInternalServerError, "Something went wrong")
			return
		}

		if len(builds) > 1 {
			for _, build := range builds[1:] {
				build.Public = false
				build_service.Update(dbConfig.Client, &build)
			}
		}

		usr.MaxPublicBuilds = 1
		usr.MaxPublicAdventures = 1

		advs, err := adventure_service.GetAdventuresByUser(dbConfig.Client, usr.Uuid)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[WEBHOOKS] [STRIPE] [customer.subscription.deleted] Could not find adventures for user from adventure_service",
				Extra: map[string]interface{}{
					"error":   err.Error(),
					"user_id": usr.Uuid,
				},
			})
			c.String(http.StatusInternalServerError, "Something went wrong")
			return
		}

		for _, adv := range advs[1:] {
			adv.Public = false
			adventure_service.Update(dbConfig.Client, adv)
		}

		user_service.Update(dbConfig.Client, usr)
	}
	c.String(http.StatusOK, "success")
}
