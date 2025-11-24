package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/services"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
)

type AuthController struct{
	// services 
	userService *services.UserService
}

func NewAuthController(userService *services.UserService) *AuthController {
	return &AuthController{
		userService: userService,
	}
}

func (a *AuthController) Login(c *gin.Context) {
	var payload types.AuthPayload

    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
}
func (a *AuthController) Register(c *gin.Context) {
	var payload types.AuthPayload

    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

	user, err := a.userService.CreateUser(c, payload.Username, payload.PublicKey)
	if err != nil {
		types.BaseResponse{}.FailResponse(c, 500, "Failed to register user", err.Error())
		return
	}

	types.BaseResponse{}.SuccessResponse(c, "User registered successfully", user)
}