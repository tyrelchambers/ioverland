package media_service

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
		utils.CaptureError(nil, &utils.CaptureErrorParams{
			Message: "[SERVICE] [MEDIA] [DELETEIMAGEFROMSTORAGE] Error deleting image from storage",
			Extra:   map[string]interface{}{"error": err.Error(), "url": url},
		})
		return err
	}

	return nil
}
