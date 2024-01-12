package models

type Trip struct {
	ID      int    `gorm:"primaryKey" json:"id"`
	Uuid    string `gorm:"type:uuid;default:gen_random_uuid()" json:"uuid"`
	Name    string `gorm:"type:varchar(255)" json:"name"`
	Year    string `gorm:"type:varchar(255)" json:"year"`
	BuildId int    `json:"build_id"`
}
