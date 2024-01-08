package routes

import (
	"api/controllers"
	"api/middleware"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func ChunkStart(c *gin.Context) {
	var request interface{}

	if err := c.BindJSON(&request); err != nil {
		c.String(500, err.Error())
		return
	}

	fmt.Println(request)
	_, err := middleware.Authorize(c)

	if err != nil {
		fmt.Println(err)
		c.String(401, "Unauthorized")
		return
	}

	// path := fmt.Sprintf("uploads/%s", user.ID)
	// full_url := fmt.Sprintf("https://ioverland.b-cdn.net/%s/%s", path, file.Filename)
	// file_type := c.Request.Header.Get("file-type")
	// mimeType := file.Header.Get("Content-Type")
	// openFile, err := file.Open()

	// uploadDir := fmt.Sprintf("temp-uploads")

	// if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
	// 	os.Mkdir(uploadDir, 0755)
	// }

	// filename := fmt.Sprintf("%s/%s", uploadDir, file.Filename)
	// new_file, err := os.Create(filename)
	// defer os.Remove(filename)

	// if err != nil {
	// 	fmt.Println(err)
	// 	c.String(500, err.Error())
	// }

}

func Upload(c *gin.Context) {
	type UploadRequest struct {
		UploadLength string `header:"Upload-Length"`
		MimeType     string `header:"Content-Type"`
		UploadOffset int64  `header:"Upload-Offset"`
		UploadName   string `header:"Upload-Name"`
	}
	var request UploadRequest

	user, err := middleware.Authorize(c)

	if err != nil {
		fmt.Println(err)
		c.String(401, "Unauthorized")
		return
	}

	// server_id := c.Query("patch")

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

	media, err := controllers.ProcessUpload(path, request, payload, user.ID, c)

	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
		return
	}

	c.String(200, media.Url)
}

func Revert(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)

	requestBody := string(body)

	err = controllers.Revert(c, requestBody)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}
