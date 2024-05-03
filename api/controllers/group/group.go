package group_controller

import (
	dbConfig "api/db"
	"api/models"
	"api/services/group_service"
	"api/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lucsky/cuid"
)

func Create(c *gin.Context) {
	user := utils.UserFromContext(c)

	var data models.Group

	if err := c.Bind(&data); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	data.AdminId = user.Uuid
	data.Uuid = cuid.New()
	data.Admin = *user
	err := group_service.Create(dbConfig.Client, data)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [CREATE] Error creating group",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, data)

}

func GetById(c *gin.Context) {

	groupId := c.Param("group_id")

	group, err := group_service.GetById(dbConfig.Client, groupId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [GETBYID] Error getting group",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": groupId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, group)
}
