package main

import (
	"api/db"
	"api/domain/build"
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
	err := db.Client.AutoMigrate(&build.Build{}, &build.Trip{}, &build.Vehicle{}, &build.Modification{}, &build.Media{})

	clerkId := utils.GoDotEnvVariable("CLERK_ID")
	client, err := clerk.NewClient(fmt.Sprint(clerkId))

	utils.ClerkClient = client

	if err != nil {
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

	build.POST("/", routes.CreateBuild)
	build.GET("/:id", routes.GetById)
	build.PUT("/:id", routes.Update)
	build.DELETE("/:build_id/image/:id", routes.RemoveImage)

	builds.GET("/user/:user_id", routes.GetBuilds)

	upload.POST("/process", routes.Upload)
	upload.POST("/revert", routes.Revert)

	http.ListenAndServe(":8000", r)
}
