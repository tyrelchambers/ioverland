package routes

import (
	"api/controllers"
	"fmt"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
)

func Bookmark(c *gin.Context) {
	var body struct {
		BuildId string `json:"build_id"`
	}

	if err := c.Bind(&body); err != nil {
		c.String(500, err.Error())
		return
	}

	user, _ := c.Get("user")

	err := controllers.Bookmark(body.BuildId, user.(*clerk.User).ID)

	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
		return
	}

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

	user, _ := c.Get("user")

	err := controllers.Unbookmark(body.BuildId, user.(*clerk.User).ID)

	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}

func GetCurrentUser(c *gin.Context) {
	user, _ := c.Get("user")

	domainUser, err := controllers.GetCurrentUser(user.(*clerk.User).ID)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.JSON(200, domainUser)
}

func GetAccount(c *gin.Context) {
	user, _ := c.Get("user")
	acc := controllers.GetAccount(user.(*clerk.User))

	c.JSON(200, acc)
}

func DeleteUser(c *gin.Context) {
	user, _ := c.Get("user")

	err := controllers.DeleteUser(user.(*clerk.User))

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}

func RestoreUser(c *gin.Context) {
	user, _ := c.Get("user")

	err := controllers.RestoreUser(user.(*clerk.User))

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}
