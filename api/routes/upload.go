package routes

import (
	"api/controllers"
	"api/middleware"
	"io"

	"github.com/gin-gonic/gin"
)

func Upload(c *gin.Context) {
	file, err := c.FormFile("file")

	if err != nil {
		c.String(500, err.Error())
	}

	user, err := middleware.Authorize(c)

	media, err := controllers.Process(file, user.ID, c)

	if err != nil {
		c.String(500, err.Error())
	}

	c.JSON(200, media)
}

func Revert(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)

	requestBody := string(body)

	err = controllers.Revert(c, requestBody)

	if err != nil {
		c.String(500, err.Error())
	}

	c.String(200, "success")
}
