package middleware

import (
	"api/utils"
	"net/http"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/labstack/echo/v4"
)

func Authorize(c echo.Context) (*clerk.User, error) {
	sessionToken := c.Request().Header.Get("Cookie")
	sessionKey := utils.GetHeaderValueFromString(sessionToken, "__session")

	// verify the session
	sessClaims, err := utils.ClerkClient.VerifyToken(sessionKey)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, err)
	}

	// get the user, and say welcome!
	user, err := utils.ClerkClient.Users().Read(sessClaims.Claims.Subject)

	if err != nil {
		panic(err)
	}

	return user, nil
}
