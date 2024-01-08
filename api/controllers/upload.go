package controllers

import (
	"api/domain/build"
	"api/utils"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lucsky/cuid"
)

func Process(file *multipart.FileHeader, user_id string, c *gin.Context) (build.Media, error) {

	path := fmt.Sprintf("uploads/%s", user_id)
	full_url := fmt.Sprintf("https://ioverland.b-cdn.net/%s/%s", path, file.Filename)
	file_type := c.Request.Header.Get("file-type")
	mimeType := file.Header.Get("Content-Type")
	openFile, err := file.Open()

	uploadDir := fmt.Sprintf("temp-uploads")

	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.Mkdir(uploadDir, 0755)
	}

	filename := fmt.Sprintf("%s/%s", uploadDir, file.Filename)
	new_file, err := os.Create(filename)
	defer os.Remove(filename)

	if err != nil {
		fmt.Println(err)
		return build.Media{}, err
	}

	defer new_file.Close()

	fileContent, err := io.ReadAll(openFile)

	if err != nil {
		fmt.Println(err)
		return build.Media{}, err
	}

	_, err = new_file.Write(fileContent)

	if err != nil {
		fmt.Println(err)
		return build.Media{}, err
	}

	openNewFile, err := os.Open(filename)

	url := fmt.Sprintf("https://ny.storage.bunnycdn.com/ioverland/uploads/%s/%s", user_id, file.Filename)

	req, _ := http.NewRequest("PUT", url, openNewFile)

	req.Header.Add("Content-Type", "multipart/form-data")
	req.Header.Add("AccessKey", os.Getenv("BUNNY_KEY"))
	req.Header.Add("accept", "application/json")

	res, err := http.DefaultClient.Do(req)

	if err != nil {
		return build.Media{}, err
	}
	defer res.Body.Close()

	r := build.Media{
		Name:     file.Filename,
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
