package group_service

import (
	"api/models"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, data models.Group) error {
	err := db.Session(&gorm.Session{FullSaveAssociations: true}).Create(&data).Error

	if err != nil {
		return err
	}

	return nil
}
