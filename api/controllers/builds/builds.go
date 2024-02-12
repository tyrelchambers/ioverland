package builds_controller

import (
	dbConfig "api/db"
	"api/services/build_service"
	"api/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUserBuilds(c *gin.Context) {
	user := utils.UserFromContext(c)

	builds, err := build_service.AllByUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [GETUSERBUILDS] Error getting builds",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, builds)

}
