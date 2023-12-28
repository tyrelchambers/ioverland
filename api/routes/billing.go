package routes

import (
	"api/controllers"
	"api/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateCheckout(c *gin.Context) {
	user, err := middleware.Authorize(c)

	if err != nil {
		c.String(401, "Unauthorized")
	}

	url := controllers.CreateCheckout(user)

	c.Redirect(http.StatusTemporaryRedirect, url)
}
