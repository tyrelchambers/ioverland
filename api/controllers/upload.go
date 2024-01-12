package controllers

import (
	"api/utils"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lucsky/cuid"
)

type UploadRequest struct {
	UploadLength int64  `header:"Upload-Length"`
	MimeType     string `header:"Content-Type"`
	UploadOffset int64  `header:"Upload-Offset"`
	UploadName   string `header:"Upload-Name"`
}

func ProcessUpload(c *gin.Context) {
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

	temp_dir := "temp-uploads"

	path := fmt.Sprintf("%s/%s/%s", temp_dir, current_path_query, request.UploadName)
	path_without_prefix := strings.Split(path, "/")[1]

	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
	}
	defer f.Close()

	// Seek to the specified offset
	_, err = f.Seek(request.UploadOffset, 0)
	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
	}

	// Write the received bytes to the file
	_, err = f.Write(payload)
	if err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
	}

	node_env := os.Getenv("NODE_ENV")
	var folder_root string

	if node_env == "production" {
		folder_root = "production"
	} else {
		folder_root = "development"
	}

	endpoint := fmt.Sprintf("https://ny.storage.bunnycdn.com/ioverland/%s/%s/%s/%s", folder_root, user_id, path_without_prefix, request.UploadName)

	file_stat, err := f.Stat()

	if err != nil {
		c.String(500, err.Error())
	}

	size := file_stat.Size()

	if request.UploadLength == size {
		new_file, err := os.Open(path)

		if err != nil {
			fmt.Println(err)
			c.String(500, err.Error())
		}
		req, _ := http.NewRequest("PUT", endpoint, new_file)

		req.Header.Add("Content-Type", "application/form-data")
		req.Header.Add("AccessKey", os.Getenv("BUNNY_KEY"))
		req.Header.Add("accept", "application/json")

		res, err := http.DefaultClient.Do(req)

		if err != nil {
			fmt.Println(err)
			c.String(500, err.Error())
		}

		// read res body
		body, err := io.ReadAll(res.Body)

		if err != nil {
			fmt.Println(err)
			c.String(500, err.Error())
		}

		fmt.Println(string(body))

		defer os.RemoveAll(fmt.Sprintf("%s/%s", temp_dir, current_path_query))

	}

}

func Revert(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	requestBody := string(body)

	name_parts := strings.Split(requestBody, "/")
	filename := name_parts[len(name_parts)-1]
	user_id := name_parts[len(name_parts)-2]
	path := fmt.Sprintf("uploads/%s", user_id)

	_, err = utils.BunnyClient.Delete(c.Request.Context(), path, filename)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}
