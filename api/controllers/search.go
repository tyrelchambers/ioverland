package controllers

import (
	dbConfig "api/db"
	"api/services/build_service"
	"api/services/user_service"
	"api/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Search(c *gin.Context) {
	var resp []interface{}

	query := c.Query("query")

	results, err := build_service.Search(dbConfig.Client, query)
	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [SEARCH] [SEARCH] Error searching",
			Extra:   map[string]interface{}{"error": err.Error(), "query": query},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	users, err := user_service.Search(dbConfig.Client, query)

	for _, b := range results {
		resp = append(resp, b)
	}

	for _, user := range users {
		resp = append(resp, user)
	}

	c.JSON(http.StatusOK, resp)
}
