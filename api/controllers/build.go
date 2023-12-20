package controllers

import (
	"api/db"
	"api/domain/build"
	"fmt"
)

func Build(newBuild build.Build) (build.Build, error) {
	modifications := []build.Modification{}
	links := []string{}
	trips := []build.Trip{}

	for _, v := range newBuild.Trips {
		trips = append(trips, build.Trip{
			Name:    v.Name,
			Year:    v.Year,
			BuildId: v.BuildId,
		})
	}

	for _, v := range newBuild.Links {
		links = append(links, v)
	}
	for _, v := range newBuild.Modifications {
		modifications = append(modifications, build.Modification{
			Category:    v.Category,
			Subcategory: v.Subcategory,
			Name:        v.Name,
			Price:       v.Price,
		})
	}

	buildEntity := &build.Build{
		Name:        newBuild.Name,
		Description: newBuild.Description,
		Budget:      newBuild.Budget,
		Vehicle: build.Vehicle{
			Model: newBuild.Vehicle.Model,
			Make:  newBuild.Vehicle.Make,
			Year:  newBuild.Vehicle.Year,
		},
		Modifications: modifications,
		Private:       newBuild.Private,
		Trips:         trips,
		Links:         links,
		UserId:        newBuild.UserId,
		Banner:        newBuild.Banner,
		Photos:        newBuild.Photos,
	}

	err := buildEntity.Create(db.Client)

	if err != nil {
		fmt.Println(err)
		return build.Build{}, err
	}

	return *buildEntity, nil
}

func GetById(id string) (build.Build, error) {
	buildEntity, err := build.GetById(db.Client, id)

	if err != nil {
		return build.Build{}, err
	}

	return buildEntity, nil

}

func UpdateBuild(id string, data build.Build) (build.Build, error) {

	err := data.Update(db.Client)

	if err != nil {
		return build.Build{}, err
	}

	return data, nil
}

func RemoveImage(build_id string, media_id string) error {
	return build.RemoveImage(db.Client, build_id, media_id)
}

func IncrementViews(id string) error {
	build, err := GetById(id)

	if err != nil {
		return err
	}

	return build.IncrementViews(db.Client)
}

func Like(build_id, user_id string) error {

	build, err := GetById(build_id)

	if err != nil {
		return err
	}

	build.Like(db.Client, user_id)

	return nil
}

func Dislike(build_id, user_id string) error {

	build, err := GetById(build_id)

	if err != nil {
		return err
	}

	build.DisLike(db.Client, user_id)

	return nil
}
