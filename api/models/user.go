package models

import (
	"gorm.io/gorm"
)

type User struct {
	Uuid            string         `gorm:"primaryKey; not null" json:"uuid"`
	Builds          []Build        `json:"builds"`
	Bookmarks       []Build        `gorm:"many2many:user_bookmarks" json:"bookmarks"`
	CustomerId      string         `json:"customer_id"`
	DeletedAt       gorm.DeletedAt `gorm:"default:null" json:"deleted_at"`
	MaxPublicBuilds int            `gorm:"default:1" json:"max_public_builds"`
}
