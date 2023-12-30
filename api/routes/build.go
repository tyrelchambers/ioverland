package routes

import (
	"api/controllers"
	"api/domain/build"
	"api/middleware"
	"fmt"

	"github.com/gin-gonic/gin"
)

func CreateBuild(c *gin.Context) {
	user, err := middleware.Authorize(c)
	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	var reqBody build.Build

	if err := c.Bind(&reqBody); err != nil {
		fmt.Println(err)
		c.String(500, err.Error())
		return
	}

	reqBody.UserId = user.ID

	newBuild, err := controllers.Build(reqBody, user)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.JSON(200, newBuild)
}

func GetBuilds(c *gin.Context) {
	user_id := c.Param("user_id")

	builds, err := controllers.GetUserBuilds(user_id)

	if err != nil {
		c.JSON(500, err)
		return
	}

	c.JSON(200, builds)
}

func GetById(c *gin.Context) {
	id := c.Param("build_id")

	build, err := controllers.GetById(id)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.JSON(200, build)
}

func Update(c *gin.Context) {
	id := c.Param("build_id")

	var reqBody build.Build

	if err := c.Bind(&reqBody); err != nil {
		c.String(500, err.Error())
		return
	}

	updated_build, err := controllers.UpdateBuild(id, reqBody)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.JSON(200, updated_build)
}

func RemoveImage(c *gin.Context) {
	id := c.Param("build_id")
	build_id := c.Param("build_id")
	url := c.Query("url")

	err := controllers.RemoveImage(build_id, id)
	err = controllers.Revert(c, url)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}

func IncrementViews(c *gin.Context) {
	id := c.Param("build_id")

	controllers.IncrementViews(id)

	c.String(200, "success")
}

func Like(c *gin.Context) {
	id := c.Param("build_id")
	user, err := middleware.Authorize(c)
	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	err = controllers.Like(id, user.ID)

	c.String(200, "success")
}

func Dislike(c *gin.Context) {
	id := c.Param("build_id")
	user, err := middleware.Authorize(c)
	if err != nil {
		c.String(401, "Unauthorized")
		return
	}

	err = controllers.Dislike(id, user.ID)

	c.String(200, "success")
}

func Delete(c *gin.Context) {
	id := c.Param("build_id")

	err := controllers.DeleteBuild(id)

	if err != nil {
		c.String(500, err.Error())
		return
	}

	c.String(200, "success")
}
