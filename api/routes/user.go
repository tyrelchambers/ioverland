package routes

import (
	"api/controllers"
	"api/middleware"

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
		return
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
		return
	}

	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	err = controllers.Unbookmark(body.BuildId, user.ID)

	c.String(200, "success")
}

func GetCurrentUser(c *gin.Context) {
	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	domainUser, err := controllers.GetCurrentUser(user.ID)

	if err != nil {
		c.String(500, err.Error())
	}

	c.JSON(200, domainUser)
}

func GetAccount(c *gin.Context) {
	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	acc := controllers.GetAccount(user)

	c.JSON(200, acc)
}

func DeleteUser(c *gin.Context) {
	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	err = controllers.DeleteUser(user)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}

func RestoreUser(c *gin.Context) {
	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	err = controllers.RestoreUser(user)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}
