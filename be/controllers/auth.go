package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/prisma/db"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/services"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
)

type AuthController struct{
	// services 
	userService *services.UserService
	authService *services.AuthService
}

func NewAuthController(userService *services.UserService, authService *services.AuthService) *AuthController {
	return &AuthController{
		userService: userService,
		authService: authService,
	}
}

func (a *AuthController) ReqChallenge(c *gin.Context) {
	var req types.NonceChallengeRequest
	
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := a.userService.CheckUserExists(c, req.Username); err != nil {
		types.FailResponse(c, 404, "User not found", req.Username)
		return
	}

	nonce, err := services.GenerateNonce()
	if err != nil {
		types.FailResponse(c, 500, "Failed to generate nonce", err.Error())
		return
	}

	services.StoreNonce(req.Username, nonce, 2*time.Minute)
	fmt.Println("Init Nonce: ", nonce)

	types.SuccessResponse(c, "Challenge generated", types.ChallengeResponse{Nonce: nonce})
}

func (a *AuthController) Login(c *gin.Context) {
	var loginPayload types.LoginRequest

    if err := c.ShouldBindJSON(&loginPayload); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

	user, err := a.userService.GetUserByUsername(c, loginPayload.Username)
	if err != nil {
		types.FailResponse(c, 404, "User not found", err.Error())
		return
	}

	publicKey := types.PublicKey{
		X: user.PublicKeyX,
		Y: user.PublicKeyY,
	} 

	refreshToken, accessToken, err := a.authService.ProcessLogin(c, user, publicKey, loginPayload)
	if err != nil {
		types.FailResponse(c, 401, "Login failed", err.Error())
		return
	}

	c.SetCookie(
		"refresh_token",
		refreshToken,
		int(types.EXPIRATION_REFRESH_TOKEN.Seconds()),
		"/",
		"",   // domain (sesuaikan)
		true, // secure (set true di prod, bisa false di dev http)
		true, // httpOnly
	)

	types.SuccessResponse(c, "Login successful", gin.H{
		"access_token": accessToken,
	})
}
func (a *AuthController) Register(c *gin.Context) {
	var payload types.IdentityPayload

    if err := c.ShouldBindJSON(&payload); err != nil {
        types.FailResponse(c, http.StatusBadRequest, "Bad Request", err)
		return
	}

	user, err := a.userService.CreateUser(c, payload.Username, payload.PublicKeyHex)
	if err != nil {
		if _, ok := db.IsErrUniqueConstraint(err); ok {
			types.FailResponse(c, http.StatusConflict, "Email already registered", err)
			return
		}
		types.FailResponse(c, http.StatusInternalServerError, "Failed to register user", err.Error())
		return
	}

	types.SuccessResponse(c, "User registered successfully", user.Username)
}