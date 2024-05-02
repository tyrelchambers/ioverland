package group_service

import (
	"api/models"
	"fmt"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, data models.Group) error {
	err := db.Session(&gorm.Session{FullSaveAssociations: true}).Create(&data).Error

	if err != nil {
		return err
	}

	fmt.Println("Created group")

	return nil
}
