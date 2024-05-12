package models

type UserGroup struct {
	UserId  string `gorm:"primaryKey"`
	GroupId string `gorm:"primaryKey"`
	Role    string
	Group   *Group `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:GroupId;references:Uuid" json:"group"`
	User    *User  `gorm:"constraint:OnUpdate:CASCADE;OnDelete:CASCADE;foreignKey:UserId;references:Uuid" json:"user"`
}
