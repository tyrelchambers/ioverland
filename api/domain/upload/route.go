package upload

import (
	"api/middleware"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type UploadRequest struct {
	UploadLength int64  `header:"Upload-Length"`
	MimeType     string `header:"Content-Type"`
	UploadOffset int64  `header:"Upload-Offset"`
	UploadName   string `header:"Upload-Name"`
}

func UploadRoute(c *gin.Context) {

	var request UploadRequest

	user, err := middleware.Authorize(c)

	if err != nil {
		fmt.Println(err)
		c.String(401, "Unauthorized")
		return
	}

	if err := c.BindHeader(&request); err != nil {
		c.String(500, err.Error())
		return
	}

	if c.Request.Method == http.MethodPost {

		uploadDir := fmt.Sprintf("temp-uploads/%s", user.ID)

		if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
			os.Mkdir(uploadDir, 0755)
		}

		c.String(200, uploadDir)
		return
	}

	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		// Handle the error
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	path := fmt.Sprintf("temp-uploads/%s/%s", user.ID, request.UploadName)

	err = ProcessUpload(path, request, payload, user.ID, c)

	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
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
