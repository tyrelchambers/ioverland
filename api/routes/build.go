package routes

import (
	"api/controllers"
	"api/domain/build"
	"api/middleware"
	"fmt"

	"github.com/labstack/echo/v4"
)

func CreateBuild(c echo.Context) error {
	user, err := middleware.Authorize(c)
	if err != nil {
		return err
	}

	var reqBody build.Build

	if err := c.Bind(&reqBody); err != nil {
		fmt.Println(err)
		return err
	}

	if reqBody.Name == "" {
		return echo.NewHTTPError(400, "Build name is required")
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

func RemoveImage(c echo.Context) error {
	id := c.Param("id")
	build_id := c.Param("build_id")
	url := c.QueryParam("url")

	err := controllers.RemoveImage(build_id, id)
	err = controllers.Revert(c, url)

	if err != nil {
		return echo.NewHTTPError(500, err)
	}

	return c.String(200, "success")

}

func IncrementViews(c echo.Context) error {
	id := c.Param("id")

	controllers.IncrementViews(id)

	return c.String(200, "success")
}
