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

func FindMember(db *gorm.DB, group_id *models.Group, user_id *models.User) (found_user *models.User, error error) {
	var member models.UserGroup
	err := db.Table("user_groups").Where("group_id = ? AND user_id = ?", group_id, user_id).First(&member).Error
	if err != nil {
		return nil, err
	}
	return member.User, nil
}

func CheckMembership(db *gorm.DB, group_id string, user *models.User) bool {
	var count int64

	db.Table("user_groups").Where("group_id = ? AND user_id = ?", group_id, user.Uuid).Count(&count)

	return count != 0

}

func Leave(db *gorm.DB, group_id string, user *models.User) error {

	err := db.Table("user_groups").Where("group_id = ? AND user_id = ?", group_id, user.Uuid).Delete(&models.UserGroup{}).Error
	if err != nil {
		return err
	}
	return nil
}
