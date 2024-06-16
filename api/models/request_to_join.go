package models

type RequestToJoin struct {
	GroupId string `json:"groupId"`
	UserId  string `json:"userId"`
	User    *User  `json:"user"`
	Status  string `json:"status"`
}
