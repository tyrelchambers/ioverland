package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	Uuid            string         `gorm:"primaryKey; not null" json:"uuid"`
	Builds          []Build        `json:"builds"`
	Bookmarks       []Build        `gorm:"many2many:user_bookmarks" json:"bookmarks"`
	CustomerId      string         `json:"customer_id"`
	DeletedAt       gorm.DeletedAt `gorm:"default:null" json:"deleted_at"`
	MaxPublicBuilds int            `gorm:"default:1" json:"max_public_builds"`
	Views           int            `gorm:"default:0" json:"views"`
	CreatedAt       time.Time      `json:"created_at" gorm:"autoCreateTime"`
	Bio             string         `gorm:"type:text" json:"bio"`
}
