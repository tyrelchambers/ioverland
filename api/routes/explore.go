package routes

import (
	"api/controllers"

	"github.com/gin-gonic/gin"
)

func Explore(c *gin.Context) {

	data, err := controllers.Explore()

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.JSON(200, data)
}
