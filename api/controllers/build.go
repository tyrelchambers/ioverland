package controllers

import (
	dbConfig "api/db"
	"api/models"
	"api/services/build_service"
	"api/services/user_service"
	"fmt"
	"net/http"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
)

type EditResponse struct {
	Build         build_service.Build `json:"build"`
	Can_be_public bool                `json:"can_be_public"`
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
	return countVisibleBuilds(user) < user.MaxPublicBuilds || user.MaxPublicBuilds == -1
}

func CreateBuild(c *gin.Context) {
	user, _ := c.Get("user")

	var reqBody models.Build

	if err := c.Bind(&reqBody); err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
		return
	}

	reqBody.UserId = user.(*clerk.User).ID

	acc := user_service.GetUserAccount(dbConfig.Client, user.(*clerk.User).ID)

	if acc.BuildsRemaining == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You have reached your build limit"})
		return
	}

	if reqBody.Name == "" {
		c.JSON(400, gin.H{"error": "Name is required"})
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

	err := buildEntity.Create(dbConfig.Client)

	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
		return
	}

	c.JSON(200, buildEntity)
}

func GetById(c *gin.Context) {
	build_id := c.Param("build_id")

	buildEntity, err := build_service.GetById(dbConfig.Client, build_id)

	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
		return
	}

	fmt.Println(buildEntity)
	c.JSON(200, buildEntity)

}

func UpdateBuild(c *gin.Context) {

	var reqBody build_service.Build

	if err := c.Bind(&reqBody); err != nil {
		c.String(500, err.Error())
		return
	}

	can_be_public := canBePublic(user_service.GetUserAccount(dbConfig.Client, reqBody.UserId))

	if !can_be_public && reqBody.Public {
		c.JSON(400, gin.H{"error": "You cannot make this build public"})
		return
	}

	err := reqBody.Update(dbConfig.Client)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.JSON(200, reqBody)
}

func RemoveImage(c *gin.Context) {
	media_id := c.Param("media_id")
	build_id := c.Param("build_id")

	build_service.RemoveImage(dbConfig.Client, build_id, media_id)

	c.String(200, "success")
}

func IncrementViews(c *gin.Context) {
	id := c.Param("build_id")

	build, err := build_service.GetById(dbConfig.Client, id)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	build.IncrementViews(dbConfig.Client)

	c.String(200, "success")
}

func Like(c *gin.Context) {
	build_id := c.Param("build_id")

	user, _ := c.Get("user")

	build, err := build_service.GetById(dbConfig.Client, build_id)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	build.Like(dbConfig.Client, user.(*clerk.User).ID)

	c.String(200, "success")
}

func Dislike(c *gin.Context) {
	id := c.Param("build_id")

	user, _ := c.Get("user")
	build, err := build_service.GetById(dbConfig.Client, id)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	build.DisLike(dbConfig.Client, user.(*clerk.User).ID)

	c.String(200, "success")
}
func DeleteBuild(c *gin.Context) {
	id := c.Param("build_id")

	build, err := build_service.GetById(dbConfig.Client, id)
	banner := build.Banner
	photos := build.Photos

	if banner.Url != "" {
		DeleteImageFromStorage(banner.Url)
	}

	if len(photos) > 0 {
		for _, v := range photos {
			DeleteImageFromStorage(v.Url)
		}
	}

	if err != nil {
		c.String(500, err.Error())
		return
	}
	err = build.Delete(dbConfig.Client)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}

func BuildEditSettings(c *gin.Context) {
	id := c.Param("build_id")

	var resp EditResponse

	build, err := build_service.GetById(dbConfig.Client, id)

	if err != nil {
		fmt.Println("Error getting build in edit settings: ", err)
		c.String(500, err.Error())
		return
	}

	account := user_service.GetUserAccount(dbConfig.Client, build.UserId)

	if err != nil {
		fmt.Println("[BUILD CONTROLLER] [BUILD EDIT SETTINGS] [ACCOUNT] Error getting account in edit settings: ", err)
		c.String(500, err.Error())
		return
	}

	can_toggle := canBePublic(account)

	fmt.Println(canBePublic(account))

	resp.Can_be_public = can_toggle

	resp.Build = build

	c.JSON(200, resp)
}
