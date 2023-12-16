package build

import "github.com/lib/pq"

type Build struct {
	ID            int            `gorm:"primaryKey" json:"id"`
	Uuid          string         `gorm:"type:uuid;default:gen_random_uuid()" json:"uuid"`
	Name          string         `gorm:"not null" json:"name"`
	Description   string         `gorm:"type:varchar(1000)" json:"description"`
	Budget        string         `gorm:"type:varchar(255)" json:"budget"`
	Trips         []Trip         `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE" json:"trips"`
	Links         pq.StringArray `gorm:"type:text[]" json:"links"`
	Vehicle       Vehicle        `gorm:"embedded;embeddedPrefix:vehicle_;" json:"vehicle"`
	Modifications []Modification `gorm:"constraint:OnUpdate:CASCADE;" json:"modifications"`
	Private       bool           `gorm:"default:false" json:"private"`
	UserId        string         `gorm:"not null" json:"user_id"`
	Banner        string         `json:"banner"`
	Photos        pq.StringArray `gorm:"type:text[]" json:"photos"`
}

type Trip struct {
	ID      int    `gorm:"primaryKey" json:"id"`
	Uuid    string `gorm:"type:uuid;default:gen_random_uuid()" json:"uuid"`
	Name    string `gorm:"type:varchar(255)" json:"name"`
	Year    string `gorm:"type:varchar(255)" json:"year"`
	BuildId int    `json:"build_id"`
	Build   Build  `gorm:"foreignKey:BuildId;references:ID" json:"-"`
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
	Build       Build  `gorm:"foreignKey:BuildId;references:ID" json:"build"`
}
