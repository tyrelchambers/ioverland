package controllers

import (
	dbConfig "api/db"
	"api/domain/build"
	"api/services"
	"errors"
	"fmt"

	"github.com/clerkinc/clerk-sdk-go/clerk"
)

type EditResponse struct {
	Build         build.Build `json:"build"`
	Can_be_public bool        `json:"can_be_public"`
}

func countVisibleBuilds(user services.AccountResponse) int {
	count := 0
	for _, build := range user.Builds {
		if build.Public {
			count++
		}
	}
	return count
}

func canBePublic(user services.AccountResponse) bool {
	return countVisibleBuilds(user) <= user.MaxPublicBuilds
}

func Build(newBuild build.Build, clerk_user *clerk.User) (build.Build, error) {

	acc := services.GetUserAccount(clerk_user.ID)

	if acc.BuildsRemaining == 0 {
		return build.Build{}, errors.New("You have reached your build limit")
	}

	if newBuild.Name == "" {
		return build.Build{}, errors.New("Name is required")
	}

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
		Public:        newBuild.Public,
		Trips:         trips,
		Links:         links,
		UserId:        newBuild.UserId,
		Banner:        newBuild.Banner,
		Photos:        newBuild.Photos,
	}

	err := buildEntity.Create(dbConfig.Client)

	if err != nil {
		fmt.Println(err)
		return build.Build{}, err
	}

	return *buildEntity, nil
}

func GetById(id string) (build.Build, error) {
	buildEntity, err := build.GetById(dbConfig.Client, id)

	if err != nil {
		return build.Build{}, err
	}

	return buildEntity, nil

}

func UpdateBuild(id string, data build.Build) (build.Build, error) {

	err := data.Update(dbConfig.Client)

	if err != nil {
		return build.Build{}, err
	}

	return data, nil
}

func RemoveImage(build_id string, media_id string) error {
	return build.RemoveImage(dbConfig.Client, build_id, media_id)
}

func IncrementViews(id string) error {
	build, err := GetById(id)

	if err != nil {
		return err
	}

	return build.IncrementViews(dbConfig.Client)
}

func Like(build_id, user_id string) error {

	build, err := GetById(build_id)

	if err != nil {
		return err
	}

	build.Like(dbConfig.Client, user_id)

	return nil
}

func Dislike(build_id, user_id string) error {

	build, err := GetById(build_id)

	if err != nil {
		return err
	}

	build.DisLike(dbConfig.Client, user_id)

	return nil
}
func DeleteBuild(id string) error {

	build, err := GetById(id)
	banner := build.Banner
	photos := build.Photos

	if banner.Url != "" {
		DeleteImageFromStorage(banner.Url)
	}

	if len(photos) > 0 {
		for _, v := range photos {
			DeleteImageFromStorage(v.Url)
		}
	}

	if err != nil {
		return err
	}

	return build.Delete(dbConfig.Client)
}

func BuildEditSettings(id string, data build.Build) (EditResponse, error) {
	var resp EditResponse

	build, err := GetById(id)

	if err != nil {
		fmt.Println("Error getting build in edit settings: ", err)
		return EditResponse{}, err
	}

	account := services.GetUserAccount(build.UserId)

	if err != nil {
		fmt.Println("[BUILD CONTROLLER] [BUILD EDIT SETTINGS] [ACCOUNT] Error getting account in edit settings: ", err)
		return EditResponse{}, err
	}

	can_toggle := canBePublic(account)

	fmt.Println(countVisibleBuilds(account) <= account.MaxPublicBuilds)

	resp.Can_be_public = can_toggle

	resp.Build = build

	return resp, nil
}
