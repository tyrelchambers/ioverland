package upload

import (
	"api/domain/build"
	"api/utils"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lucsky/cuid"
)

func ProcessUpload(current_path_query string, request UploadRequest, payload []byte, user_id string, c *gin.Context) (build.Media, error) {
	temp_dir := "temp-uploads"

	path := fmt.Sprintf("%s/%s/%s", temp_dir, current_path_query, request.UploadName)
	path_without_prefix := strings.Split(path, "/")[1]

	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println(err)
		return build.Media{}, err
	}
	defer f.Close()

	// Seek to the specified offset
	_, err = f.Seek(request.UploadOffset, 0)
	if err != nil {
		fmt.Println(err)
		return build.Media{}, err
	}

	// Write the received bytes to the file
	_, err = f.Write(payload)
	if err != nil {
		fmt.Println(err)
		return build.Media{}, err
	}

	file_name := fmt.Sprintf("%d-%s", time.Now().Unix(), request.UploadName)

	endpoint := fmt.Sprintf("https://ny.storage.bunnycdn.com/ioverland/uploads/%s/%s/%s", user_id, path_without_prefix, file_name)

	file_stat, err := f.Stat()

	if err != nil {
		return build.Media{}, err
	}

	size := file_stat.Size()

	if request.UploadLength == size {
		new_file, err := os.Open(path)

		if err != nil {
			fmt.Println(err)
			return build.Media{}, err
		}
		req, _ := http.NewRequest("PUT", endpoint, new_file)

		req.Header.Add("Content-Type", "application/form-data")
		req.Header.Add("AccessKey", os.Getenv("BUNNY_KEY"))
		req.Header.Add("accept", "application/json")

		res, err := http.DefaultClient.Do(req)

		if err != nil {
			fmt.Println(err)
			return build.Media{}, err
		}

		// read res body
		body, err := io.ReadAll(res.Body)

		if err != nil {
			fmt.Println(err)
			return build.Media{}, err
		}

		fmt.Println(string(body))
	}

	file_url := fmt.Sprintf("https://ioverland.b-cdn.net/uploads/%s/%s/%s", user_id, path_without_prefix, file_name)

	r := build.Media{
		Name:     f.Name(),
		Type:     c.Request.Header.Get("file-type"),
		MimeType: request.MimeType,
		Url:      file_url,
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
