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

	err := db.Preload("Photos").Where("user_id = ?", user_id).Find(&adventures).Error

	if err != nil {
		return adventures, err
	}

	return adventures, nil
}

func GetById(db *gorm.DB, uuid string) (*models.Adventure, error) {
	var adventure *models.Adventure

	err := db.Preload("Photos").Preload("User").Where("uuid = ?", uuid).First(&adventure).Error

	if err != nil {
		return adventure, err
	}

	return adventure, nil
}

func IncreaseViews(db *gorm.DB, uuid string) error {
	return db.Table("adventures").Where("uuid = ?", uuid).Update("views", gorm.Expr("views + 1")).Error
}
