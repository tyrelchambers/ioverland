package controllers

import (
	"api/db"
	"api/domain/build"
	"log"
)

func Search(query string) []build.Build {
	result, err := build.Search(db.Client, query)

	if err != nil {
		log.Println(err)
		return []build.Build{}
	}

	return result
}
