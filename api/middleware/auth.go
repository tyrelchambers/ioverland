package middleware

import (
	"api/utils"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/gin-gonic/gin"
)

func Authorize(c *gin.Context) (*clerk.User, error) {
	sessionToken := c.Request.Header.Get("Cookie")
	sessionKey := utils.GetHeaderValueFromString(sessionToken, "__session")

	// verify the session
	sessClaims, err := utils.ClerkClient.VerifyToken(sessionKey)
	if err != nil {
		return nil, err
	}

	// get the user, and say welcome!
	user, err := utils.ClerkClient.Users().Read(sessClaims.Claims.Subject)

	if err != nil {
		panic(err)
	}

	return user, nil
}
