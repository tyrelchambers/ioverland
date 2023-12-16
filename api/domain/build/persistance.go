package build

import (
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
	db.Save(&b)
	db.Model(&b).Association("Trips").Replace(b.Trips)
	db.Model(&b).Association("Modifications").Replace(b.Modifications)

	return nil
}

func AllByUser(db *gorm.DB, user_id string) ([]Build, error) {

	var builds []Build

	err := db.Where("user_id = ?", user_id).Find(&builds).Error

	if err != nil {
		return nil, err
	}

	return builds, nil
}

func GetById(db *gorm.DB, uuid string) (Build, error) {

	var build Build

	err := db.Preload("Trips").Preload("Modifications").Where("uuid = ?", uuid).First(&build).Error

	if err != nil {
		return build, err
	}

	return build, nil
}
