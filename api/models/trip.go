package models

type Trip struct {
	Uuid    string `gorm:"type:uuid;default:gen_random_uuid();primaryKey;" json:"uuid"`
	Name    string `gorm:"type:varchar(255)" json:"name"`
	Year    string `gorm:"type:varchar(255)" json:"year"`
	BuildId string `json:"build_id"`
}
