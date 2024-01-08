package upload

import (
	"api/utils"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func ProcessUpload(path string, request UploadRequest, payload []byte, user_id string, c *gin.Context) error {

	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE, 0644)
	defer os.Remove(path)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer f.Close()

	// Seek to the specified offset
	_, err = f.Seek(request.UploadOffset, 0)
	if err != nil {
		fmt.Println(err)
		return err
	}

	// Write the received bytes to the file
	_, err = f.Write(payload)
	if err != nil {
		fmt.Println(err)
		return err
	}

	endpoint := fmt.Sprintf("https://ny.storage.bunnycdn.com/ioverland/uploads/%s/%s", user_id, request.UploadName)

	file_stat, err := f.Stat()

	if err != nil {
		return err
	}

	size := file_stat.Size()

	if request.UploadLength == size {
		new_file, err := os.Open(path)

		if err != nil {
			return err
		}
		req, _ := http.NewRequest("PUT", endpoint, new_file)

		req.Header.Add("Content-Type", "application/form-data")
		req.Header.Add("AccessKey", os.Getenv("BUNNY_KEY"))
		req.Header.Add("accept", "application/json")

		res, err := http.DefaultClient.Do(req)

		if err != nil {
			return err
		}
		defer res.Body.Close()
	}

	return nil
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
