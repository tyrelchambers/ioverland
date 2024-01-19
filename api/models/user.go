package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	Uuid            string         `gorm:"primaryKey; not null" json:"uuid"`
	Builds          []Build        `json:"builds" gorm:"constraint:OnDelete:SET NULL"`
	Bookmarks       []Build        `gorm:"many2many:user_bookmarks" json:"bookmarks"`
	CustomerId      string         `json:"customer_id"`
	DeletedAt       gorm.DeletedAt `gorm:"default:null" json:"deleted_at"`
	MaxPublicBuilds int            `gorm:"default:1" json:"max_public_builds"`
	Views           int            `gorm:"default:0" json:"views"`
	CreatedAt       time.Time      `json:"created_at" gorm:"autoCreateTime"`
	Bio             string         `gorm:"type:text" json:"bio"`
	Banner          *Media         `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:UserId;references:Uuid" json:"banner"`
	Follows         []*User        `gorm:"many2many:user_follows" json:"followers"`
	Username        string         `json:"username"`
	ImageUrl        string         `json:"image_url"`
	Comments        []*Comment     ` gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:AuthorId;references:Uuid" json:"comments"`
}
