package routes

import (
	"api/controllers"
	"api/middleware"
	"fmt"
	"io"

	"github.com/labstack/echo/v4"
)

func Upload(c echo.Context) error {
	file, err := c.FormFile("file")

	fmt.Println(c.Request().Header.Get("file-type"))

	if err != nil {
		return echo.NewHTTPError(500, err)
	}

	user, err := middleware.Authorize(c)

	url, err := controllers.Process(file, user.ID, c)

	if err != nil {
		return echo.NewHTTPError(500, err)
	}

	return c.String(200, url)
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
