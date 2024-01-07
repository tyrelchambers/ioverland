package controllers

import (
	"api/db"
	"api/domain/build"
	"fmt"
	"math/rand"
)

type ExploreRes struct {
	Top10         []build.Build `json:"top_10"`
	Featured      []build.Build `json:"featured"`
	GoalRemaining int           `json:"goal_remaining"`
	BuildCount    int64         `json:"build_count"`
}

func Explore() (ExploreRes, error) {
	var res ExploreRes

	count, err := build.AllBuildsCount(db.Client)

	if err != nil {
		fmt.Println(err)
		return ExploreRes{}, err
	}

	rand.Shuffle(len(res.Top10), func(i, j int) { res.Top10[i], res.Top10[j] = res.Top10[j], res.Top10[i] })

	if 20-int(count) < 0 {
		res.GoalRemaining = 0
	} else {
		res.GoalRemaining = 20 - int(count)
	}

	res.BuildCount = count

	return res, nil

}
