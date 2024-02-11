package models

import (
	"time"

	"github.com/lib/pq"
)

type Adventure struct {
	Uuid         string         `gorm:"primaryKey;default:gen_random_uuid()" json:"uuid"`
	Name         string         `gorm:"type:varchar(255)" json:"name"`
	Summary      string         `json:"summary"`
	Photos       []*Media       `json:"photos"`
	Builds       *Build         `json:"builds"`
	User         *User          `json:"user"`
	Waypoints    []*Waypoint    `json:"waypoints"`
	Days         []*Day         `json:"days"`
	UserId       string         `json:"user_id"`
	CreatedAt    time.Time      `json:"created_at" gorm:"autoCreateTime"`
	DeletedAt    *time.Time     `json:"deleted_at"`
	Likes        pq.StringArray `gorm:"type:text[]" json:"likes"`
	Comments     []*Comment     `json:"comments"`
	Year         string         `json:"year"`
	YoutubeLinks pq.StringArray `gorm:"type:text[]" json:"youtube_links"`
	Views        int            `gorm:"default:0" json:"views"`
}

type Day struct {
	Uuid        string    `gorm:"primaryKey;default:gen_random_uuid()" json:"uuid"`
	Name        string    `json:"name"`
	Notes       string    `json:"notes"`
	Weather     string    `json:"weather"`
	Location    *Location `gorm:"foreignKey:DayId;references:Uuid" json:"location"`
	AdventureId string    `json:"adventure_id"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	DeletedAt   *time.Time
}

type Location struct {
	Uuid       string    `gorm:"primaryKey;default:gen_random_uuid()" json:"uuid"`
	Lat        string    `json:"lat"`
	Lng        string    `json:"lng"`
	WaypointId *string   `json:"waypoint_id"`
	DayId      *string   `json:"day_id"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	DeletedAt  *time.Time
}

type Waypoint struct {
	Uuid        string    `gorm:"primaryKey;default:gen_random_uuid()" json:"uuid"`
	Name        string    `json:"name"`
	AdventureId string    `json:"adventure_id"`
	Location    *Location `gorm:"foreignKey:WaypointId;references:Uuid" json:"location"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	DeletedAt   *time.Time
}
