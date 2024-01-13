package controllers

import (
	dbConfig "api/db"
	"api/services/build_service"
	"api/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Search(c *gin.Context) {
	query := c.Query("query")

	result, err := build_service.Search(dbConfig.Client, query)

	if err != nil {
		utils.CaptureError(c, &utils.CaptureErrorParams{
			Message: "[CONTROLLERS] [SEARCH] [SEARCH] Error searching",
			Extra:   map[string]interface{}{"error": err.Error(), "query": query},
		})
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}
