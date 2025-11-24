package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/utils"
)

func JWTAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		auth := ctx.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			types.BaseResponse{}.FailResponse(ctx, http.StatusUnauthorized, "Missing or malformed token", nil)
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
			types.BaseResponse{}.FailResponse(ctx, http.StatusUnauthorized, "Invalid or expired token", err.Error())
			ctx.Abort()
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		ctx.Set("user", claims)

		ctx.Next()
	}
}
