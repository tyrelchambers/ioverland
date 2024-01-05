package main

import (
	"api/db"
	"api/domain/build"
	"api/domain/user"
	"api/routes"
	"api/utils"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"git.sr.ht/~jamesponddotco/bunnystorage-go"
	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-co-op/gocron/v2"
)

func main() {

	db.Init()
	err := db.Client.AutoMigrate(&build.Build{}, &build.Trip{}, &build.Vehicle{}, &build.Modification{}, &build.Media{}, &user.User{})

	clerkId := utils.GoDotEnvVariable("CLERK_ID")
	client, err := clerk.NewClient(fmt.Sprint(clerkId))

	utils.ClerkClient = client

	if err != nil {
		os.Exit(1)
	}

	wh_secret := utils.GoDotEnvVariable("CLERK_WH_SECRET")

	if wh_secret == "" {
		os.Exit(1)
	}

	// Create new Config to be initialize a Client.
	cfg := &bunnystorage.Config{
		Application: &bunnystorage.Application{
			Name:    "iOverland",
			Version: "1.0.0",
			Contact: "tychambers3@gmail.com",
		},
		StorageZone: "ioverland",
		Key:         utils.GoDotEnvVariable("BUNNY_KEY"),
		ReadOnlyKey: utils.GoDotEnvVariable("BUNNY_READONLY"),
		Endpoint:    bunnystorage.EndpointNewYork,
	}

	// Create a new Client instance with the given Config.
	bunnyClient, err := bunnystorage.NewClient(cfg)

	utils.BunnyClient = bunnyClient

	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{AllowOrigins: []string{"http://localhost:3000", "https://iover.land"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Access-Control-Allow-Credentials", "file-type", "Authorization"},
		AllowCredentials: true,
		AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
		ExposeHeaders:    []string{"Content-Type", "Accept", "Cookie", "Access-Control-Allow-Credentials"}}))

	api := r.Group("/api")
	buildG := api.Group("/build")
	buildsG := api.Group("/builds")
	uploadG := api.Group("/upload")
	webhooksG := api.Group("/webhooks")
	userG := api.Group("/user")
	billingG := api.Group("/billing")
	exploreG := api.Group("/explore")

	buildG.POST("/", routes.CreateBuild)
	buildG.GET("/:build_id", routes.GetById)
	buildG.PUT("/:build_id", routes.Update)
	buildG.GET("/:build_id/edit", routes.BuildEditSettings)
	buildG.POST("/:build_id/view", routes.IncrementViews)
	buildG.POST("/:build_id/like", routes.Like)
	buildG.POST("/:build_id/dislike", routes.Dislike)
	buildG.DELETE("/:build_id/delete", routes.Delete)

	buildG.DELETE("/:build_id/image/:media_id", routes.RemoveImage)

	buildsG.GET("/user/:user_id", routes.GetBuilds)

	billingG.POST("/checkout", routes.CreateCheckout)
	billingG.POST("/portal", routes.CreateCustomerPortal)

	uploadG.POST("/process", routes.Upload)
	uploadG.POST("/revert", routes.Revert)

	userG.POST("/:build_id/bookmark", routes.Bookmark)
	userG.POST("/:build_id/remove-bookmark", routes.Unbookmark)
	userG.GET("/me", routes.GetCurrentUser)
	userG.GET("/me/account", routes.GetAccount)
	userG.DELETE("/me", routes.DeleteUser)
	userG.POST("/me/restore", routes.RestoreUser)

	webhooksG.POST("/", routes.Webhooks)
	webhooksG.POST("/stripe", routes.StripeWebhooks)

	exploreG.GET("/", routes.Explore)

	r.GET("/health", routes.Health)

	// create a scheduler
	s, err := gocron.NewScheduler()
	if err != nil {
		log.Fatal("Something went wrong with the scheduler: ", err)

	}

	// add a job to the scheduler
	_, err = s.NewJob(
		gocron.DailyJob(
			1,
			gocron.NewAtTimes(
				gocron.NewAtTime(0, 0, 0),
			),
		),
		gocron.NewTask(
			func() {
				usersToDelete, err := user.GetUsersToDelete(db.Client, time.Now())

				if err != nil {
					fmt.Println("Error getting users to delete: ", err)
					return
				}

				for _, user := range usersToDelete {
					_, err := utils.ClerkClient.Users().Delete(user.Uuid)

					if err != nil {
						fmt.Println("Error deleting user: ", err)
					}
				}

				if len(usersToDelete) > 0 {
					db.Client.Unscoped().Delete(&usersToDelete)
				}
			},
		),
	)
	if err != nil {
		log.Fatal("Something went wrong with starting the deletion task: ", err)
	}

	// start the scheduler
	s.Start()

	var port string

	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	} else {
		port = "8000"
	}

	fmt.Println("Listening on port " + port)

	r.Run(":" + port)
}
