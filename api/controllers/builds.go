package controllers

import (
	dbConfig "api/db"
	"api/services/build_service"
	"api/utils"
	"net/http"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
)

func GetUserBuilds(c *gin.Context) {
	id, _ := c.Get("user")

	builds, err := build_service.AllByUser(dbConfig.Client, id.(*clerk.User).ID)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [GETUSERBUILDS] Error getting builds",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": id.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, builds)

}
