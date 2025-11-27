package types

import "github.com/gin-gonic/gin"

func SuccessResponse(ctx *gin.Context, message string, data interface{}) {
	ctx.JSON(200, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

func FailResponse(ctx *gin.Context, status int, message string, err interface{}) {
	ctx.JSON(status, gin.H{
		"success": false,
		"message": message,
		"error":   err,
	})
}