package routes

import (
	"api/controllers"

	"github.com/gin-gonic/gin"
)

func Search(c *gin.Context) {
	query := c.Query("query")

	results := controllers.Search(query)

	c.JSON(200, gin.H{"results": results})
}
