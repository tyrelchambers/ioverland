package controllers

import (
	"api/domain/build"
	"api/utils"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lucsky/cuid"
)

type UploadRequest struct {
	UploadLength string
	MimeType     string
	UploadOffset int64
	UploadName   string
}

func ProcessUpload(path string, request UploadRequest, payload []byte, user_id string, c *gin.Context) (build.Media, error) {

	// f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, 0644)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return build.Media{}, err
	// }
	// defer f.Close()

	// // Seek to the specified offset
	// _, err = f.Seek(request.UploadOffset, 0)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return build.Media{}, err
	// }

	// // Write the received bytes to the file
	// _, err = f.Write(payload)
	// if err != nil {
	// 	fmt.Println(err)
	// 	return build.Media{}, err
	// }

	endpoint := fmt.Sprintf("https://ny.storage.bunnycdn.com/ioverland/uploads/%s/%s", user_id, request.UploadName)

	req, _ := http.NewRequest("PUT", endpoint, c.Request.Body)

	req.Header.Add("Content-Type", "multipart/form-data")
	req.Header.Add("AccessKey", os.Getenv("BUNNY_KEY"))
	req.Header.Add("accept", "application/json")

	res, err := http.DefaultClient.Do(req)

	if err != nil {
		return build.Media{}, err
	}
	defer res.Body.Close()

	full_url := fmt.Sprintf("https://ioverland.b-cdn.net/%s", path)
	file_type := c.Request.Header.Get("file-type")
	mimeType := c.Request.Header.Get("Content-Type")

	r := build.Media{
		Name:     request.UploadName,
		Type:     file_type,
		MimeType: mimeType,
		Url:      full_url,
		Uuid:     cuid.New(),
	}

	return r, nil
}

func Revert(c *gin.Context, url string) error {
	name_parts := strings.Split(url, "/")
	filename := name_parts[len(name_parts)-1]
	user_id := name_parts[len(name_parts)-2]
	path := fmt.Sprintf("uploads/%s", user_id)

	_, err := utils.BunnyClient.Delete(c.Request.Context(), path, filename)

	if err != nil {
		return err
	}

	return nil
}
