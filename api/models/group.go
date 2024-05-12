package models

import "gorm.io/gorm"

type Group struct {
	Uuid        string `gorm:"primaryKey;not null" json:"uuid"`
	Name        string `gorm:"type:varchar(255)" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	Privacy     string `json:"privacy" gorm:"default:private"`
	Theme       struct {
		Color         string `json:"color"`
		GradientClass string `json:"gradientClass"`
		Hex           string `json:"hex"`
	} `json:"theme" gorm:"embedded;embeddedPrefix:theme_;"`
	AdminId   string         `json:"admin_id"`
	Admin     User           `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:AdminId;references:Uuid" json:"admin"`
	Members   []*User        `gorm:"many2many:user_groups;foreignKey:Uuid;joinForeignKey:GroupId;References:Uuid;JoinReferences:UserId" json:"members"`
	DeletedAt gorm.DeletedAt `gorm:"default:null" json:"deleted_at"`
}
