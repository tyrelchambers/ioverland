package controllers

import (
	dbConfig "api/db"
	"api/models"
	"api/services/comment_service"
	"api/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lucsky/cuid"
)

func CreateComment(c *gin.Context) {
	var body struct {
		Comment string  `json:"comment"`
		BuildId string  `json:"build_id"`
		ReplyId *string `json:"reply_id"`
	}

	user := utils.UserFromContext(c)

	if err := c.Bind(&body); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	comment := &models.Comment{
		Text:     body.Comment,
		AuthorId: user.Uuid,
		BuildId:  body.BuildId,
		Uuid:     cuid.New(),
		ReplyId:  body.ReplyId,
	}

	if body.ReplyId != nil {
		comment.ReplyId = body.ReplyId
	}

	err := comment_service.Create(dbConfig.Client, comment)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [COMMENT] [CREATE] Error creating comment",
			Extra:   map[string]interface{}{"error": err.Error(), "comment": comment},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, comment)
}

func LikeComment(c *gin.Context) {
	user := utils.UserFromContext(c)

	comment_id := c.Param("comment_id")

	comment, err := comment_service.Find(dbConfig.Client, comment_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [COMMENT] [LIKE] Error getting comment",
			Extra:   map[string]interface{}{"error": err.Error(), "comment_id": comment_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	comment.Likes = append(comment.Likes, user.Uuid)

	err = comment_service.Update(dbConfig.Client, comment)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [COMMENT] [LIKE] Error liking comment",
			Extra:   map[string]interface{}{"error": err.Error(), "comment_id": comment_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}

func RemoveLike(c *gin.Context) {
	user := utils.UserFromContext(c)

	comment_id := c.Param("comment_id")

	comment, err := comment_service.Find(dbConfig.Client, comment_id)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [COMMENT] [DISLIKE] Error getting comment",
			Extra:   map[string]interface{}{"error": err.Error(), "comment_id": comment_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	for i, like := range comment.Likes {
		if like == user.Uuid {
			comment.Likes = append(comment.Likes[:i], comment.Likes[i+1:]...)
			break
		}
	}

	err = comment_service.Update(dbConfig.Client, comment)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [COMMENT] [DISLIKE] Error disliking comment",
			Extra:   map[string]interface{}{"error": err.Error(), "comment_id": comment_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")

}

func DeleteComment(c *gin.Context) {
	user := utils.UserFromContext(c)
	comment_id := c.Param("comment_id")

	err := comment_service.Delete(dbConfig.Client, comment_id, user)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [COMMENT] [DELETE] Error deleting comment",
			Extra:   map[string]interface{}{"error": err.Error(), "comment_id": comment_id},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.String(http.StatusOK, "success")
}
