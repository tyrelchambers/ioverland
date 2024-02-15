package models

type AdventureLikes struct {
	UserId      string `gorm:"primaryKey"`
	AdventureId string `gorm:"primaryKey"`
}
