package user

import (
	"api/domain/build"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, user *User) error {
	return db.Create(user).Error
}

func (u User) Bookmark(db *gorm.DB, build build.Build) error {
	db.Model(&u).Association("Bookmarks").Append(&build)

	if db.Error != nil {
		return db.Error
	}

	return nil
}

func (u User) Unbookmark(db *gorm.DB, build build.Build) error {
	db.Model(&u).Association("Bookmarks").Delete(&build)

	if db.Error != nil {
		return db.Error
	}

	return nil
}

func FindCurrentUser(db *gorm.DB, uuid string) (User, error) {
	var user User
	err := db.Preload("Bookmarks.Banner", "type='banner'").Preload("Builds.Banner", "type='banner'").Where("uuid = ?", uuid).First(&user).Error
	return user, err
}

func (u User) Update(db *gorm.DB) error {
	return db.Save(u).Error
}

func FindUserByCustomerId(db *gorm.DB, customerId string) (User, error) {
	var user User
	err := db.Where("customer_id = ?", customerId).First(&user).Error
	return user, err
}

func (u User) Delete(db *gorm.DB) error {
	return db.Delete(u).Error
}

func (u User) BuildCount(db *gorm.DB) (int64, error) {
	var builds int64
	err := db.Table("builds").Where("user_id = ?", u.Uuid).Count(&builds).Error
	return builds, err
}
