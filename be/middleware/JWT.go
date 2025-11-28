package middleware

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/utils"
)

var (
	accessSecret  = []byte(utils.GetEnv("ACCESS_TOKEN_SECRET", "DEFAULT_ACCESS_SECRET"))  
	refreshSecret = []byte(utils.GetEnv("REFRESH_TOKEN_SECRET", "DEFAULT_REFRESH_SECRET")) 
)

type AccessTokenClaims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type RefreshTokenClaims struct {
	Username  string `json:"username"`
	SessionID string `json:"sid"`
	jwt.RegisteredClaims
}

func JWTAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		auth := ctx.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			types.FailResponse(ctx, http.StatusUnauthorized, "Missing or malformed token", nil)
			ctx.Abort()
			return
		}

		tokenString := strings.TrimPrefix(auth, "Bearer ")

		claims, err := VerifyAccessToken(tokenString)

		if err != nil {
			types.FailResponse(ctx, http.StatusUnauthorized, "Invalid or expired token", err.Error())
			ctx.Abort()
			return
		}

		ctx.Set("username", claims.Username)

		ctx.Next()
	}
}

func GenerateAccessToken(userID, username string) (string, error) {
	now := time.Now()
	claims := AccessTokenClaims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(types.EXPIRATION_ACCESS_TOKEN)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(accessSecret)
}

func GenerateRefreshToken(sessionID, username string) (string, error) {
	now := time.Now()
	claims := RefreshTokenClaims{
		Username:  username,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(types.EXPIRATION_REFRESH_TOKEN)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(refreshSecret)
}

func VerifyAccessToken(tokenStr string) (*AccessTokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &AccessTokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		return accessSecret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*AccessTokenClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid access token")
	}

	return claims, nil
}

func VerifyRefreshToken(tokenStr string) (*RefreshTokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &RefreshTokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		return refreshSecret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*RefreshTokenClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid refresh token")
	}

	return claims, nil
}