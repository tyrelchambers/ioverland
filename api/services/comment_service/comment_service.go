package comment_service

import (
	"api/models"
	"api/services/build_service"
	"errors"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, comment *models.Comment) error {
	return db.Create(&comment).Error
}

func Update(db *gorm.DB, comment *models.Comment) error {
	return db.Save(&comment).Error
}

func GetComments(db *gorm.DB, build_id string) ([]*models.Comment, error) {
	var comments []*models.Comment
	err := db.Table("comments").Where("build_id = ? AND reply_id IS NULL", build_id).Preload("Author").Preload("Build").Order("created_at desc").Find(&comments).Error

	if err != nil {
		return comments, err
	}

	for _, comment := range comments {
		replies, _ := GetReplies(db, comment.Uuid)
		comment.Replies = replies
	}

	return comments, err
}

func Find(db *gorm.DB, uuid string) (*models.Comment, error) {
	var comment *models.Comment
	err := db.Where("uuid = ?", uuid).First(&comment).Error
	return comment, err
}

func GetReplies(db *gorm.DB, comment_id string) ([]*models.Comment, error) {
	var replies []*models.Comment

	err := db.Table("comments").Where("reply_id = ?", comment_id).Preload("Author").Preload("Build").Order("created_at desc").Find(&replies).Error

	return replies, err
}

func Delete(db *gorm.DB, uuid string, user *models.User) error {

	comment, err := Find(db, uuid)

	if err != nil {
		return err
	}

	build, err := build_service.GetById(db, comment.BuildId)

	if err != nil {
		return err
	}

	if !canDeleteComment(build, *comment, *user) {
		return errors.New("User does not have permission to delete this comment")
	}

	return db.Table("comments").Where("uuid = ?", uuid).Select("deleted").Update("deleted", true).Error

}

func canDeleteComment(build models.Build, comment models.Comment, user models.User) bool {
	r := false

	if build.UserId == user.Uuid {
		r = true
	}

	if r {
		return r
	}

	if comment.AuthorId == user.Uuid {
		r = true
	}

	return r
}
