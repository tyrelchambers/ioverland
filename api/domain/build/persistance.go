package build

import (
	"fmt"

	"gorm.io/gorm"
)

func (b *Build) Create(db *gorm.DB) error {

	err := db.Create(&b).Error

	if err != nil {
		return err
	}

	return nil
}

func (b *Build) Update(db *gorm.DB) error {
	db.Transaction(func(tx *gorm.DB) error {
		tx.Save(&b)
		tx.Model(&b).Association("Trips").Replace(&b.Trips)
		tx.Model(&b).Association("Modifications").Replace(&b.Modifications)
		tx.Model(&b).Association("Photos").Append(&b.Photos)

		return nil
	})

	if db.Error != nil {
		fmt.Println(db.Error)
		return db.Error
	}

	return nil
}

func AllByUser(db *gorm.DB, user_id string) ([]Build, error) {

	var builds []Build

	err := db.Preload("Banner").Where("user_id = ?", user_id).Find(&builds).Error

	if err != nil {
		return nil, err
	}

	return builds, nil
}

func GetById(db *gorm.DB, uuid string) (Build, error) {

	var build Build

	db.Preload("Trips").Preload("Modifications").Where("uuid = ?", uuid).First(&build)

	db.Table("media").Where("build_id = ? AND type = 'banner'", uuid).First(&build.Banner)

	db.Table("media").Where("build_id = ? AND type = 'photos'", uuid).Find(&build.Photos)

	if db.Error != nil {
		return build, db.Error
	}

	return build, nil
}

func RemoveImage(db *gorm.DB, build_id, media_id string) error {
	db.Table("media").Where("uuid = ? AND build_id = ?", media_id, build_id).Delete(&Media{})

	return nil
}
