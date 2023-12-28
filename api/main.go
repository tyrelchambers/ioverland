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

	"git.sr.ht/~jamesponddotco/bunnystorage-go"
	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

	r.Use(cors.New(cors.Config{AllowOrigins: []string{"http://localhost:3000"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Access-Control-Allow-Credentials", "file-type"},
		AllowCredentials: true,
		AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
		ExposeHeaders:    []string{"Content-Type", "Accept", "Cookie", "Access-Control-Allow-Credentials"}}))

	api := r.Group("/api")
	build := api.Group("/build")
	builds := api.Group("/builds")
	upload := api.Group("/upload")
	webhooks := api.Group("/webhooks")
	user := api.Group("/user")
	billing := api.Group("/billing")

	build.POST("/", routes.CreateBuild)
	build.GET("/:build_id", routes.GetById)
	build.PUT("/:build_id", routes.Update)
	build.POST("/:build_id/view", routes.IncrementViews)
	build.POST("/:build_id/like", routes.Like)
	build.POST("/:build_id/dislike", routes.Dislike)
	build.DELETE("/:build_id/delete", routes.Delete)

	build.DELETE("/:build_id/image/:id", routes.RemoveImage)

	builds.GET("/user/:user_id", routes.GetBuilds)

	billing.GET("/checkout", routes.CreateCheckout)

	upload.POST("/process", routes.Upload)
	upload.POST("/revert", routes.Revert)

	user.POST("/:build_id/bookmark", routes.Bookmark)
	user.POST("/:build_id/remove-bookmark", routes.Unbookmark)
	user.GET("/me", routes.GetCurrentUser)
	user.GET("/me/stripe", routes.GetStripeAccount)

	webhooks.POST("/", routes.Webhooks)
	webhooks.POST("/stripe", routes.StripeWebhooks)

	r.Run(":8000")
}
