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

func CheckMembership(db *gorm.DB, group_id string, user_id string) bool {
	var count int64

	db.Table("user_groups").Where("group_id = ? AND user_id = ?", group_id, user_id).Count(&count)

	return count != 0

}

func Leave(db *gorm.DB, group_id string, user *models.User) error {

	err := db.Table("user_groups").Where("group_id = ? AND user_id = ?", group_id, user.Uuid).Delete(&models.UserGroup{}).Error
	if err != nil {
		return err
	}
	return nil
}

func RequestToJoin(db *gorm.DB, groupId, userId string) error {
	err := db.Create(&models.RequestToJoin{
		GroupId: groupId,
		UserId:  userId,
		Status:  "pending",
	})

	if err != nil {
		return err.Error
	}
	return nil
}

func GetRequests(db *gorm.DB, groupId string) ([]models.RequestToJoin, error) {

	var requests []models.RequestToJoin
	err := db.Table("request_to_joins").Preload("User").Where("group_id = ?", groupId).Find(&requests).Error
	if err != nil {
		return nil, err
	}
	return requests, nil
}

func RequestDecision(db *gorm.DB, groupId, userId, status string) error {
	if status == "approve" {
		err := db.Table("request_to_joins").Where("group_id = ? AND user_id = ?", groupId, userId).Update("status", "approved").Error
		if err != nil {
			return err
		}

		db.Table("user_groups").Create(models.UserGroup{
			UserId:  userId,
			GroupId: groupId,
		})
		return nil
	} else if status == "deny" {
		err := db.Table("request_to_joins").Where("group_id = ? AND user_id = ?", groupId, userId).Update("status", "denied").Error
		if err != nil {
			return err
		}
		return nil
	}

	return nil
}
