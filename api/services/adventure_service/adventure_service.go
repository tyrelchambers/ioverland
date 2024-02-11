package adventure_service

import (
	"api/models"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, a *models.Adventure) error {
	return db.Create(&a).Error
}

func GetAdventuresByUser(db *gorm.DB, user_id string) ([]*models.Adventure, error) {
	var adventures []*models.Adventure

	err := db.Where("user_id = ?", user_id).Find(&adventures).Error

	if err != nil {
		return adventures, err
	}

	return adventures, nil
}
