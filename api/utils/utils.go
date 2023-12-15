package utils

import (
	"log"
	"os"
	"strings"

	"github.com/clerkinc/clerk-sdk-go/clerk"
	"github.com/joho/godotenv"
)

var ClerkClient clerk.Client

func GoDotEnvVariable(key string) string {

	// load .env file
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
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
