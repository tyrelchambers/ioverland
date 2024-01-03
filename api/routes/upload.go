package routes

import (
	"api/controllers"
	"api/middleware"
	"fmt"
	"io"

	"github.com/gin-gonic/gin"
)

func Upload(c *gin.Context) {
	user, err := middleware.Authorize(c)

	if err != nil {
		fmt.Println(err)
		c.String(401, "Unauthorized")
		return
	}

	file, err := c.FormFile("file")

	if err != nil {
		c.String(500, err.Error())
		return
	}

	media, err := controllers.Process(file, user.ID, c)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.JSON(200, media)
}

func Revert(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)

	requestBody := string(body)

	err = controllers.Revert(c, requestBody)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}
