package controllers

import (
	"api/db"
	"api/domain/user"
)

func Bookmark(build_id, user_id string) error {

	build, err := GetById(build_id)

	if err != nil {
		return err
	}

	user, err := user.FindCurrentUser(db.Client, user_id)

	if err != nil {
		return err
	}

	user.Bookmark(db.Client, build)

	return nil
}

func Unbookmark(build_id, user_id string) error {

	build, err := GetById(build_id)

	if err != nil {
		return err
	}

	user, err := user.FindCurrentUser(db.Client, user_id)

	if err != nil {
		return err
	}

	user.Unbookmark(db.Client, build)

	return nil
}

func GetCurrentUser(id string) (user.User, error) {
	return user.FindCurrentUser(db.Client, id)
}
