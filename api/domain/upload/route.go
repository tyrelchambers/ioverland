package upload

import (
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/lucsky/cuid"
)

type UploadRequest struct {
	UploadLength int64  `header:"Upload-Length"`
	MimeType     string `header:"Content-Type"`
	UploadOffset int64  `header:"Upload-Offset"`
	UploadName   string `header:"Upload-Name"`
}

func UploadRoute(c *gin.Context) {
	user_id, _ := c.Get("clerk-user-id")

	var request UploadRequest

	current_path_query := c.Query("patch")

	if err := c.BindHeader(&request); err != nil {
		c.String(500, err.Error())
		return
	}

	if c.Request.Method == http.MethodPost {

		rand_string := cuid.New()
		uploadDir := fmt.Sprintf("temp-uploads/%s", rand_string)

		if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
			os.Mkdir(uploadDir, 0755)
		}

		c.String(200, rand_string)
		return
	}

	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	err = ProcessUpload(current_path_query, request, payload, user_id.(string), c)

	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
		return
	}

	c.JSON(200, "success")
}

func RevertRoute(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)

	requestBody := string(body)

	err = Revert(c, requestBody)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}
