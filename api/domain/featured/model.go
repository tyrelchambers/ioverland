package featured

import "api/domain/build"

type Featured struct {
	ID    int         `gorm:"primaryKey" json:"id"`
	Build build.Build `json:"build"`
}
