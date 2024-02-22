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
	GoalRemaining int            `json:"goal_remaining"`
	BuildCount    int64          `json:"build_count"`
	Builds        []models.Build `json:"builds"`
}

func Explore(c *gin.Context) {
	var res ExploreRes

	count, err := build_service.AllBuildsCount(dbConfig.Client)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [EXPLORE] Error getting build count",
			Extra:   map[string]interface{}{"error": err.Error()},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	allBuilds, err := build_service.All(dbConfig.Client)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [EXPLORE] Error getting builds",
			Extra:   map[string]interface{}{"error": err.Error()},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	if 20-int(count) < 0 {
		res.GoalRemaining = 0
	} else {
		res.GoalRemaining = 20 - int(count)
	}

	res.BuildCount = count

	res.Builds = allBuilds

	c.JSON(http.StatusOK, res)

}
