package controllers

import (
	"api/utils"
	"context"
	"fmt"
	"strings"
)

func DeleteImageFromStorage(url string) error {
	name_parts := strings.Split(url, "/")
	filename := name_parts[len(name_parts)-1]
	user_id := name_parts[len(name_parts)-2]
	path := fmt.Sprintf("uploads/%s", user_id)

	_, err := utils.BunnyClient.Delete(context.Background(), path, filename)

	if err != nil {
		return err
	}

	return nil
}
