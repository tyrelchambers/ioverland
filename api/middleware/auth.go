package middleware

import (
	dbConfig "api/db"
	"api/models"
	"api/services/user_service"
	"api/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

func Authorize(c *gin.Context) (*models.User, error) {
	authToken := strings.Split(c.Request.Header.Get("Authorization"), " ")

	// verify the session
	sessClaims, err := utils.ClerkClient.VerifyToken(authToken[1])

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[MIDDLEWARE] [AUTHORIZATION] [VERIFY TOKEN] ",
			Extra:   map[string]interface{}{"error": err.Error()},
		})
		return nil, err
	}

	// get the user, and say welcome!
	user, err := user_service.FindUser(dbConfig.Client, sessClaims.Claims.Subject)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[MIDDLEWARE] [AUTHORIZATION] [FIND USER] ",
			Extra:   map[string]interface{}{"error": err.Error()},
		})
		return nil, err
	}

	return user, nil
}
