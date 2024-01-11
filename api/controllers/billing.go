package controllers

import (
	"api/db"
	"api/domain/user"
	"api/utils"
	"fmt"
	"log"
	"os"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/stripe/stripe-go/v76"
	portal "github.com/stripe/stripe-go/v76/billingportal/session"
	"github.com/stripe/stripe-go/v76/checkout/session"
)

func CreateCheckout(u *clerk.User, redirect_to, plan string) string {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	domainUser, err := user.FindCurrentUser(db.Client, u.ID)
	success_url := os.Getenv("APP_URL")

	fmt.Println(domainUser, u, plan)

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
		Metadata: map[string]string{"clerk_user_id": u.ID},
	}

	fmt.Println(checkout_params.Metadata)

	if stripe_customer_id != "" {
		checkout_params.Customer = stripe.String(stripe_customer_id)
	}

	result, err := session.New(&checkout_params)

	if err != nil {
		log.Fatal(err)
	}

	return result.URL
}

func CreateCustomerPortal(id string) string {

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	params := &stripe.BillingPortalSessionParams{
		Customer: stripe.String(id),
	}

	result, err := portal.New(params)

	if err != nil {
		log.Fatal(err)
	}

	return result.URL
}
