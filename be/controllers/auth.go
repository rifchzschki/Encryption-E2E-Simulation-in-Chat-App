package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/middleware"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/prisma/db"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/services"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/utils"
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
		types.FailResponse(c, http.StatusBadRequest, "Bad Request", err.Error())
		return
	}

	if err := a.userService.CheckUserExists(c, req.Username); err != nil {
		types.FailResponse(c, http.StatusUnauthorized, "Invalid credentials", nil)
		return
	}

	nonce, err := services.GenerateNonce()
	if err != nil {
		types.FailResponse(c, http.StatusInternalServerError, "Failed to generate nonce", err.Error())
		return
	}

	services.StoreNonce(req.Username, nonce, 2*time.Minute)

	types.SuccessResponse(c, "Challenge generated", types.ChallengeResponse{Nonce: nonce})
}

func (a *AuthController) Login(c *gin.Context) {
	var loginPayload types.LoginRequest

    if err := c.ShouldBindJSON(&loginPayload); err != nil {
        types.FailResponse(c, http.StatusBadRequest, "Bad Request", err.Error())
        return
    }

	user, err := a.userService.GetUserByUsername(c, loginPayload.Username)
	if err != nil {
		types.FailResponse(c, http.StatusUnauthorized, "Invalid credentials", nil)
		return
	}

	publicKey := types.PublicKey{
		X: user.PublicKeyX,
		Y: user.PublicKeyY,
	} 

	accessToken, refreshToken, err := a.authService.ProcessLogin(c, user, publicKey, loginPayload)
	if err != nil {
		types.FailResponse(c, http.StatusUnauthorized, "Invalid credentials", nil)
		return
	}

	utils.SetRefreshCookie(c, refreshToken, int(types.EXPIRATION_REFRESH_TOKEN.Seconds()))

	types.SuccessResponse(c, "Login successful", gin.H{
		"access_token": accessToken,
		"username":     user.Username,
	})
}
func (a *AuthController) Register(c *gin.Context) {
	var payload types.IdentityPayload
	fmt.Println("from user service", payload.PublicKeyHex.Ecdh)

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

func (a *AuthController) RefreshToken(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		types.FailResponse(c, http.StatusUnauthorized, "Missing refresh token", err.Error())
		return
	}

	claims, session, err := a.authService.VerifyRefreshTokenAndSession(c, refreshToken)
	if err != nil {
		types.FailResponse(c, http.StatusUnauthorized, "Invalid refresh token or session", err.Error())
		return
	}

	accessToken, err := middleware.GenerateAccessToken(session.UserID, claims.Username)
	if err != nil {
		types.FailResponse(c, http.StatusInternalServerError, "Failed to generate access token", err.Error())
		return
	}

	types.SuccessResponse(c, "Access token refreshed successfully", gin.H{
		"access_token": accessToken,
		"username":     claims.Username,
	})
}

func (a *AuthController) Logout(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		types.FailResponse(c, http.StatusUnauthorized, "Missing refresh token", err.Error())
		return
	}
	_, session, err := a.authService.VerifyRefreshTokenAndSession(c, refreshToken)
	if err != nil {
		types.FailResponse(c, http.StatusUnauthorized, "Invalid refresh token or session", err.Error())
		return
	}

	if err := a.authService.RevokeSession(c, session); err != nil {
		types.FailResponse(c, http.StatusInternalServerError, "Failed revoke refresh token", err.Error())
		return
	}

	c.SetCookie(
		"refresh_token",
		"",
		-1,
		"/",
		"",   // domain
		true, // secure
		true, // httpOnly 
	)

	types.SuccessResponse(c, "Logout success",nil)
}
