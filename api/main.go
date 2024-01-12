package main

import (
	"api/controllers"
	dbConfig "api/db"
	"api/middleware"
	"api/models"
	"api/services/user_service"
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

func AuthRequired(c *gin.Context) {
	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	c.Set("user", user)
	c.Next()
}

func UploadAuth(c *gin.Context) {
	user_id := c.Request.Header.Get("Clerk-User-Id")

	if user_id == "" {
		c.String(401, "Unauthorized - no header")
		return
	}

	_, err := utils.ClerkClient.Users().Read(user_id)

	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	c.Set("clerk-user-id", user_id)

	c.Next()
}

func main() {

	dbConfig.Init()
	err := dbConfig.Client.AutoMigrate(&models.Build{}, &models.Trip{}, &models.Vehicle{}, &models.Modification{}, &models.Media{}, &models.User{})

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

	os.Mkdir("temp-uploads", 0755)

	r := gin.Default()

	r.Use(cors.New(cors.Config{AllowOrigins: []string{"http://localhost:3000", "https://iover.land"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Access-Control-Allow-Credentials", "file-type", "Authorization", "Upload-Length", "Upload-Offset", "Upload-Name", "Upload-Length", "Clerk-User-Id"},
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

	buildG.POST("", AuthRequired, controllers.CreateBuild)
	buildG.GET("/:build_id", controllers.GetById)
	buildG.PUT("/:build_id", AuthRequired, controllers.UpdateBuild)
	buildG.GET("/:build_id/edit", AuthRequired, controllers.BuildEditSettings)
	buildG.POST("/:build_id/view", controllers.IncrementViews)
	buildG.POST("/:build_id/like", AuthRequired, controllers.Like)
	buildG.POST("/:build_id/dislike", AuthRequired, controllers.Dislike)
	buildG.DELETE("/:build_id/delete", AuthRequired, controllers.DeleteBuild)
	buildG.DELETE("/:build_id/image/:media_id", AuthRequired, controllers.RemoveImage)

	buildsG.GET("/user/:user_id", AuthRequired, controllers.GetUserBuilds)

	billingG.POST("/checkout", AuthRequired, controllers.CreateCheckout)
	billingG.GET("/checkout", AuthRequired, controllers.CreateCheckout)
	billingG.POST("/portal", AuthRequired, controllers.CreateCustomerPortal)

	uploadG.POST("/process", UploadAuth, controllers.ProcessUpload)
	uploadG.PATCH("", UploadAuth, controllers.ProcessUpload)
	uploadG.POST("/revert", UploadAuth, controllers.Revert)

	userG.POST("/:build_id/bookmark", AuthRequired, controllers.Bookmark)
	userG.POST("/:build_id/remove-bookmark", AuthRequired, controllers.Unbookmark)
	userG.GET("/me", AuthRequired, controllers.GetCurrentUser)
	userG.GET("/me/account", AuthRequired, controllers.GetAccount)
	userG.DELETE("/me", AuthRequired, controllers.DeleteUser)
	userG.POST("/me/restore", AuthRequired, controllers.RestoreUser)

	webhooksG.POST("", controllers.Webhooks)
	webhooksG.POST("/stripe", controllers.StripeWebhooks)

	exploreG.GET("", controllers.Explore)

	api.GET("/search", controllers.Search)

	r.GET("/health", controllers.Health)

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
				usersToDelete, err := user_service.GetUsersToDelete(dbConfig.Client, time.Now())

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
					dbConfig.Client.Unscoped().Delete(&usersToDelete)
					fmt.Println("Deleted", len(usersToDelete), "users")
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
