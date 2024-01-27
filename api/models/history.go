package models

type History struct {
	Uuid    string `gorm:"primaryKey;default:gen_random_uuid()" json:"uuid"`
	Event   string `json:"event"`
	Year    string `json:"year"`
	BuildId int    `json:"build_id"`
}
