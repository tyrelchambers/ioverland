package build

import (
	"fmt"

	"gorm.io/gorm"
)

func (b *Build) Create(db *gorm.DB) error {

	err := db.Omit("Likes", "Views").Create(&b).Error

	if err != nil {
		return err
	}

	return nil
}

func (b *Build) IncrementViews(db *gorm.DB) error {
	db.Model(&b).Where("uuid = ?", b.Uuid).Update("views", b.Views+1)
	return nil
}

func (b *Build) Update(db *gorm.DB) error {
	db.Session(&gorm.Session{FullSaveAssociations: true}).Omit("Likes", "Views").Save(&b)

	if db.Error != nil {
		fmt.Println(db.Error)
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
	fmt.Println("--->", build_id, media_id)
	db.Table("media").Where("uuid = ? AND build_id = ?", media_id, build_id).Delete(&Media{})

	return nil
}

func (b *Build) Like(db *gorm.DB, user_id string) error {
	likes := b.Likes
	likes = append(likes, user_id)

	db.Model(&b).Where("uuid = ?", b.Uuid).Update("likes", likes)

	return nil
}

func (b *Build) DisLike(db *gorm.DB, user_id string) error {
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

func (b *Build) Delete(db *gorm.DB) error {

	err := db.Delete(&b).Error

	if err != nil {
		return err
	}

	return nil
}
