package middleware

import (
	"api/utils"
	"strings"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
)

func Authorize(c *gin.Context) (*clerk.User, error) {
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
	user, err := utils.ClerkClient.Users().Read(sessClaims.Claims.Subject)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[MIDDLEWARE] [AUTHORIZATION] [GET USER] ",
			Extra:   map[string]interface{}{"error": err.Error()},
		})
		panic(err)
	}

	return user, nil
}
