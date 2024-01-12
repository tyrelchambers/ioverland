package controllers

import (
	dbConfig "api/db"
	"api/services/build_service"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
)

func GetUserBuilds(c *gin.Context) {
	id, _ := c.Get("user")

	builds, err := build_service.AllByUser(dbConfig.Client, id.(*clerk.User).ID)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.JSON(200, builds)

}
