package models

type BuildLikes struct {
	UserUuid  string `gorm:"primaryKey"`
	BuildUuid string `gorm:"primaryKey"`
}
