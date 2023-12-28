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
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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

	r := echo.New()

	r.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAccessControlAllowCredentials, "file-type"},
		AllowCredentials: true,
		AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
		ExposeHeaders:    []string{echo.HeaderContentType, echo.HeaderAccept, echo.HeaderCookie, echo.HeaderAccessControlAllowCredentials},
	}))

	api := r.Group("/api")
	build := api.Group("/build")
	builds := api.Group("/builds")
	upload := api.Group("/upload")
	webhooks := api.Group("/webhooks")
	user := api.Group("/user")

	build.POST("/", routes.CreateBuild)
	build.GET("/:id", routes.GetById)
	build.PUT("/:id", routes.Update)
	build.POST("/:id/view", routes.IncrementViews)
	build.POST("/:id/like", routes.Like)
	build.POST("/:id/dislike", routes.Dislike)
	build.DELETE("/:id/delete", routes.Delete)

	build.DELETE("/:build_id/image/:id", routes.RemoveImage)

	builds.GET("/user/:user_id", routes.GetBuilds)

	upload.POST("/process", routes.Upload)
	upload.POST("/revert", routes.Revert)

	webhooks.POST("/", routes.Webhooks)

	user.POST("/:build_id/bookmark", routes.Bookmark)

	http.ListenAndServe(":8000", r)
}
