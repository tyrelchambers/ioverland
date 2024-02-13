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

	err := db.Preload("Photos").Preload("Days").Preload("Builds").Preload("User").Preload("Builds.User").Preload("Builds.Banner", func(db *gorm.DB) *gorm.DB {
		return db.Where("type = 'banner'")
	}).Where("uuid = ?", uuid).First(&adventure).Error

	if err != nil {
		return adventure, err
	}

	return adventure, nil
}

func IncreaseViews(db *gorm.DB, uuid string) error {
	return db.Table("adventures").Where("uuid = ?", uuid).Update("views", gorm.Expr("views + 1")).Error
}

func RemoveImage(db *gorm.DB, adventure_id, media_id string) error {
	db.Table("media").Where("id = ? AND adventure_id = ?", media_id, adventure_id).Delete(&models.Media{})

	return nil
}

func Update(db *gorm.DB, a *models.Adventure) error {
	return db.Save(&a).Error
}

func RemoveBuild(db *gorm.DB, uuid, build_id string) error {
	err := db.Table("build_adventures").Where("adventure_uuid = ? AND build_id = ?", uuid, build_id).Delete(map[string]interface{}{"adventure_uuid": uuid,
		"build_id": build_id}).Error

	if err != nil {
		return err
	}

	return nil
}

func RemoveDay(db *gorm.DB, uuid string) error {
	err := db.Table("days").Where("uuid = ?", uuid).Delete(&uuid).Error

	if err != nil {
		return err
	}

	return nil
}
