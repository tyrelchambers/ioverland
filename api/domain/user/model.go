package user

import "api/domain/build"

type User struct {
	Uuid       string        `gorm:"primaryKey" json:"uuid"`
	Builds     []build.Build `json:"builds"`
	Bookmarks  []build.Build `gorm:"many2many:user_bookmarks" json:"bookmarks"`
	CustomerId string        `json:"customer_id"`
}
