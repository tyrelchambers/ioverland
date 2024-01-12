package controllers

import (
	dbConfig "api/db"
	"api/domain/build"
	"api/domain/user"
	"api/services"
	"api/utils"
	"fmt"
	"time"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/subscription"
	"gorm.io/gorm"
)

type GetCurrentUserWithStripeResponse struct {
	User     user.User        `json:"user"`
	Customer *stripe.Customer `json:"customer"`
}

func Bookmark(build_id, user_id string) error {

	build, err := build.GetById(dbConfig.Client, build_id)

	if err != nil {
		return err
	}

	user, err := user.FindCurrentUser(dbConfig.Client, user_id)

	if err != nil {
		return err
	}

	user.Bookmark(dbConfig.Client, build)

	return nil
}

func Unbookmark(build_id, user_id string) error {

	build, err := build.GetById(dbConfig.Client, build_id)

	if err != nil {
		return err
	}

	user, err := user.FindCurrentUser(dbConfig.Client, user_id)

	if err != nil {
		return err
	}

	user.Unbookmark(dbConfig.Client, build)

	return nil
}

func GetCurrentUser(id string) (user.User, error) {
	return user.FindCurrentUser(dbConfig.Client, id)
}

func GetCurrentUserWithStripe(id string) (GetCurrentUserWithStripeResponse, error) {

	var resp GetCurrentUserWithStripeResponse

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")

	stripe.Key = stripe_key

	domainUser, err := GetCurrentUser(id)

	if err != nil {
		return resp, err
	}

	resp.User = domainUser

	if domainUser.CustomerId != "" {
		params := &stripe.CustomerParams{}
		params.AddExpand("subscriptions.data.plan.product")

		cus, err := customer.Get(domainUser.CustomerId, params)

		if err != nil {
			return resp, err
		}
		resp.Customer = cus

	}

	return resp, nil

}

func GetAccount(c *gin.Context) {
	user, _ := c.Get("user")

	acc := services.GetUserAccount(user.(*clerk.User).ID)

	c.JSON(200, acc)

}

func DeleteUser(u *clerk.User) error {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	domainUser, err := user.FindCurrentUser(dbConfig.Client, u.ID)

	if err != nil {
		return err
	}

	var cus_sub *stripe.Subscription

	if domainUser.CustomerId != "" {
		params := &stripe.CustomerParams{}
		params.AddExpand("subscriptions")

		cus, err := customer.Get(domainUser.CustomerId, params)

		if err != nil {
			return err
		}

		if len(cus.Subscriptions.Data) > 0 {
			sub, err := subscription.Update(cus.Subscriptions.Data[0].ID, &stripe.SubscriptionParams{
				CancelAtPeriodEnd: stripe.Bool(true),
			})

			if err != nil {
				return err
			}

			cus_sub = sub
		}
	}

	// delete at end of period or immediately if no subscription
	if cus_sub != nil {
		domainUser.DeletedAt = gorm.DeletedAt{
			Valid: true,
			Time:  time.Unix(cus_sub.CurrentPeriodEnd, 0),
		}

		domainUser.Update(dbConfig.Client)

	} else {
		res, err := utils.ClerkClient.Users().Delete(domainUser.Uuid)

		if err != nil {
			fmt.Println("Error deleting user: ", err)
			return err
		}

		if res.Deleted {
			services.DeleteUser(&domainUser)
		}

	}

	return nil
}

func RestoreUser(u *clerk.User) error {
	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key
	domainUser, err := user.FindCurrentUser(dbConfig.Client, u.ID)

	if err != nil {
		return err
	}

	if domainUser.CustomerId != "" {
		params := &stripe.CustomerParams{}
		params.AddExpand("subscriptions")

		cus, err := customer.Get(domainUser.CustomerId, params)

		if err != nil {
			return err
		}

		_, err = subscription.Update(cus.Subscriptions.Data[0].ID, &stripe.SubscriptionParams{
			CancelAtPeriodEnd: stripe.Bool(false),
		})

		if err != nil {
			return err
		}

	}

	domainUser.DeletedAt = gorm.DeletedAt{
		Valid: false,
		Time:  time.Unix(0, 0),
	}

	domainUser.Update(dbConfig.Client)

	return nil

}
