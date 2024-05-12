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

func GetById(db *gorm.DB, uuid string) (*models.Group, error) {
	var group *models.Group
	err := db.Where("uuid = ?", uuid).Preload("Admin").Preload("Members").First(&group).Error
	if err != nil {
		return group, err
	}
	return group, nil
}

func Update(db *gorm.DB, data models.Group) error {
	err := db.Save(&data).Error
	if err != nil {
		return err
	}
	return nil
}

func Join(db *gorm.DB, group *models.Group, user *models.User) error {

	err := db.Create(&models.UserGroup{
		GroupId: group.Uuid,
		UserId:  user.Uuid,
	}).Error

	if err != nil {
		return err
	}

	return nil
}
