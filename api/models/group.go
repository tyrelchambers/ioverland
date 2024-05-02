package models

import "gorm.io/gorm"

type Group struct {
	Uuid    string `gorm:"primaryKey;not null" json:"uuid"`
	Name    string `gorm:"type:varchar(255)" json:"name"`
	Privacy string `json:"privacy" gorm:"default:private"`
	Theme   struct {
		GradientClass string `json:"gradientClass"`
		Color         string `json:"color"`
	} `json:"theme" gorm:"embedded;embeddedPrefix:theme_;"`
	AdminId   string         `json:"admin_id"`
	Admin     User           `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:AdminId;references:Uuid" json:"admin"`
	Members   []*User        `gorm:"many2many:group_members" json:"members"`
	DeletedAt gorm.DeletedAt `gorm:"default:null" json:"deleted_at"`
}
