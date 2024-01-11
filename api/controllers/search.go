package controllers

import (
	dbConfig "api/db"
	"api/domain/build"
	"log"
)

func Search(query string) []build.Build {
	result, err := build.Search(dbConfig.Client, query)

	if err != nil {
		log.Println(err)
		return []build.Build{}
	}

	return result
}
