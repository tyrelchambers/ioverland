package controllers

import (
	"api/db"
	"api/domain/build"
	"math/rand"
)

type ExploreRes struct {
	Top10    []build.Build `json:"top_10"`
	Featured []build.Build `json:"featured"`
}

func Explore() (ExploreRes, error) {
	var res ExploreRes

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

	return res, nil

}
