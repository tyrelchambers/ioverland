package user

import (
	"api/domain/build"

	"gorm.io/gorm"
)

type User struct {
	Uuid       string         `gorm:"primaryKey; not null" json:"uuid"`
	Builds     []build.Build  `json:"builds"`
	Bookmarks  []build.Build  `gorm:"many2many:user_bookmarks" json:"bookmarks"`
	CustomerId string         `json:"customer_id"`
	DeletedAt  gorm.DeletedAt `gorm:"default:null" json:"deleted_at"`
}
