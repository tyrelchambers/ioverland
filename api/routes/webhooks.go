package routes

import (
	"api/db"
	"api/domain/user"
	"api/utils"
	"encoding/json"
	"io"
	"log"

	"github.com/gin-gonic/gin"
	svix "github.com/svix/svix-webhooks/go"
)

func Webhooks(c *gin.Context) {
	var body map[string]interface{}

	payload, err := io.ReadAll(c.Request.Body)
	headers := c.Request.Header
	wh_secret := utils.GoDotEnvVariable("CLERK_WH_SECRET")

	wh, err := svix.NewWebhook(wh_secret)

	if err != nil {
		log.Fatal(err)
	}

	err = json.Unmarshal(payload, &body)
	if err != nil {
		log.Fatal(err)
	}

	err = wh.Verify(payload, headers)

	if err != nil {
		c.String(401, "Unauthorized - Could not verify webhook signature")
	}

	evtType := utils.GetProperty(body, "type")

	if evtType == nil {
		c.String(202, "success")
	}

	if evtType == "user.created" {
		data := utils.GetProperty(body, "data")
		id := utils.ConvertToMap(data)["id"]

		newUser := user.User{
			Uuid: id.(string),
		}

		err := user.Create(db.Client, &newUser)

		if err != nil {
			c.String(500, err.Error())
		}

		c.String(200, "success")
	}

	c.String(202, "success")
}
