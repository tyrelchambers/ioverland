package main

import (
	"api/controllers"
	dbConfig "api/db"
	"api/domain/build"
	"api/domain/upload"
	"api/domain/user"
	"api/middleware"
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
	err := dbConfig.Client.AutoMigrate(&build.Build{}, &build.Trip{}, &build.Vehicle{}, &build.Modification{}, &build.Media{}, &user.User{})

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

	buildG.POST("", AuthRequired, routes.CreateBuild)
	buildG.GET("/:build_id", routes.GetById)
	buildG.PUT("/:build_id", AuthRequired, routes.Update)
	buildG.GET("/:build_id/edit", AuthRequired, routes.BuildEditSettings)
	buildG.POST("/:build_id/view", routes.IncrementViews)
	buildG.POST("/:build_id/like", AuthRequired, routes.Like)
	buildG.POST("/:build_id/dislike", AuthRequired, routes.Dislike)
	buildG.DELETE("/:build_id/delete", AuthRequired, routes.Delete)
	buildG.DELETE("/:build_id/image/:media_id", AuthRequired, routes.RemoveImage)

	buildsG.GET("/user/:user_id", AuthRequired, routes.GetBuilds)

	billingG.POST("/checkout", AuthRequired, routes.CreateCheckout)
	billingG.GET("/checkout", AuthRequired, routes.CreateCheckout)
	billingG.POST("/portal", AuthRequired, routes.CreateCustomerPortal)

	uploadG.POST("/process", UploadAuth, upload.UploadRoute)
	uploadG.PATCH("", UploadAuth, upload.UploadRoute)
	uploadG.POST("/revert", UploadAuth, upload.UploadRoute)

	userG.POST("/:build_id/bookmark", AuthRequired, routes.Bookmark)
	userG.POST("/:build_id/remove-bookmark", AuthRequired, routes.Unbookmark)
	userG.GET("/me", AuthRequired, routes.GetCurrentUser)
	userG.GET("/me/account", AuthRequired, controllers.GetAccount)
	userG.DELETE("/me", AuthRequired, routes.DeleteUser)
	userG.POST("/me/restore", AuthRequired, routes.RestoreUser)

	webhooksG.POST("", routes.Webhooks)
	webhooksG.POST("/stripe", routes.StripeWebhooks)

	exploreG.GET("", routes.Explore)

	api.GET("/search", routes.Search)

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
				usersToDelete, err := user.GetUsersToDelete(dbConfig.Client, time.Now())

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
