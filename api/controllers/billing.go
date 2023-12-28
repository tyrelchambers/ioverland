package controllers

import (
	"api/db"
	"api/domain/user"
	"api/utils"
	"log"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
)

func CreateCheckout(u *clerk.User) string {
	domain_user, err := user.FindCurrentUser(db.Client, u.ID)

	if err != nil {
		log.Fatal(err)
	}

	return_url := utils.GoDotEnvVariable("APP_URL")

	checkout_params := stripe.CheckoutSessionParams{
		Customer:   &domain_user.CustomerId,
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		SuccessURL: stripe.String(return_url),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String("price_1OSKyeEPapIiG0WqjUGqdonV"),
				Quantity: stripe.Int64(1),
			},
		},
	}

	result, err := session.New(&checkout_params)

	if err != nil {
		log.Fatal(err)
	}

	return result.URL
}
