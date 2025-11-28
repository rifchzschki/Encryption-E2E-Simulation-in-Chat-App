package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/utils"
)

func JWTAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		auth := ctx.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			types.FailResponse(ctx, http.StatusUnauthorized, "Missing or malformed token", nil)
			ctx.Abort()
			return
		}

		tokenString := strings.TrimPrefix(auth, "Bearer ")

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {

			if t.Method != jwt.SigningMethodHS512 {
				return nil, jwt.ErrTokenSignatureInvalid
			}

			return []byte(utils.GetEnv("JWT_SECRET","default_secret_key")), nil
		})

		if err != nil || !token.Valid {
			types.FailResponse(ctx, http.StatusUnauthorized, "Invalid or expired token", err.Error())
			ctx.Abort()
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		ctx.Set("username", claims)

		ctx.Next()
	}
}

func GenerateJWT(username string, expiration int) (string, error) {
	secret := []byte(utils.GetEnv("JWT_SECRET","default_secret_key"))

	claims := jwt.MapClaims{
		"username": username,
		"exp": expiration,
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)
	return token.SignedString(secret)
}