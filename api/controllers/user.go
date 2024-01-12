package controllers

import (
	dbConfig "api/db"
	"api/services/build_service"
	"api/services/user_service"
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

func Bookmark(c *gin.Context) {
	var body struct {
		BuildId string `json:"build_id"`
	}

	if err := c.Bind(&body); err != nil {
		c.String(500, err.Error())
		return
	}

	user, _ := c.Get("user")

	build, err := build_service.GetById(dbConfig.Client, body.BuildId)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	u, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	u.Bookmark(dbConfig.Client, build)

	c.String(200, "success")

}

func Unbookmark(c *gin.Context) {
	var body struct {
		BuildId string `json:"build_id"`
	}

	if err := c.Bind(&body); err != nil {
		c.String(500, err.Error())
		return
	}

	user, _ := c.Get("user")

	build, err := build_service.GetById(dbConfig.Client, body.BuildId)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	u, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	u.Unbookmark(dbConfig.Client, build)

	c.String(200, "success")
}

func GetCurrentUser(c *gin.Context) {
	user, _ := c.Get("user")

	u, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.JSON(200, u)
}

func GetAccount(c *gin.Context) {
	user, _ := c.Get("user")

	acc := user_service.GetUserAccount(dbConfig.Client, user.(*clerk.User).ID)

	c.JSON(200, acc)

}

func DeleteUser(c *gin.Context) {
	user, _ := c.Get("user")

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	domainUser, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		fmt.Println("Error finding user: ", err)
		c.String(500, err.Error())
		return
	}

	var cus_sub *stripe.Subscription

	if domainUser.CustomerId != "" {
		params := &stripe.CustomerParams{}
		params.AddExpand("subscriptions")

		cus, err := customer.Get(domainUser.CustomerId, params)

		if err != nil {
			fmt.Println("Error getting customer: ", err)
			c.String(500, err.Error())
			return
		}

		if len(cus.Subscriptions.Data) > 0 {
			sub, err := subscription.Update(cus.Subscriptions.Data[0].ID, &stripe.SubscriptionParams{
				CancelAtPeriodEnd: stripe.Bool(true),
			})

			if err != nil {
				fmt.Println("Error updating subscription: ", err)
				c.String(500, err.Error())
				return
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
			c.String(500, err.Error())
		}

		if res.Deleted {
			user_service.DeleteUser(&domainUser)
		}

	}

	c.String(200, "success")
}

func RestoreUser(c *gin.Context) {
	user, _ := c.Get("user")

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key
	domainUser, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		fmt.Println("Error finding user: ", err)
		c.String(500, err.Error())
		return
	}

	if domainUser.CustomerId != "" {
		params := &stripe.CustomerParams{}
		params.AddExpand("subscriptions")

		cus, err := customer.Get(domainUser.CustomerId, params)

		if err != nil {
			fmt.Println("Error getting customer: ", err)
			c.String(500, err.Error())
			return
		}

		_, err = subscription.Update(cus.Subscriptions.Data[0].ID, &stripe.SubscriptionParams{
			CancelAtPeriodEnd: stripe.Bool(false),
		})

		if err != nil {
			fmt.Println("Error updating subscription: ", err)
			c.String(500, err.Error())
			return
		}

	}

	domainUser.DeletedAt = gorm.DeletedAt{
		Valid: false,
		Time:  time.Unix(0, 0),
	}

	domainUser.Update(dbConfig.Client)

}
