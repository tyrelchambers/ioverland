package controllers

import (
	"api/utils"
	"fmt"
	"mime/multipart"
	"strings"

	"github.com/labstack/echo/v4"
)

func Process(file *multipart.FileHeader, user_id string, c echo.Context) (string, error) {
	path := fmt.Sprintf("uploads/%s", user_id)
	full_url := fmt.Sprintf("https://ioverland.b-cdn.net/%s/%s", path, file.Filename)

	openFile, err := file.Open()

	res, err := utils.BunnyClient.Upload(c.Request().Context(), path, file.Filename, "", openFile)

	if err != nil {
		return "", err
	}

	if res.Status != 200 && res.Status != 201 {
		return "", err
	}

	return strings.ReplaceAll(full_url, "\n", ""), nil
}

func Revert(c echo.Context, url string) error {
	name_parts := strings.Split(url, "/")
	filename := name_parts[len(name_parts)-1]
	user_id := name_parts[len(name_parts)-2]
	path := fmt.Sprintf("uploads/%s", user_id)

	_, err := utils.BunnyClient.Delete(c.Request().Context(), path, filename)

	if err != nil {
		return err
	}

	return nil
}
