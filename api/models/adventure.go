package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Adventure struct {
	Uuid         string         `gorm:"primaryKey;default:gen_random_uuid()" json:"uuid"`
	Name         string         `gorm:"type:varchar(255)" json:"name"`
	Summary      string         `json:"summary"`
	Photos       []*Media       `json:"photos"`
	Builds       []Build        `json:"builds" gorm:"many2many:build_adventures;"`
	User         *User          `json:"user"`
	Days         []*Day         `json:"days"`
	UserId       string         `json:"user_id"`
	CreatedAt    time.Time      `json:"created_at" gorm:"autoCreateTime"`
	DeletedAt    *time.Time     `json:"deleted_at"`
	Likes        []*User        `gorm:"many2many:adventure_likes" json:"likes"`
	Comments     []*Comment     `json:"comments"`
	Year         string         `json:"year"`
	YoutubeLinks pq.StringArray `gorm:"type:text[]" json:"youtube_links"`
	Views        int            `gorm:"default:0" json:"views"`
}

type Day struct {
	Uuid        string    `gorm:"primaryKey;default:gen_random_uuid()" json:"uuid"`
	DayNumber   int       `json:"day_number"`
	Name        string    `json:"name"`
	Notes       string    `json:"notes"`
	Weather     string    `json:"weather"`
	AdventureId string    `json:"adventure_id"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	DeletedAt   *time.Time
	Stops       []*Stops `json:"stops"`
}

type Stops struct {
	gorm.Model
	DayId   string  `json:"day_id"`
	Summary string  `json:"summary"`
	Lat     float64 `json:"lat"`
	Lng     float64 `json:"lng"`
}
