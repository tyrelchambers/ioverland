package routes

import (
	"api/controllers"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
)

func CreateCheckout(c *gin.Context) {

	redirect_to := c.Query("redirect_to")
	user, _ := c.Get("user")

	url := controllers.CreateCheckout(user.(*clerk.User), redirect_to)

	c.JSON(200, gin.H{"url": url})
}

func CreateCustomerPortal(c *gin.Context) {

	user, _ := c.Get("user")
	domainUser, err := controllers.GetCurrentUser(user.(*clerk.User).ID)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	url := controllers.CreateCustomerPortal(domainUser.CustomerId)

	c.JSON(200, gin.H{"url": url})
}
