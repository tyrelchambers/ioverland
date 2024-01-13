package controllers

import (
	dbConfig "api/db"
	"api/services/build_service"
	"api/services/user_service"
	"api/utils"
	"net/http"
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
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	user, _ := c.Get("user")

	build, err := build_service.GetById(dbConfig.Client, body.BuildId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [BOOKMARK] Error getting build",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	u, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [BOOKMARK] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = u.Bookmark(dbConfig.Client, build)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [BOOKMARK] Error bookmarking build",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")

}

func Unbookmark(c *gin.Context) {
	var body struct {
		BuildId string `json:"build_id"`
	}

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	user, _ := c.Get("user")

	build, err := build_service.GetById(dbConfig.Client, body.BuildId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [UNBOOKMARK] Error getting build",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	u, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [UNBOOKMARK] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = u.Unbookmark(dbConfig.Client, build)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [UNBOOKMARK] Error unbookmarking build",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func GetCurrentUser(c *gin.Context) {
	user, _ := c.Get("user")

	u, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [GETCURRENTUSER] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, u)
}

func GetAccount(c *gin.Context) {
	user, _ := c.Get("user")

	acc, err := user_service.GetUserAccount(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [GETACCOUNT] Error getting account",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, acc)

}

func DeleteUser(c *gin.Context) {
	user, _ := c.Get("user")

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	domainUser, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [DELETEUSER] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	var cus_sub *stripe.Subscription

	if domainUser.CustomerId != "" {
		params := &stripe.CustomerParams{}
		params.AddExpand("subscriptions")

		cus, err := customer.Get(domainUser.CustomerId, params)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [USER] [DELETEUSER] Error getting customer",
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
			})
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

		if len(cus.Subscriptions.Data) > 0 {
			sub, err := subscription.Update(cus.Subscriptions.Data[0].ID, &stripe.SubscriptionParams{
				CancelAtPeriodEnd: stripe.Bool(true),
			})

			if err != nil {
				utils.CaptureError(c, &utils.CaptureErrorParams{
					Message: "[CONTROLLERS] [USER] [DELETEUSER] Error deleting subscription",
					Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
				})
				c.String(http.StatusInternalServerError, err.Error())
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

		err = domainUser.Update(dbConfig.Client)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [USER] [DELETEUSER] Error updating user with DeletedAt field during subscription delete",
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
			})
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

	} else {
		res, err := utils.ClerkClient.Users().Delete(domainUser.Uuid)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [USER] [DELETEUSER] Error deleting user from clerk",
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
			})
			c.String(http.StatusInternalServerError, err.Error())
		}

		if res.Deleted {
			err := user_service.DeleteUser(&domainUser)

			if err != nil {
				utils.CaptureError(c, &utils.CaptureErrorParams{
					Message: "[CONTROLLERS] [USER] [DELETEUSER] Error deleting user from database",
					Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
				})
				c.String(http.StatusInternalServerError, err.Error())
				return
			}
		}

	}

	c.String(http.StatusOK, "success")
}

func RestoreUser(c *gin.Context) {
	user, _ := c.Get("user")

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key
	domainUser, err := user_service.FindCurrentUser(dbConfig.Client, user.(*clerk.User).ID)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [RESTOREUSER] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	if domainUser.CustomerId != "" {
		params := &stripe.CustomerParams{}
		params.AddExpand("subscriptions")

		cus, err := customer.Get(domainUser.CustomerId, params)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [USER] [RESTOREUSER] Error getting customer",
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
			})
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

		_, err = subscription.Update(cus.Subscriptions.Data[0].ID, &stripe.SubscriptionParams{
			CancelAtPeriodEnd: stripe.Bool(false),
		})

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [USER] [RESTOREUSER] Error restoring subscription",
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID, "subscription_id": cus.Subscriptions.Data[0].ID},
			})
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

	}

	domainUser.DeletedAt = gorm.DeletedAt{
		Valid: false,
		Time:  time.Unix(0, 0),
	}

	err = domainUser.Update(dbConfig.Client)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [RESTOREUSER] Error updating user with DeletedAt field during subscription restore",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}
