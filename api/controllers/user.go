package controllers

import (
	"api/db"
	"api/domain/user"
	"api/utils"
	"log"
	"time"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/customer"
	"github.com/stripe/stripe-go/sub"
	"gorm.io/gorm"
)

type AccountResponse struct {
	HasSubscription bool `json:"has_subscription"`
	Subscription    struct {
		ID              string     `json:"id"`
		Name            string     `json:"name"`
		Price           int64      `json:"price"`
		DeletedAt       *time.Time `json:"deleted_at"`
		NextInvoiceDate time.Time  `json:"next_invoice_date"`
	} `json:"subscription"`
	DeletedAt       *gorm.DeletedAt `json:"deleted_at"`
	TotalBuilds     int64           `json:"total_builds"`
	BuildsRemaining int64           `json:"builds_remaining"`
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

func GetAccount(u *clerk.User) AccountResponse {
	utils.StripeClientInit()

	domainUser, err := user.FindCurrentUser(db.Client, u.ID)

	if err != nil {
		log.Fatal(err)
	}

	userBuilds, err := domainUser.BuildCount(db.Client)

	if err != nil {
		log.Fatal(err)
	}

	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions.data.plan.product")

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
		resp.Subscription.NextInvoiceDate = time.Unix(cus.Subscriptions.Data[0].CurrentPeriodEnd, 0)

		if cus.Subscriptions.Data[0].CancelAt != 0 {
			resp.Subscription.DeletedAt = nil
		}
	}

	resp.DeletedAt = &domainUser.DeletedAt

	resp.TotalBuilds = userBuilds

	if resp.HasSubscription {
		resp.BuildsRemaining = 5 - userBuilds
	} else {
		remainingBuilds := 5 - userBuilds

		if remainingBuilds < 0 {
			remainingBuilds = 0
		} else {
			resp.BuildsRemaining = remainingBuilds
		}
	}

	return resp
}

func DeleteUser(u *clerk.User) error {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	domainUser, err := user.FindCurrentUser(db.Client, u.ID)

	if err != nil {
		return err
	}

	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions")

	cus, err := customer.Get(domainUser.CustomerId, params)

	if err != nil {
		return err
	}

	sub, err := sub.Update(cus.Subscriptions.Data[0].ID, &stripe.SubscriptionParams{
		CancelAtPeriodEnd: stripe.Bool(true),
	})

	if err != nil {
		return err
	}

	domainUser.DeletedAt = gorm.DeletedAt{
		Valid: true,
		Time:  time.Unix(sub.CurrentPeriodEnd, 0),
	}

	domainUser.Update(db.Client)

	return nil
}

func RestoreUser(u *clerk.User) error {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key
	domainUser, err := user.FindCurrentUser(db.Client, u.ID)

	if err != nil {
		return err
	}

	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions")

	cus, err := customer.Get(domainUser.CustomerId, params)

	if err != nil {
		return err
	}

	_, err = sub.Update(cus.Subscriptions.Data[0].ID, &stripe.SubscriptionParams{
		CancelAtPeriodEnd: stripe.Bool(false),
	})

	if err != nil {
		return err
	}

	domainUser.DeletedAt = gorm.DeletedAt{
		Valid: false,
		Time:  time.Unix(0, 0),
	}

	domainUser.Update(db.Client)

	return nil

}
