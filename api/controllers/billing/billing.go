package billing_controller

import (
	dbConfig "api/db"
	"api/services/user_service"
	"api/utils"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
)

func CreateCheckout(c *gin.Context) {
	redirect_to := c.Query("redirect_to")
	plan := c.Query("plan")
	user := utils.UserFromContext(c)

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	domainUser, err := user_service.FindUser(dbConfig.Client, user.Uuid)
	success_url := os.Getenv("APP_URL")

	if redirect_to != "" {
		success_url = redirect_to
	}

	stripe_customer_id := ""

	if domainUser.CustomerId != "" {
		stripe_customer_id = domainUser.CustomerId
	}

	checkout_params := stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		SuccessURL: stripe.String(success_url),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(plan),
				Quantity: stripe.Int64(1),
			},
		},
		Metadata: map[string]string{"clerk_user_id": user.Uuid},
	}

	if stripe_customer_id != "" {
		checkout_params.Customer = stripe.String(stripe_customer_id)
	}

	result, err := session.New(&checkout_params)

	if err != nil {
		log.Fatal(err)
		utils.CaptureError(c, &utils.CaptureErrorParams{Message: "[CONTROLLER] [BILLING] [CREATECHECKOUT] " + err.Error()})
		c.String(http.StatusInternalServerError, err.Error())
	}

	c.String(200, result.URL)
}

func CreateCustomerPortal(c *gin.Context) {

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	var portal_link string

	if os.Getenv("NODE_ENV") == "production" {
		portal_link = "https://billing.stripe.com/p/login/14k7t3531aoXbM45kk"
	} else {
		portal_link = "https://billing.stripe.com/p/login/test_bIYcQJgy61JH5UY000"
	}

	c.String(200, portal_link)
}
