package build

import "gorm.io/gorm"

func (b *Build) Create(db *gorm.DB) error {

	err := db.Create(&b).Error

	if err != nil {
		return err
	}

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
