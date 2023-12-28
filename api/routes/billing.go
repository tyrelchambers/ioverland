package routes

import (
	"api/controllers"
	"api/middleware"

	"github.com/labstack/echo/v4"
)

func CreateCheckout(c echo.Context) error {
	user, err := middleware.Authorize(c)

	if err != nil {
		return err
	}

	url := controllers.CreateCheckout(user)

	return c.JSON(200, url)
}
