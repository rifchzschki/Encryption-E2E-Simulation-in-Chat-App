package middleware

import (
	"net/http"
	"fmt"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		allowedOrigins := map[string]bool{
			"http://localhost:5173": true,
			"https://encryption-e2-e-simulation-in-chat.vercel.app": true,
		}

		origin := c.Request.Header.Get("Origin")
		fmt.Println("Origin", origin)
        if allowedOrigins[origin] {
            c.Header("Access-Control-Allow-Origin", origin)
            c.Header("Vary", "Origin")
        }

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type")
		c.Header("Access-Control-Expose-Headers", "Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
