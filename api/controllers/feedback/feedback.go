package feedback_controller

import (
	"api/utils"
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jomei/notionapi"
)

func Feedback(c *gin.Context) {
	type_map := map[string]string{
		"bug":     "Bug Report",
		"feature": "Feature Request",
		"general": "General Feedback",
	}

	type_colour_map := map[string]notionapi.Color{
		"bug":     notionapi.ColorRed,
		"feature": notionapi.ColorBlue,
		"general": notionapi.ColorDefault,
	}

	var body struct {
		Name    string `json:"name"`
		Email   string `json:"email"`
		Message string `json:"message"`
		Type    string `json:"type"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	key := utils.GoDotEnvVariable("NOTION_KEY")
	client := notionapi.NewClient(notionapi.Token(key))

	_, err := client.Page.Create(context.Background(), &notionapi.PageCreateRequest{
		Parent: notionapi.Parent{
			Type:       notionapi.ParentTypeDatabaseID,
			DatabaseID: "6970840e4f004143bb44adb5a7c514e2",
		},
		Properties: notionapi.Properties{
			"Name": &notionapi.TitleProperty{
				ID:   "title",
				Type: "title",
				Title: []notionapi.RichText{
					{
						Type: "text",
						Text: &notionapi.Text{
							Content: body.Name,
						},
						Annotations: &notionapi.Annotations{
							Color: "default",
						},
					},
				},
			},
			"Email": notionapi.RichTextProperty{
				Type: notionapi.PropertyTypeRichText,
				RichText: []notionapi.RichText{
					{
						Type: notionapi.ObjectTypeText,
						Text: &notionapi.Text{Content: body.Email},
					},
				},
			},
			"Type": notionapi.SelectProperty{
				Type: notionapi.PropertyTypeSelect,
				Select: notionapi.Option{
					Name:  type_map[body.Type],
					Color: type_colour_map[body.Type],
				},
			},
			"Message": notionapi.RichTextProperty{
				Type: notionapi.PropertyTypeRichText,
				RichText: []notionapi.RichText{
					{
						Type: notionapi.ObjectTypeText,
						Text: &notionapi.Text{Content: body.Message},
					},
				},
			},
		},
	})

	if err != nil {
		fmt.Println(err.Error())
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}
