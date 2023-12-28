package routes

import (
	"api/controllers"
	"api/middleware"

	"github.com/labstack/echo/v4"
)

func Bookmark(c echo.Context) error {
	var body struct {
		BuildId string `json:"build_id"`
	}

	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(500, err)
	}

	user, err := middleware.Authorize(c)

	if err != nil {
		return err
	}

	err = controllers.Bookmark(body.BuildId, user.ID)

	return c.String(200, "success")
}

func Unbookmark(c echo.Context) error {
	var body struct {
		BuildId string `json:"build_id"`
	}

	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(500, err)
	}

	user, err := middleware.Authorize(c)

	if err != nil {
		return err
	}

	err = controllers.Unbookmark(body.BuildId, user.ID)

	return c.String(200, "success")
}

func GetCurrentUser(c echo.Context) error {
	user, err := middleware.Authorize(c)

	if err != nil {
		return err
	}

	domainUser, err := controllers.GetCurrentUser(user.ID)

	if err != nil {
		return err
	}

	return c.JSON(200, domainUser)
}
