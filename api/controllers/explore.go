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

	top_10_likes, err := build.GetTop10ByLikes(db.Client)
	top_10_views, err := build.GetTop10ByViews(db.Client)

	if err != nil {
		return ExploreRes{}, err
	}

	for i := 0; i < 5; i++ {
		randInt := rand.Intn(len(top_10_likes))
		res.Top10 = append(res.Top10, top_10_likes[randInt])
	}

	for i := 0; i < 5; i++ {
		randInt := rand.Intn(len(top_10_views))
		res.Top10 = append(res.Top10, top_10_views[randInt])
	}

	for i := 0; i < 2; i++ {
		randInt := rand.Intn(len(top_10_likes))
		res.Featured = append(res.Featured, top_10_likes[randInt])
	}

	for i := 0; i < 2; i++ {
		randInt := rand.Intn(len(top_10_views))
		res.Featured = append(res.Featured, top_10_views[randInt])
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
