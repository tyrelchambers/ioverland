package build_service

import (
	"api/models"

	"gorm.io/gorm"
)

type Build struct {
	models.Build
}

func (b *Build) Create(db *gorm.DB) error {

	err := db.Omit("Likes", "Views").Create(&b).Error

	if err != nil {
		return err
	}

	return nil
}

func IncrementViews(db *gorm.DB, b models.Build) error {
	db.Model(&b).Where("uuid = ?", b.Uuid).Update("views", b.Views+1)
	return nil
}

func (b *Build) Update(db *gorm.DB) error {
	db.Session(&gorm.Session{FullSaveAssociations: true}).Omit("Likes", "Views").Save(&b)

	if db.Error != nil {
		return db.Error
	}

	return nil
}

func AllByUser(db *gorm.DB, user_id string) ([]Build, error) {

	var builds []Build

	err := db.Order("name").Preload("Banner", "type='banner'").Where("user_id = ?", user_id).Find(&builds).Error

	if err != nil {
		return nil, err
	}

	return builds, nil
}

func GetById(db *gorm.DB, uuid string) (models.Build, error) {

	var build models.Build

	db.Preload("Trips").Preload("Modifications").Where("uuid = ?", uuid).First(&build)

	db.Table("media").Where("build_id = ? AND type = 'banner'", uuid).First(&build.Banner)

	db.Table("media").Where("build_id = ? AND type = 'photos'", uuid).Find(&build.Photos)

	if db.Error != nil {
		return build, db.Error
	}

	return build, nil
}

func RemoveImage(db *gorm.DB, build_id, media_id string) error {
	db.Table("media").Where("id = ? AND build_id = ?", media_id, build_id).Delete(&models.Media{})

	return nil
}

func Like(db *gorm.DB, user_id string, b models.Build) error {
	likes := b.Likes
	likes = append(likes, user_id)

	db.Model(&b).Where("uuid = ?", b.Uuid).Update("likes", likes)

	return nil
}

func DisLike(db *gorm.DB, user_id string, b models.Build) error {
	likes := b.Likes
	for i, like := range likes {
		if like == user_id {
			likes = append(likes[:i], likes[i+1:]...)
			break
		}
	}

	db.Model(&b).Where("uuid = ?", b.Uuid).Update("likes", likes)

	return nil
}

func Delete(db *gorm.DB, b models.Build) error {

	err := db.Delete(&b).Error

	if err != nil {
		return err
	}

	return nil
}

func AllBuildsCount(db *gorm.DB) (int64, error) {
	var count int64
	err := db.Model(&Build{}).Count(&count).Error
	return count, err
}

func Search(db *gorm.DB, query string) ([]models.Build, error) {
	var builds []models.Build

	err := db.Where("name ILIKE ? AND public = true", "%"+query+"%").Preload("Banner", "type='banner'").Find(&builds).Error
	return builds, err
}
