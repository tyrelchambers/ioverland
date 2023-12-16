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

	var reqBody build.Build

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

func GetById(c echo.Context) error {
	id := c.Param("id")

	build, err := controllers.GetById(id)

	if err != nil {
		return echo.NewHTTPError(404, "Build not found")
	}

	return c.JSON(200, build)
}

func Update(c echo.Context) error {
	id := c.Param("id")

	var reqBody build.Build

	if err := c.Bind(&reqBody); err != nil {
		return err
	}

	updated_build, err := controllers.UpdateBuild(id, reqBody)

	if err != nil {
		return echo.NewHTTPError(500, err)
	}

	return c.JSON(200, updated_build)
}
