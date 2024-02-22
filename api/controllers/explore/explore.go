package explore_controller

import (
	dbConfig "api/db"
	"api/models"
	"api/services/build_service"
	"api/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ExploreRes struct {
	Builds []models.Build `json:"builds"`
}

func Explore(c *gin.Context) {
	var res ExploreRes

	allBuilds, err := build_service.All(dbConfig.Client)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [EXPLORE] Error getting builds",
			Extra:   map[string]interface{}{"error": err.Error()},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	res.Builds = allBuilds

	c.JSON(http.StatusOK, res)

}
