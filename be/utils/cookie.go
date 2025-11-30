package utils

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func SetRefreshCookie(c *gin.Context, token string, maxAge int) {
	domain := os.Getenv("COOKIE_DOMAIN")

	secure := domain != "localhost"
	sameSite := http.SameSiteNoneMode
	if !secure {
		sameSite = http.SameSiteLaxMode
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    token,
		Path:     "/",
		Domain:   domain,
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
	})
}
