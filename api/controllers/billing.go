package controllers

import (
	"api/db"
	"api/domain/user"
	"api/utils"
	"log"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/stripe/stripe-go/v76"
	portal "github.com/stripe/stripe-go/v76/billingportal/session"
	"github.com/stripe/stripe-go/v76/checkout/session"
)

func CreateCheckout(u *clerk.User, redirect_to string) string {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	domainUser, err := user.FindCurrentUser(db.Client, u.ID)

	checkout_params := stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		SuccessURL: stripe.String(redirect_to),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String("price_1OSKyeEPapIiG0WqjUGqdonV"),
				Quantity: stripe.Int64(1),
			},
		},
		Customer: &domainUser.CustomerId,
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
