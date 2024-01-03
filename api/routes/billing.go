package routes

import (
	"api/controllers"
	"api/middleware"

	"github.com/gin-gonic/gin"
)

func CreateCheckout(c *gin.Context) {

	user, err := middleware.Authorize(c)
	redirect_to := c.Query("redirect_to")

	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	url := controllers.CreateCheckout(user, redirect_to)

	c.JSON(200, gin.H{"url": url})
}

func CreateCustomerPortal(c *gin.Context) {

	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	domainUser, err := controllers.GetCurrentUser(user.ID)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	url := controllers.CreateCustomerPortal(domainUser.CustomerId)

	c.JSON(200, gin.H{"url": url})
}
