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

func FindUser(db *gorm.DB, uuid string) (User, error) {
	var user User
	err := db.Preload("Bookmarks").Preload("Builds").Where("uuid = ?", uuid).First(&user).Error
	return user, err
}
