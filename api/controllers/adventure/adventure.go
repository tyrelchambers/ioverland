package adventure_controller

import (
	dbConfig "api/db"
	"api/models"
	"api/services/adventure_service"
	"api/services/user_service"
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
	id := c.Param("adv_id")

	adv, err := adventure_service.GetById(dbConfig.Client, id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [GETADVENTURE] Error getting adventure",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = adventure_service.IncreaseViews(dbConfig.Client, id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [GETADVENTURE] Error increasing views",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, adv)
}

func RemoveImage(c *gin.Context) {
	media_id := c.Param("media_id")
	adv_id := c.Param("adv_id")

	err := adventure_service.RemoveImage(dbConfig.Client, adv_id, media_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [REMOVEIMAGE] Error removing image",
			Extra:   map[string]interface{}{"error": err.Error(), "media_id": media_id, "adv_id": adv_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}
func Update(c *gin.Context) {
	var reqBody *models.Adventure

	if err := c.Bind(&reqBody); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err := adventure_service.Update(dbConfig.Client, reqBody)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [GETBUILDBYID] Error updating build",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": reqBody.UserId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, reqBody)
}

func RemoveBuild(c *gin.Context) {
	id := c.Param("adv_id")
	build_id := c.Param("build_id")
	err := adventure_service.RemoveBuild(dbConfig.Client, id, build_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [REMOVEBUILD] Error removing build",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": id, "build_id": build_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")

}

func RemoveDay(c *gin.Context) {
	id := c.Param("adv_id")
	day_id := c.Param("day_id")
	err := adventure_service.RemoveDay(dbConfig.Client, day_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [REMOVEBUILD] Error removing build",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": id, "day_id": day_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")

}

func Delete(c *gin.Context) {
	id := c.Param("adv_id")

	err := adventure_service.Delete(dbConfig.Client, id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [DELETE] Error deleting adventure",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func Like(c *gin.Context) {
	adv_id := c.Param("adv_id")
	user := utils.UserFromContext(c)

	adv, err := adventure_service.GetById(dbConfig.Client, adv_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [LIKE] Error getting adventure",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": adv_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = adventure_service.Like(dbConfig.Client, user.Uuid, adv)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [LIKE] Error liking adventure",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": adv_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")

}

func Dislike(c *gin.Context) {
	adv_id := c.Param("adv_id")
	user := utils.UserFromContext(c)

	adv, err := adventure_service.GetById(dbConfig.Client, adv_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [DISLIKE] Error getting adventure",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": adv_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = adventure_service.DisLike(dbConfig.Client, user.Uuid, adv)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [DISLIKE] Error disliking adventure",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": adv_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")

}

func countVisibleAdventures(user *models.User) int {
	count := 0

	for _, adv := range user.Adventures {
		if adv.Public {
			count++
		}
	}

	return count
}

func canBePublic(user *models.User) bool {
	if user.MaxPublicAdventures == -1 {
		return true
	}
	return countVisibleAdventures(user) < user.MaxPublicAdventures
}

func AdventureEditSettings(c *gin.Context) {
	var resp struct {
		Adventure   models.Adventure `json:"adventure"`
		CanBePublic bool             `json:"can_be_public"`
	}

	adv_id := c.Param("adv_id")

	adv, err := adventure_service.GetById(dbConfig.Client, adv_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [EDITSETTINGS] Error getting adventure",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": adv_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	account, err := user_service.FindUser(dbConfig.Client, adv.UserId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [ADVENTURE] [EDITSETTINGS] Error getting account",
			Extra:   map[string]interface{}{"error": err.Error(), "adventure_id": adv_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	resp.Adventure = *adv

	can_toggle := canBePublic(account)

	resp.CanBePublic = can_toggle

	c.JSON(http.StatusOK, resp)
}
