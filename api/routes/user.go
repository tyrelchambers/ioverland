package routes

import (
	"api/controllers"
	"api/middleware"
	"fmt"

	"github.com/gin-gonic/gin"
)

func Bookmark(c *gin.Context) {
	var body struct {
		BuildId string `json:"build_id"`
	}

	if err := c.Bind(&body); err != nil {
		c.String(500, err.Error())
	}

	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
	}

	err = controllers.Bookmark(body.BuildId, user.ID)

	c.String(200, "success")
}

func Unbookmark(c *gin.Context) {
	var body struct {
		BuildId string `json:"build_id"`
	}

	if err := c.Bind(&body); err != nil {
		c.String(500, err.Error())
	}

	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
	}

	err = controllers.Unbookmark(body.BuildId, user.ID)

	c.String(200, "success")
}

func GetCurrentUser(c *gin.Context) {
	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
	}

	domainUser, err := controllers.GetCurrentUser(user.ID)

	if err != nil {
		c.String(500, err.Error())
	}

	c.JSON(200, domainUser)
}

func GetStripeAccount(c *gin.Context) {
	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
	}

	fmt.Println(user.PrivateMetadata)

	c.JSON(200, "")
}
