package routes

import "github.com/labstack/echo/v4"

func Health(c echo.Context) error {
	return c.String(200, "OK")
}
