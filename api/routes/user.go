package routes

import (
	"api/controllers"
	"api/middleware"

	"github.com/labstack/echo/v4"
)

func Bookmark(c echo.Context) error {
	build_id := c.Param("build_id")
	user, err := middleware.Authorize(c)

	if err != nil {
		return err
	}

	err = controllers.Bookmark(build_id, user.ID)

	return c.String(200, "success")
}
