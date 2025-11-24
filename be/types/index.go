package types

import "github.com/gin-gonic/gin"

type BaseResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

func (BaseResponse) SuccessResponse(ctx *gin.Context, message string, data interface{}) {
	ctx.JSON(200, BaseResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func (BaseResponse) FailResponse(ctx *gin.Context, status int, message string, err interface{}) {
	ctx.JSON(status, BaseResponse{
		Success: false,
		Message: message,
		Error:   err,
	})
}