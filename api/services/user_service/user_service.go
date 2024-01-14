package user_service

import (
	dbConfig "api/db"
	"api/models"
	"api/services/build_service"
	"api/utils"
	"fmt"
	"time"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/customer"
	"gorm.io/gorm"
)

type User struct {
	models.User
}

type GetCurrentUserWithStripeResponse struct {
	User     models.User      `json:"user"`
	Customer *stripe.Customer `json:"customer"`
}

type PlanLimit struct {
	MaxBuilds    int64  `json:"max_builds"`
	MaxFiles     int64  `json:"max_files"`
	VideoSupport bool   `json:"video"`
	MaxFileSize  string `json:"max_file_size"`
}
type AccountResponse struct {
	HasSubscription bool `json:"has_subscription"`
	Subscription    struct {
		ID              string     `json:"id"`
		Name            string     `json:"name"`
		Price           int64      `json:"price"`
		DeletedAt       *time.Time `json:"deleted_at"`
		NextInvoiceDate time.Time  `json:"next_invoice_date"`
	} `json:"subscription"`
	DeletedAt       *gorm.DeletedAt       `json:"deleted_at"`
	TotalBuilds     int64                 `json:"total_builds"`
	BuildsRemaining int64                 `json:"builds_remaining"`
	PlanLimits      PlanLimit             `json:"plan_limits"`
	MaxBuilds       int64                 `json:"max_builds"`
	Builds          []build_service.Build `json:"builds"`
	MaxPublicBuilds int                   `json:"max_public_builds"`
	User            struct {
		Bio    string        `json:"bio"`
		Banner *models.Media `json:"banner"`
	} `json:"user"`
}

var Plan_limits = map[string]PlanLimit{
	"Free": {
		MaxFiles:     6,
		MaxFileSize:  "50mb",
		VideoSupport: false,
		MaxBuilds:    1,
	},
	"Explorer": {
		MaxFiles:     16,
		MaxFileSize:  "100mb",
		VideoSupport: true,
		MaxBuilds:    5,
	},
	"Overlander": {
		MaxFiles:     25,
		MaxFileSize:  "300mb",
		VideoSupport: false,
		MaxBuilds:    -1,
	},
}

func GetUserAccount(db *gorm.DB, user_id string) (AccountResponse, error) {
	var resp AccountResponse

	utils.StripeClientInit()

	domainUser, err := FindCurrentUser(dbConfig.Client, user_id)

	if err != nil {
		fmt.Println(err)
		return resp, err
	}

	var userBuildsCount int64
	err = db.Table("builds").Where("user_id = ?", domainUser.Uuid).Count(&userBuildsCount).Error

	if err != nil {
		fmt.Println(err)
		return resp, err
	}

	userBuilds, err := build_service.AllByUser(dbConfig.Client, user_id)

	if err != nil {
		fmt.Println(err)
		return resp, err
	}

	resp.Builds = userBuilds

	var cus stripe.Customer

	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions.data.plan.product")

	if domainUser.CustomerId != "" {
		customer, err := customer.Get(domainUser.CustomerId, params)

		if err != nil {
			fmt.Println(err)
			return resp, err
		}

		cus = *customer
	}

	if cus.Subscriptions != nil && cus.Subscriptions.TotalCount > 0 {
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

	resp.TotalBuilds = userBuildsCount

	if resp.HasSubscription {
		pl := Plan_limits[cus.Subscriptions.Data[0].Plan.Product.Name]
		resp.PlanLimits = pl

		if pl.MaxBuilds == -1 {
			resp.BuildsRemaining = -1
		} else {
			resp.BuildsRemaining = pl.MaxBuilds - userBuildsCount
		}

	} else {
		remainingBuilds := 1 - userBuildsCount
		resp.PlanLimits = Plan_limits["Free"]

		if remainingBuilds < 0 {
			remainingBuilds = 0
		} else {
			resp.BuildsRemaining = remainingBuilds
		}
	}

	resp.MaxPublicBuilds = domainUser.MaxPublicBuilds
	resp.User.Bio = domainUser.Bio
	resp.User.Banner = domainUser.Banner

	return resp, nil
}

func DeleteUser(db *gorm.DB, user models.User) error {
	err := db.Unscoped().Delete(&user).Error
	return err
}

func DeleteUserFromClerk(user *clerk.User) {
	utils.ClerkClient.Users().Delete(user.ID)
}

func GetUserByUuid(db *gorm.DB, id string) (User, error) {
	var user User
	err := db.Preload("Bookmarks.Banner", "type='banner'").Preload("Builds.Banner", "type='banner'").Preload("Banner").Unscoped().Where("uuid = ?", id).First(&user).Error
	return user, err
}

func Create(db *gorm.DB, user *models.User) error {
	return db.Create(user).Error
}

func Bookmark(db *gorm.DB, u models.User, build build_service.Build) error {
	db.Model(&u).Association("Bookmarks").Append(&build)

	if db.Error != nil {
		return db.Error
	}

	return nil
}

func Unbookmark(db *gorm.DB, u models.User, build build_service.Build) error {
	db.Model(&u).Association("Bookmarks").Delete(&build)

	if db.Error != nil {
		return db.Error
	}

	return nil
}

func FindCurrentUser(db *gorm.DB, uuid string) (models.User, error) {
	var user models.User

	err := db.Preload("Bookmarks.Banner", "type='banner'").Preload("Builds.Banner", "type='banner'").Preload("Banner").Unscoped().Where("uuid = ?", uuid).First(&user).Error
	return user, err
}

func Update(db *gorm.DB, u models.User) error {
	return db.Session(&gorm.Session{FullSaveAssociations: true}).Save(&u).Error
}

func FindUserByCustomerId(db *gorm.DB, customerId string) (models.User, error) {
	var user models.User
	err := db.Where("customer_id = ?", customerId).First(&user).Error
	return user, err
}

func (u User) BuildCount(db *gorm.DB) (int64, error) {
	var builds int64
	err := db.Table("builds").Where("user_id = ?", u.Uuid).Count(&builds).Error
	return builds, err
}

func GetUsersToDelete(db *gorm.DB, time time.Time) ([]User, error) {
	var users []User
	err := db.Unscoped().Where("deleted_at IS NOT NULL and deleted_at < ?", time).Find(&users).Error
	return users, err
}

func (u User) PermanentlyDelete(db *gorm.DB) error {
	return db.Unscoped().Delete(&u).Error
}

func (u User) ResetDeletedAt(db *gorm.DB) error {
	return db.Model(&u).Update("deleted_at", nil).Error
}

func GetCurrentUserWithStripe(id string) (GetCurrentUserWithStripeResponse, error) {

	var resp GetCurrentUserWithStripeResponse

	stripe_key := utils.GoDotEnvVariable("STRIPE_TEST_KEY")

	stripe.Key = stripe_key

	domainUser, err := FindCurrentUser(dbConfig.Client, id)

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

func RemoveImage(db *gorm.DB, media_id int) error {
	db.Table("media").Where("id = ?", media_id).Delete(&models.Media{})

	return nil
}
