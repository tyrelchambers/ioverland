package controllers

import (
	"api/db"
	"api/domain/build"
)

func Build(newBuild build.BuildDto) (build.BuildDto, error) {
	modifications := []build.Modification{}
	links := []string{}
	trips := []build.Trip{}

	for _, v := range newBuild.Trips {
		trips = append(trips, build.Trip{
			Name: v.Name,
			Year: v.Year,
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
	}

	err := buildEntity.Create(db.Client)

	if err != nil {
		return build.BuildDto{}, err
	}

	return buildEntity.ToDTO(), nil
}
