package controllers

import (
	"api/domain/build"
	"api/utils"
	"fmt"
	"mime/multipart"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lucsky/cuid"
)

func Process(file *multipart.FileHeader, user_id string, c *gin.Context) (build.Media, error) {
	path := fmt.Sprintf("uploads/%s", user_id)
	full_url := fmt.Sprintf("https://ioverland.b-cdn.net/%s/%s", path, file.Filename)
	file_type := c.Request.Header.Get("file-type")

	openFile, err := file.Open()

	res, err := utils.BunnyClient.Upload(c.Request.Context(), path, file.Filename, "", openFile)

	if err != nil {
		return build.Media{}, err
	}

	if res.Status != 200 && res.Status != 201 {
		return build.Media{}, err
	}

	r := build.Media{
		Name:     file.Filename,
		Type:     file_type,
		MimeType: file.Header.Get("Content-Type"),
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
