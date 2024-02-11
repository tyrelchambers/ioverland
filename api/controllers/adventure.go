package controllers

import (
	dbConfig "api/db"
	"api/models"
	"api/services/adventure_service"
	"api/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateNewAdventure(c *gin.Context) {
	user := utils.UserFromContext(c)
	var body models.Adventure

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	body.UserId = user.Uuid

	err := adventure_service.Create(dbConfig.Client, &body)

	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "OK")
}

func GetUserAdventures(c *gin.Context) {
	user := utils.UserFromContext(c)

	adv, err := adventure_service.GetAdventuresByUser(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [GETUSERADVENTURES] Error getting adventures",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, adv)
}

func GetAdventure(c *gin.Context) {
	id := c.Param("adventure_id")

	adv, err := adventure_service.GetById(dbConfig.Client, id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [GETADVENTURE] Error getting adventure",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, adv)
}
