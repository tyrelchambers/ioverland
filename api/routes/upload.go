package routes

import (
	"api/controllers"
	"api/middleware"
	"io"

	"github.com/labstack/echo/v4"
)

func Upload(c echo.Context) error {
	file, err := c.FormFile("file")

	if err != nil {
		return echo.NewHTTPError(500, err)
	}

	user, err := middleware.Authorize(c)

	media, err := controllers.Process(file, user.ID, c)

	if err != nil {
		return echo.NewHTTPError(500, err)
	}

	return c.JSON(200, media)
}

func Revert(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)

	requestBody := string(body)

	err = controllers.Revert(c, requestBody)

	if err != nil {
		return echo.NewHTTPError(500, err)
	}

	return c.String(200, "success")
}
