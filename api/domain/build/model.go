package build

import "github.com/lib/pq"

type Build struct {
	ID            int `gorm:"primaryKey"`
	Name          string
	Description   string
	Budget        string
	Trips         []Trip
	Links         pq.StringArray `gorm:"type:text[]"`
	Vehicle       Vehicle
	Modifications []Modification
	Private       bool
	UserId        string
}

type Trip struct {
	ID      int `gorm:"primaryKey"`
	Name    string
	Year    string
	BuildId int
	Build   Build `gorm:"foreignKey:BuildId;references:ID"`
}

type Vehicle struct {
	ID      int `gorm:"primaryKey"`
	Model   string
	Make    string
	Year    string
	BuildId int
}

type Modification struct {
	ID          int `gorm:"primaryKey"`
	Category    string
	Subcategory string
	Name        string
	Price       string
	BuildId     int
	Build       Build `gorm:"foreignKey:BuildId;references:ID"`
}

// DTOS ----

type BuildDto struct {
	Name          string            `json:"name"`
	Description   string            `json:"description"`
	Budget        string            `json:"budget"`
	Trips         []TripDto         `json:"trips"`
	Links         pq.StringArray    `json:"links"`
	Vehicle       VehicleDto        `json:"vehicle"`
	Modifications []ModificationDto `json:"modifications"`
	Private       bool              `json:"private"`
	UserId        string            `json:"user_id"`
}

type TripDto struct {
	Name string `json:"name"`
	Year string `json:"year"`
}

type VehicleDto struct {
	Model string `json:"model"`
	Make  string `json:"make"`
	Year  string `json:"year"`
}

type ModificationDto struct {
	Category    string `json:"category"`
	Subcategory string `json:"subcategory"`
	Name        string `json:"name"`
	Price       string `json:"price"`
}
