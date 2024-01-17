package controllers

import (
	dbConfig "api/db"
	"api/models"
	"api/services/build_service"
	"api/services/media_service"
	"api/services/user_service"
	"api/utils"
	"fmt"
	"net/http"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
)

type EditResponse struct {
	Build         models.Build `json:"build"`
	Can_be_public bool         `json:"can_be_public"`
}

func countVisibleBuilds(user user_service.AccountResponse) int {
	count := 0

	for _, build := range user.Builds {
		if build.Public {
			count++
		}
	}

	return count
}

func canBePublic(user user_service.AccountResponse) bool {
	if user.MaxPublicBuilds == -1 {
		return true
	}
	return countVisibleBuilds(user) < user.MaxPublicBuilds
}

func CreateBuild(c *gin.Context) {
	userParam, _ := c.Get("user")
	user := userParam.(*models.User)

	var reqBody models.Build

	if err := c.Bind(&reqBody); err != nil {
		fmt.Println(err)
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	reqBody.UserId = user.Uuid

	acc, err := user_service.GetUserAccount(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [CREATE BUILD] Error getting account in create build: ",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	if acc.BuildsRemaining == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You have reached your build limit"})
		return
	}

	if reqBody.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	modifications := []models.Modification{}
	links := []string{}
	trips := []models.Trip{}

	for _, v := range reqBody.Trips {
		trips = append(trips, models.Trip{
			Name:    v.Name,
			Year:    v.Year,
			BuildId: v.BuildId,
		})
	}

	for _, v := range reqBody.Links {
		links = append(links, v)
	}
	for _, v := range reqBody.Modifications {
		modifications = append(modifications, models.Modification{
			Category:    v.Category,
			Subcategory: v.Subcategory,
			Name:        v.Name,
			Price:       v.Price,
		})
	}

	buildEntity := &build_service.Build{
		Build: models.Build{
			Name:        reqBody.Name,
			Description: reqBody.Description,
			Budget:      reqBody.Budget,
			Vehicle: models.Vehicle{
				Model: reqBody.Vehicle.Model,
				Make:  reqBody.Vehicle.Make,
				Year:  reqBody.Vehicle.Year,
			},
			Modifications: modifications,
			Public:        reqBody.Public,
			Trips:         trips,
			Links:         links,
			UserId:        reqBody.UserId,
			Banner:        reqBody.Banner,
			Photos:        reqBody.Photos,
		},
	}

	err = buildEntity.Create(dbConfig.Client)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [CREATE BUILD] Error creating build: ",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})

		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, buildEntity)
}

func GetById(c *gin.Context) {
	build_id := c.Param("build_id")

	buildEntity, err := build_service.GetById(dbConfig.Client, build_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [GETBUILDBYID] Error getting build: ",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": build_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, buildEntity)

}

func UpdateBuild(c *gin.Context) {
	user := utils.UserFromContext(c)

	var reqBody *models.Build

	if err := c.Bind(&reqBody); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	usr, err := user_service.GetUserAccount(dbConfig.Client, user.Uuid)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [UPDATEBUILD] Error getting account from user_service",
			Extra:   map[string]interface{}{"error": err.Error(), "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	can_be_public := canBePublic(usr)

	if !can_be_public && reqBody.Public {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot make this build public"})
		return
	}

	err = build_service.Update(dbConfig.Client, reqBody)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [GETBUILDBYID] Error updating build",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": reqBody.ID, "user_id": reqBody.UserId},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, reqBody)
}

func RemoveImage(c *gin.Context) {
	media_id := c.Param("media_id")
	build_id := c.Param("build_id")

	err := build_service.RemoveImage(dbConfig.Client, build_id, media_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [REMOVEIMAGE] Error removing image",
			Extra:   map[string]interface{}{"error": err.Error(), "media_id": media_id, "build_id": build_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func IncrementViews(c *gin.Context) {
	id := c.Param("build_id")

	build, err := build_service.GetById(dbConfig.Client, id)

	if err != nil {

		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [INCREMENTVIEWS] Error getting build",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = build_service.IncrementViews(dbConfig.Client, build)

	if err != nil {

		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [INCREMENTVIEWS] Error incrementing views",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func Like(c *gin.Context) {
	build_id := c.Param("build_id")

	userParam, _ := c.Get("user")
	user := userParam.(*models.User)

	build, err := build_service.GetById(dbConfig.Client, build_id)

	if err != nil {

		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [LIKE] Error getting build",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": build_id, "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = build_service.Like(dbConfig.Client, user.Uuid, build)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [LIKE] Error liking build",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": build_id, "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func Dislike(c *gin.Context) {
	id := c.Param("build_id")

	user, _ := c.Get("user")
	build, err := build_service.GetById(dbConfig.Client, id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [DISLIKE] Error getting build",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": id, "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = build_service.DisLike(dbConfig.Client, user.(*clerk.User).ID, build)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [DISLIKE] Error disliking build",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": id, "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}
func DeleteBuild(c *gin.Context) {
	id := c.Param("build_id")
	user, _ := c.Get("user")

	build, err := build_service.GetById(dbConfig.Client, id)
	banner := build.Banner
	photos := build.Photos

	if banner.Url != "" {
		media_service.DeleteImageFromStorage(banner.Url)
	}

	if len(photos) > 0 {
		for _, v := range photos {
			media_service.DeleteImageFromStorage(v.Url)
		}
	}

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [DELETEBUILD] Error getting build",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": id, "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	err = build_service.Delete(dbConfig.Client, build)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [DELETEBUILD] Error deleting build",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": id, "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func BuildEditSettings(c *gin.Context) {
	id := c.Param("build_id")
	user, _ := c.Get("user")

	var resp EditResponse

	build, err := build_service.GetById(dbConfig.Client, id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [BUILDEDITSETTINGS] Error getting build in edit settings",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": id, "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	account, err := user_service.GetUserAccount(dbConfig.Client, build.UserId)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [BUILDEDITSETTINGS] Error getting account in edit settings",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": id, "user_id": user.(*clerk.User).ID},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	can_toggle := canBePublic(account)

	resp.Can_be_public = can_toggle

	resp.Build = build

	c.JSON(http.StatusOK, resp)
}

func DeleteTrip(c *gin.Context) {
	id := c.Param("build_id")
	trip_id := c.Param("trip_id")
	user := utils.UserFromContext(c)

	err := build_service.DeleteTrip(dbConfig.Client, id, trip_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [BUILD] [DELETETRIP] Error deleting trip",
			Extra:   map[string]interface{}{"error": err.Error(), "build_id": id, "trip_id": trip_id, "user_id": user.Uuid},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}
