package models

type History struct {
	Uuid    string `gorm:"primaryKey" json:"uuid"`
	Event   string `json:"event"`
	Year    string `json:"year"`
	BuildId string `json:"build_id"`
}
