package routes

import (
	"api/controllers"
	"api/domain/build"
	"api/middleware"

	"github.com/labstack/echo/v4"
)

func CreateBuild(c echo.Context) error {
	user, err := middleware.Authorize(c)
	if err != nil {
		return err
	}

	var reqBody build.BuildDto

	if err := c.Bind(&reqBody); err != nil {
		return err
	}

	reqBody.UserId = user.ID

	newBuild, err := controllers.Build(reqBody)

	if err != nil {
		c.JSON(500, err)
	}

	return c.JSON(200, newBuild)
}

func GetBuilds(c echo.Context) error {
	user_id := c.Param("user_id")

	builds, err := controllers.GetUserBuilds(user_id)

	if err != nil {
		c.JSON(500, err)
	}

	return c.JSON(200, builds)
}
