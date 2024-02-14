package models

import "gorm.io/gorm"

type AdventureLikes struct {
	gorm.Model
	UserId      string `gorm:"primaryKey"`
	AdventureId string `gorm:"primaryKey"`
}
