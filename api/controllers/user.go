package controllers

import (
	"api/db"
	"api/domain/user"
	"api/utils"
	"log"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/customer"
)

type AccountResponse struct {
	HasSubscription bool `json:"has_subscription"`
	Subscription    struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Price int64  `json:"price"`
	} `json:"subscription"`
}

func Bookmark(build_id, user_id string) error {

	build, err := GetById(build_id)

	if err != nil {
		return err
	}

	user, err := user.FindCurrentUser(db.Client, user_id)

	if err != nil {
		return err
	}

	user.Bookmark(db.Client, build)

	return nil
}

func Unbookmark(build_id, user_id string) error {

	build, err := GetById(build_id)

	if err != nil {
		return err
	}

	user, err := user.FindCurrentUser(db.Client, user_id)

	if err != nil {
		return err
	}

	user.Unbookmark(db.Client, build)

	return nil
}

func GetCurrentUser(id string) (user.User, error) {
	return user.FindCurrentUser(db.Client, id)
}

func GetStripeAccount(u *clerk.User) AccountResponse {
	utils.StripeClientInit()

	domainUser, err := user.FindCurrentUser(db.Client, u.ID)

	if err != nil {
		log.Fatal(err)
	}

	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions")

	cus, err := customer.Get(domainUser.CustomerId, params)

	if err != nil {
		log.Fatal(err)
	}

	var resp AccountResponse

	if cus.Subscriptions.TotalCount > 0 {
		resp.HasSubscription = true
		resp.Subscription.ID = cus.Subscriptions.Data[0].ID
		resp.Subscription.Name = cus.Subscriptions.Data[0].Plan.Product.Name
		resp.Subscription.Price = cus.Subscriptions.Data[0].Plan.Amount
	}

	return resp
}
