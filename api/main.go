package main

import (
	"api/db"
	"api/domain/build"
	"api/routes"
	"api/utils"
	"fmt"
	"net/http"
	"os"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	db.Init()
	err := db.Client.AutoMigrate(&build.Build{}, &build.Trip{}, &build.Vehicle{}, &build.Modification{})

	clerkId := utils.GoDotEnvVariable("CLERK_ID")
	client, err := clerk.NewClient(fmt.Sprint(clerkId))

	utils.ClerkClient = client

	if err != nil {
		os.Exit(1)
	}

	if err != nil {
		panic(err)
	}
	r := echo.New()

	r.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAccessControlAllowCredentials},
		AllowCredentials: true,
		AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
		ExposeHeaders:    []string{echo.HeaderContentType, echo.HeaderAccept, echo.HeaderCookie, echo.HeaderAccessControlAllowCredentials},
	}))

	api := r.Group("/api")
	build := api.Group("/build")
	builds := api.Group("/builds")

	build.POST("/", routes.CreateBuild)

	builds.GET("/user/:user_id", routes.GetBuilds)

	http.ListenAndServe(":8000", r)
}
