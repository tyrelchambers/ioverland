package group_controller

import (
	dbConfig "api/db"
	"api/models"
	"api/services/email_service"
	"api/services/group_service"
	"api/utils"
	"fmt"
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

	var response struct {
		Group           *models.Group `json:"group"`
		IsMember        bool          `json:"is_member"`
		IsPendingMember bool          `json:"is_pending_member"`
	}

	groupId := c.Param("group_id")
	user_id := c.Request.Header.Get("User-Id")

	group, err := group_service.GetById(dbConfig.Client, groupId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [GETBYID] Error getting group",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": groupId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	fmt.Println(user_id)
	response.Group = group
	response.IsMember = group_service.CheckMembership(dbConfig.Client, groupId, user_id)
	requests, err := group_service.GetRequests(dbConfig.Client, groupId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [GETBYID] Error getting requests",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": groupId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	for _, user := range requests {
		fmt.Println(user.UserId, user_id)
		if user.UserId == user_id {
			response.IsPendingMember = true
		}
	}

	c.JSON(http.StatusOK, response)
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

	group, err := group_service.GetById(dbConfig.Client, group_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [JOIN] Error getting group",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": group_id, "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	member := group_service.CheckMembership(dbConfig.Client, group_id, user.Uuid)

	if member {
		c.String(http.StatusBadRequest, "You are already a member of this group")
		return
	}

	if group.Privacy == "public" {
		err = group_service.Join(dbConfig.Client, &models.Group{Uuid: group_id}, &models.User{Uuid: user.Uuid})

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [GROUP] [JOIN] Error joining group",
				Extra:   map[string]interface{}{"error": err.Error(), "group_id": group_id, "user_id": user.Uuid},
			})
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
	} else {

		err := group_service.RequestToJoin(dbConfig.Client, group_id, user.Uuid)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [GROUP] [JOIN] Error requesting to join group",
				Extra:   map[string]interface{}{"error": err.Error(), "group_id": group_id, "user_id": user.Uuid},
			})
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

		err = email_service.SendEmail(group.Admin)

		if err != nil {
			utils.CaptureError(c, &utils.CaptureErrorParams{
				Message: "[CONTROLLERS] [GROUP] [JOIN] Error sending email",
				Extra:   map[string]interface{}{"error": err.Error(), "group_id": group_id, "user_id": user.Uuid},
			})
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
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

func GetRequests(c *gin.Context) {
	group_id := c.Param("group_id")

	requests, err := group_service.GetRequests(dbConfig.Client, group_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [GETREQUESTS] Error getting requests",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": group_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, requests)
}

func RequestDecision(c *gin.Context) {
	group_id := c.Param("group_id")
	decision := c.Param("decision")
	user_id := c.Param("user_id")

	err := group_service.RequestDecision(dbConfig.Client, group_id, user_id, decision)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [GROUP] [REQUESTDECISION] Error requesting decision",
			Extra:   map[string]interface{}{"error": err.Error(), "group_id": group_id, "decision": decision, "user_id": user_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
}
