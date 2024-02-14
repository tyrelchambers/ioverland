package main

import (
	adventure_controller "api/controllers/adventure"
	billing_controller "api/controllers/billing"
	build_controller "api/controllers/build"
	builds_controller "api/controllers/builds"
	comment_controller "api/controllers/comment"
	explore_controller "api/controllers/explore"
	feedback_controller "api/controllers/feedback"
	health_controller "api/controllers/health"
	search_controller "api/controllers/search"
	upload_controller "api/controllers/upload"
	user_controller "api/controllers/user"
	webhooks_controller "api/controllers/webhooks"
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
	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
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
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	_, err := utils.ClerkClient.Users().Read(user_id)

	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[MIDDLEWARE] [AUTHENTICATION] [NO CLERK USER] " + err.Error(),
		})
		return
	}

	c.Set("clerk-user-id", user_id)

	c.Next()
}

func main() {
	// To initialize Sentry's handler, you need to initialize Sentry itself beforehand
	if err := sentry.Init(sentry.ClientOptions{
		Dsn:           utils.GoDotEnvVariable("SENTRY_DSN"),
		EnableTracing: utils.GoDotEnvVariable("NODE_ENV") == "production",
		// Set TracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production,
		TracesSampleRate: 1.0,
		Environment:      utils.GoDotEnvVariable("NODE_ENV"),
	}); err != nil {
		fmt.Printf("Sentry initialization failed: %v", err)
	}

	dbConfig.Init()
	err := dbConfig.Client.AutoMigrate(&models.Build{}, &models.Trip{}, &models.Modification{}, &models.Media{}, &models.User{}, &models.Comment{}, &models.History{}, &models.Day{})

	if err != nil {
		sentry.CaptureMessage("[MAIN] [AUTOMIGRATE] " + err.Error())
		os.Exit(1)
	}

	clerkId := utils.GoDotEnvVariable("CLERK_ID")
	client, err := clerk.NewClient(fmt.Sprint(clerkId))

	utils.ClerkClient = client

	if err != nil {
		sentry.CaptureMessage("[MAIN] [CLERK INIT] " + err.Error())
		os.Exit(1)
	}

	wh_secret := utils.GoDotEnvVariable("CLERK_WH_SECRET")

	if wh_secret == "" {
		sentry.CaptureMessage("[MAIN] [WH SECRET] " + err.Error())
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
		sentry.CaptureMessage("[MAIN] [BUNNY INIT] " + err.Error())
		log.Fatal(err)
	}

	os.Mkdir("temp-uploads", 0755)

	r := gin.Default()

	r.Use(cors.New(cors.Config{AllowOrigins: []string{"http://localhost:3000", "https://iover.land", "https://wildbarrens.com"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Access-Control-Allow-Credentials", "file-type", "Authorization", "Upload-Length", "Upload-Offset", "Upload-Name", "Upload-Length", "Clerk-User-Id"},
		AllowCredentials: true,
		AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
		ExposeHeaders:    []string{"Content-Type", "Accept", "Cookie", "Access-Control-Allow-Credentials"}}))

	r.Use(sentrygin.New(sentrygin.Options{
		Repanic: true,
	}))

	api := r.Group("/api")
	buildG := api.Group("/build")
	buildsG := api.Group("/builds")
	uploadG := api.Group("/upload")
	webhooksG := api.Group("/webhooks")
	userG := api.Group("/user")
	billingG := api.Group("/billing")
	exploreG := api.Group("/explore")
	commentG := api.Group("/comment")
	adventuresG := api.Group("/adventures")
	adventureG := api.Group("/adventure")

	adventuresG.POST("/new", AuthRequired, adventure_controller.CreateNewAdventure)
	adventuresG.GET("/:user_id", AuthRequired, adventure_controller.GetUserAdventures)

	adventureG.GET("/:adventure_id", AuthRequired, adventure_controller.GetAdventure)
	adventureG.DELETE("/:adv_id/image/:media_id", AuthRequired, adventure_controller.RemoveImage)
	adventureG.PUT("/:adv_id", AuthRequired, adventure_controller.Update)
	adventureG.DELETE("/:adv_id/build/:build_id", AuthRequired, adventure_controller.RemoveBuild)
	adventureG.DELETE("/:adv_id/day/:day_id", AuthRequired, adventure_controller.RemoveDay)
	adventureG.DELETE("/:adv_id", AuthRequired, adventure_controller.Delete)

	buildG.POST("", AuthRequired, build_controller.CreateBuild)
	buildG.GET("/:build_id", build_controller.GetById)
	buildG.PUT("/:build_id", AuthRequired, build_controller.UpdateBuild)
	buildG.GET("/:build_id/edit", AuthRequired, build_controller.BuildEditSettings)
	buildG.POST("/:build_id/view", build_controller.IncrementViews)
	buildG.POST("/:build_id/like", AuthRequired, build_controller.Like)
	buildG.POST("/:build_id/dislike", AuthRequired, build_controller.Dislike)
	buildG.DELETE("/:build_id/delete", AuthRequired, build_controller.DeleteBuild)
	buildG.DELETE("/:build_id/image/:media_id", AuthRequired, build_controller.RemoveImage)
	buildG.DELETE("/:build_id/:trip_id/delete", AuthRequired, build_controller.DeleteTrip)
	buildG.GET("/:build_id/comments", build_controller.GetComments)

	buildsG.GET("/user/:user_id", AuthRequired, builds_controller.GetUserBuilds)

	billingG.POST("/checkout", AuthRequired, billing_controller.CreateCheckout)
	billingG.GET("/checkout", AuthRequired, billing_controller.CreateCheckout)
	billingG.POST("/portal", AuthRequired, billing_controller.CreateCustomerPortal)

	commentG.POST("/create", AuthRequired, comment_controller.CreateComment)
	commentG.PATCH("/:comment_id/like", AuthRequired, comment_controller.LikeComment)
	commentG.PATCH("/:comment_id/dislike", AuthRequired, comment_controller.RemoveLike)
	commentG.DELETE("/:comment_id/delete", AuthRequired, comment_controller.DeleteComment)

	uploadG.POST("/process", UploadAuth, upload_controller.ProcessUpload)
	uploadG.PATCH("", UploadAuth, upload_controller.ProcessUpload)
	uploadG.POST("/revert", UploadAuth, upload_controller.Revert)

	userG.POST("/me/bookmark", AuthRequired, user_controller.Bookmark)
	userG.POST("/me/remove-bookmark", AuthRequired, user_controller.Unbookmark)
	userG.GET("/me", AuthRequired, user_controller.GetCurrentUser)
	userG.GET("/me/account", AuthRequired, user_controller.GetAccount)
	userG.DELETE("/me", AuthRequired, user_controller.DeleteUser)
	userG.POST("/me/restore", AuthRequired, user_controller.RestoreUser)
	userG.GET("/:username", user_controller.GetUserPublicProfile)
	userG.POST("/:username/follow", AuthRequired, user_controller.FollowUser)
	userG.POST("/:username/unfollow", AuthRequired, user_controller.UnfollowUser)
	userG.POST("/:username/view-profile", user_controller.ViewProfile)
	userG.PATCH("/me/update", AuthRequired, user_controller.UpdateUser)
	userG.POST("/me/remove-banner", AuthRequired, user_controller.RemoveBanner)

	webhooksG.POST("", webhooks_controller.Webhooks)
	webhooksG.POST("/stripe", webhooks_controller.StripeWebhooks)

	exploreG.GET("", explore_controller.Explore)

	api.GET("/search", search_controller.Search)

	r.GET("/health", health_controller.Health)
	api.POST("/feedback", feedback_controller.Feedback)

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
