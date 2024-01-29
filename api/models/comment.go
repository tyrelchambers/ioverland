package models

import (
	"time"

	"github.com/lib/pq"
)

type Comment struct {
	Uuid        string         `gorm:"primaryKey" json:"uuid"`
	Text        string         `gorm:"type:text" json:"text"`
	AuthorId    string         `json:"author_id"`
	Author      User           `json:"author"`
	BuildId     string         `json:"build_id"`
	Build       *Build         `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:BuildId;references:Uuid" json:"build"`
	Replies     []*Comment     `gorm:"many2many:comment_replies;foreignKey:ParentId;references:Uuid;foreignKey:ReplyId;references:Uuid;constraint:OnUpdate:CASCADE" json:"replies"`
	ReplyId     *string        `json:"reply_id" gorm:"type:text"`
	Deleted     bool           `gorm:"default:false" json:"deleted"`
	CreatedAt   time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	Likes       pq.StringArray `gorm:"type:text[]" json:"likes"`
	Adventure   *Adventure     `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:BuildId;references:Uuid" json:"adventure"`
	AdventureId *string        `json:"adventure_id"`
}
