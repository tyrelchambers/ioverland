package models

type History struct {
	Uuid    string `gorm:"primaryKey" json:"uuid"`
	Event   string `json:"event"`
	Year    string `json:"year"`
	BuildId int    `json:"build_id"`
}
