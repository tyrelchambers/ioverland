package controllers

import (
	dbConfig "api/db"
	"api/services/build_service"
	"log"

	"github.com/gin-gonic/gin"
)

func Search(c *gin.Context) {
	query := c.Query("query")

	result, err := build_service.Search(dbConfig.Client, query)

	if err != nil {
		log.Println(err)
		c.String(500, err.Error())
		return
	}

	c.JSON(200, result)
}
