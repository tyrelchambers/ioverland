package user_controller

import (
	dbConfig "api/db"
	"api/models"
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

	user := utils.UserFromContext(c)

	build, err := build_service.GetById(dbConfig.Client, body.BuildId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [BOOKMARK] Error getting build",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	u, err := user_service.FindUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [BOOKMARK] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = user_service.Bookmark(dbConfig.Client, u, build)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [BOOKMARK] Error bookmarking build",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid, "build_id": body.BuildId},
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

	user := utils.UserFromContext(c)

	build, err := build_service.GetById(dbConfig.Client, body.BuildId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [UNBOOKMARK] Error getting build",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	u, err := user_service.FindUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [UNBOOKMARK] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = user_service.Unbookmark(dbConfig.Client, u, build)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [UNBOOKMARK] Error unbookmarking build",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid, "build_id": body.BuildId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func GetCurrentUser(c *gin.Context) {
	var resp struct {
		models.User
		Followers []*models.User `json:"followers"`
		Following []*models.User `json:"following"`
	}

	user := utils.UserFromContext(c)

	u, err := user_service.FindUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [GETCURRENTUSER] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	resp.User = *u

	followers, err := user_service.GetFollowers(dbConfig.Client, user)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [GETCURRENTUSER] Error getting followers",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	resp.Followers = followers

	following, err := user_service.GetFollowing(dbConfig.Client, user)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [GETCURRENTUSER] Error getting following",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	resp.Following = following

	c.JSON(http.StatusOK, resp)
}

func GetAccount(c *gin.Context) {
	user := utils.UserFromContext(c)
	acc, err := user_service.GetUserAccount(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [GETACCOUNT] Error getting account",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, acc)

}

func DeleteUser(c *gin.Context) {
	userParam, _ := c.Get("user")
	user := userParam.(*models.User)

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	domainUser, err := user_service.FindUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [DELETEUSER] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
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
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
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
					Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
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

		err = user_service.Update(dbConfig.Client, domainUser)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [USER] [DELETEUSER] Error updating user with DeletedAt field during subscription delete",
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
			})
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

	} else {
		res, err := utils.ClerkClient.Users().Delete(domainUser.Uuid)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [USER] [DELETEUSER] Error deleting user from clerk",
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
			})
			c.String(http.StatusInternalServerError, err.Error())
		}

		if res.Deleted {
			err := user_service.DeleteUser(dbConfig.Client, domainUser)

			if err != nil {
				utils.CaptureError(c, &utils.CaptureErrorParams{
					Message: "[CONTROLLERS] [USER] [DELETEUSER] Error deleting user from database",
					Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
				})
				c.String(http.StatusInternalServerError, err.Error())
				return
			}
		}

	}

	c.String(http.StatusOK, "success")
}

func RestoreUser(c *gin.Context) {
	user := utils.UserFromContext(c)

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

	if user.CustomerId != "" {
		params := &stripe.CustomerParams{}
		params.AddExpand("subscriptions")

		cus, err := customer.Get(user.CustomerId, params)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [USER] [RESTOREUSER] Error getting customer",
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
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
				Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid, "subscription_id": cus.Subscriptions.Data[0].ID},
			})
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

	}

	user.DeletedAt = gorm.DeletedAt{
		Valid: false,
		Time:  time.Unix(0, 0),
	}

	err := user_service.Update(dbConfig.Client, user)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [RESTOREUSER] Error updating user with DeletedAt field during subscription restore",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func GetUserPublicProfile(c *gin.Context) {
	type UserResp struct {
		Username  *string        `json:"username"`
		Avatar    string         `json:"avatar"`
		Builds    []models.Build `json:"builds"`
		CreatedAt time.Time      `json:"created_at"`
		Views     int            `json:"views"`
		Followers []*models.User `json:"followers"`
		Banner    *models.Media  `json:"banner"`
		Uuid      string         `json:"uuid"`
		Bio       string         `json:"bio"`
		Plan      string         `json:"plan"`
	}

	username := c.Param("username")

	user, err := user_service.FindByUsername(dbConfig.Client, username)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [GETUSERPUBLICPROFILE] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "username": username},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	followers, err := user_service.GetFollowers(dbConfig.Client, user)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [GETUSERPUBLICPROFILE] Error getting followers",
			Extra:   map[string]interface{}{"error": err.Error(), "username": username},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	sub, err := user_service.GetStripeSubscription(user.CustomerId)

	var sub_name string

	if sub != nil {
		sub_name = sub.Plan.Product.Name
	} else {
		sub_name = ""
	}

	userResp := UserResp{
		Username:  &user.Username,
		Avatar:    user.ImageUrl,
		CreatedAt: user.CreatedAt,
		Views:     user.Views,
		Followers: followers,
		Banner:    user.Banner,
		Uuid:      user.Uuid,
		Bio:       user.Bio,
		Plan:      sub_name,
	}

	for _, build := range user.Builds {
		if build.Public {
			userResp.Builds = append(userResp.Builds, build)
		}
	}

	c.JSON(http.StatusOK, userResp)
}

func UpdateUser(c *gin.Context) {
	var body struct {
		Bio      string       `json:"bio"`
		Banner   models.Media `json:"banner"`
		Username string       `json:"username"`
	}

	userParam, _ := c.Get("user")
	user := userParam.(*models.User)

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	u, err := user_service.FindUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [UPDATEUSER] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	u.Bio = body.Bio
	u.Username = body.Username

	if body.Banner.Url != "" {
		u.Banner = &body.Banner
	}

	err = user_service.Update(dbConfig.Client, u)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [UPDATEUSER] Error updating user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	_, err = utils.ClerkClient.Users().Update(user.Uuid, &clerk.UpdateUser{Username: &body.Username})

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [UPDATEUSER] Error updating user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")

}

func RemoveBanner(c *gin.Context) {
	var body struct {
		MediaId int `json:"media_id"`
	}

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	user := utils.UserFromContext(c)

	u, err := user_service.FindUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [REMOVEBANNER] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = user_service.RemoveImage(dbConfig.Client, body.MediaId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [REMOVEIMAGE] Error removing image",
			Extra:   map[string]interface{}{"error": err.Error(), "media_id": body.MediaId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	u.Banner = nil

	err = user_service.Update(dbConfig.Client, u)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [REMOVEBANNER] Error updating user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func FollowUser(c *gin.Context) {
	var body struct {
		UserToFollow string `json:"user_id"`
	}

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	user := utils.UserFromContext(c)

	u, err := user_service.FindUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [FOLLOWUSER] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	other_user, err := user_service.FindUser(dbConfig.Client, body.UserToFollow)

	err = user_service.Follow(dbConfig.Client, u, other_user)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [FOLLOWUSER] Error following user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func UnfollowUser(c *gin.Context) {
	var body struct {
		UserToUnfollow string `json:"user_id"`
	}

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	user := utils.UserFromContext(c)

	u, err := user_service.FindUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [FOLLOWUSER] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	other_user, err := user_service.FindUser(dbConfig.Client, body.UserToUnfollow)

	err = user_service.Unfollow(dbConfig.Client, u, other_user)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [FOLLOWUSER] Error following user",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func ViewProfile(c *gin.Context) {
	username := c.Param("username")

	u, err := user_service.FindByUsername(dbConfig.Client, username)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [VIEWPROFILE] Error getting user",
			Extra:   map[string]interface{}{"error": err.Error(), "username": username},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	u.Views = u.Views + 1

	err = user_service.Update(dbConfig.Client, u)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [VIEWPROFILE] Error updating user",
			Extra:   map[string]interface{}{"error": err.Error(), "username": username},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, "success")
}

func GetGroups(c *gin.Context) {
	user := utils.UserFromContext(c)

	groups, err := user_service.GetGroups(dbConfig.Client, user)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [USER] [GETGROUPS] Error getting groups",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, groups)
}
