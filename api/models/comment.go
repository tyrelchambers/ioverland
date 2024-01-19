package models

import (
	"time"

	"github.com/lib/pq"
)

type Comment struct {
	Uuid      string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"uuid"`
	Text      string         `gorm:"type:text" json:"text"`
	AuthorId  string         `json:"author_id"`
	Author    User           `json:"author"`
	BuildId   string         `json:"build_id"`
	Build     *Build         `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:BuildId;references:Uuid" json:"build"`
	Replies   []*Comment     `gorm:"many2many:comment_replies" json:"replies"`
	Deleted   bool           `gorm:"default:false" json:"deleted"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	Likes     pq.StringArray `gorm:"type:text[]" json:"likes"`
}
