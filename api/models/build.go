package models

import (
	"time"

	"github.com/lib/pq"
)

type Build struct {
	ID            int            `gorm:"primaryKey" json:"id"`
	Uuid          string         `gorm:"type:uuid;default:gen_random_uuid()" json:"uuid"`
	Name          string         `gorm:"not null" json:"name"`
	Description   string         `gorm:"type:text" json:"description"`
	Budget        string         `gorm:"type:varchar(255)" json:"budget"`
	Trips         []Trip         `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:BuildId" json:"trips"`
	Links         pq.StringArray `gorm:"type:text[]" json:"links"`
	Vehicle       Vehicle        `gorm:"embedded;embeddedPrefix:vehicle_;" json:"vehicle"`
	Modifications []Modification `gorm:"constraint:OnUpdate:CASCADE;foreignKey:BuildId" json:"modifications"`
	Public        bool           `gorm:"default:false" json:"public"`
	UserId        string         `gorm:"not null" json:"user_id"`
	Banner        Media          `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:BuildId;references:Uuid" json:"banner"`
	Photos        []Media        `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:BuildId;references:Uuid" json:"photos"`
	Views         int            `gorm:"default:0" json:"views"`
	Likes         pq.StringArray `gorm:"type:text[]" json:"likes"`
	FeaturedOn    time.Time      `json:"featured_on"`
	Comments      []*Comment     `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:BuildId;references:Uuid" json:"comments"`
}

type Vehicle struct {
	Model string `gorm:"type:varchar(255)" json:"model"`
	Make  string `gorm:"type:varchar(255)" json:"make"`
	Year  string `gorm:"type:varchar(255)" json:"year"`
}

type Modification struct {
	ID          int    `gorm:"primaryKey" json:"id"`
	Category    string `gorm:"type:varchar(255)" json:"category"`
	Subcategory string `gorm:"type:varchar(255)" json:"subcategory"`
	Name        string `gorm:"type:varchar(255)" json:"name"`
	Price       string `gorm:"type:varchar(255)" json:"price"`
	BuildId     int    `json:"build_id"`
}
