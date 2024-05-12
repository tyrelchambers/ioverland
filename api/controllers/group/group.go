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

func Edit(c *gin.Context) {

	groupId := c.Param("group_id")
	user := utils.UserFromContext(c)

	var data models.Group

	if err := c.Bind(&data); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	group, err := group_service.GetById(dbConfig.Client, groupId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [EDIT] Error getting group",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": groupId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	if group.AdminId != user.Uuid {
		c.String(http.StatusUnauthorized, "You are not authorized to edit this group")
		return
	}

	err = group_service.Update(dbConfig.Client, data)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [EDIT] Error updating group",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": groupId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, data)
}

func Join(c *gin.Context) {

	group_id := c.Param("group_id")
	user := utils.UserFromContext(c)

	member := group_service.CheckMembership(dbConfig.Client, group_id, user)

	if member {
		c.String(http.StatusBadRequest, "You are already a member of this group")
		return
	}

	err := group_service.Join(dbConfig.Client, &models.Group{Uuid: group_id}, &models.User{Uuid: user.Uuid})

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [JOIN] Error joining group",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": group_id, "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, nil)
}

func Leave(c *gin.Context) {

	group_id := c.Param("group_id")
	user := utils.UserFromContext(c)

	err := group_service.Leave(dbConfig.Client, group_id, user)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [LEAVE] Error leaving group",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": group_id, "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, nil)
}
