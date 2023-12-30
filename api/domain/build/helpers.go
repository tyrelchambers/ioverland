package build

import "gorm.io/gorm"

func GetTop10ByLikes(db *gorm.DB) ([]Build, error) {
	var builds []Build
	err := db.Model(&Build{}).Preload("Banner", "type='banner'").Order("likes desc").Limit(10).Find(&builds).Error
	return builds, err
}

func GetTop10ByViews(db *gorm.DB) ([]Build, error) {
	var builds []Build
	err := db.Model(&Build{}).Preload("Banner", "type='banner'").Order("views desc").Limit(10).Find(&builds).Error
	return builds, err
}
