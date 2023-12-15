package controllers

import (
	"api/db"
	"api/domain/build"
)

func GetUserBuilds(user_id string) ([]build.BuildDto, error) {
	var buildsDto []build.BuildDto
	builds, err := build.AllByUser(db.Client, user_id)

	if err != nil {
		return nil, err
	}

	for _, v := range builds {
		buildsDto = append(buildsDto, v.ToDTO())
	}

	return buildsDto, nil

}
