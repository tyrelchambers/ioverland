package comment_service

import (
	"api/models"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, comment *models.Comment) error {
	return db.Create(comment).Error
}

func Update(db *gorm.DB, comment *models.Comment) error {

	db.Save(&comment)

	if db.Error != nil {
		return db.Error
	}

	return nil
}

func GetComments(db *gorm.DB, build_id string) ([]models.Comment, error) {
	var comments []models.Comment
	err := db.Table("comments").Where("build_id = ?", build_id).Preload("Author").Preload("Build").Order("created_at desc").Find(&comments).Error
	return comments, err
}

func Find(db *gorm.DB, uuid string) (*models.Comment, error) {
	var comment *models.Comment
	err := db.Where("uuid = ?", uuid).First(&comment).Error
	return comment, err
}
