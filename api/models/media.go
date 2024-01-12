package models

type Media struct {
	ID       int    `gorm:"primaryKey" json:"id"`
	BuildId  string `gorm:"type:uuid;" json:"build_id"`
	Name     string `gorm:"type:varchar(255)" json:"name"`
	Type     string `gorm:"type:varchar(255)" json:"type"`
	MimeType string `gorm:"type:varchar(255)" json:"mime_type"`
	Url      string `json:"url"`
}
