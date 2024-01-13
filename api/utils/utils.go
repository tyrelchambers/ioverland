package utils

import (
	"log"
	"os"
	"strings"

	"git.sr.ht/~jamesponddotco/bunnystorage-go"
	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stripe/stripe-go"
)

var ClerkClient clerk.Client
var BunnyClient *bunnystorage.Client

func GoDotEnvVariable(key string) string {

	if os.Getenv(key) != "" {
		return os.Getenv(key)
	}

	// load .env file
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	if os.Getenv(key) == "" {
		log.Fatal("Environment variable not set for key: " + key)
	}

	return os.Getenv(key)
}

func GetHeaderValueFromString(src string, key string) string {
	parts := strings.Split(src, " ")

	for _, v := range parts {
		values := strings.Split(v, "=")

		if values[0] == key {
			return values[1]
		}
	}

	return ""
}

func GetProperty(data map[string]interface{}, key string) interface{} {
	value, ok := data[key]
	if !ok {
		// Property does not exist
		return nil
	}
	return value
}

func ConvertToMap(data interface{}) map[string]interface{} {
	if m, ok := data.(map[string]interface{}); ok {
		return m
	}
	return nil
}

func StripeClientInit() {
	stripe_key := GoDotEnvVariable("STRIPE_TEST_KEY")
	stripe.Key = stripe_key

}

type CaptureErrorParams struct {
	Extra   map[string]interface{}
	Message string
}

func CaptureError(c *gin.Context, params CaptureErrorParams) {
	if hub := sentrygin.GetHubFromContext(c); hub != nil {
		hub.WithScope(func(scope *sentry.Scope) {
			setExtraKeys(scope, params.Extra)
			hub.CaptureMessage(params.Message)
		})
	}
}

func setExtraKeys(scope *sentry.Scope, extra map[string]interface{}) {
	for key, value := range extra {
		scope.SetExtra(key, value)
	}
}
