package services

import (
	dbConfig "api/db"
	"api/domain/build"
	"api/domain/user"
	"api/utils"
	"fmt"
	"time"

	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/customer"
	"gorm.io/gorm"
)

type PlanLimit struct {
	MaxBuilds    int64  `json:"max_builds"`
	MaxFiles     int64  `json:"max_files"`
	VideoSupport bool   `json:"video"`
	MaxFileSize  string `json:"max_file_size"`
}
type AccountResponse struct {
	user.User
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
	PlanLimits      PlanLimit       `json:"plan_limits"`
	MaxBuilds       int64           `json:"max_builds"`
	Builds          []build.Build   `json:"builds"`
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

func GetUserAccount(user_id string) AccountResponse {
	var resp AccountResponse

	utils.StripeClientInit()

	domainUser, err := user.FindCurrentUser(dbConfig.Client, user_id)

	if err != nil {
		fmt.Println(err)
	}

	userBuildsCount, err := domainUser.BuildCount(dbConfig.Client)
	if err != nil {
		fmt.Println(err)
	}

	userBuilds, err := build.AllByUser(dbConfig.Client, user_id)

	if err != nil {
		fmt.Println(err)
	}

	resp.Builds = userBuilds

	var cus stripe.Customer

	params := &stripe.CustomerParams{}
	params.AddExpand("subscriptions.data.plan.product")

	if domainUser.CustomerId != "" {
		customer, err := customer.Get(domainUser.CustomerId, params)

		if err != nil {
			fmt.Println(err)
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

	return resp
}
