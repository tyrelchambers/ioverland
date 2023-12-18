package controllers

import (
	"api/db"
	"api/domain/build"
)

func GetUserBuilds(user_id string) ([]build.Build, error) {
	builds, err := build.AllByUser(db.Client, user_id)

	if err != nil {
		return nil, err
	}

	return builds, nil

}
