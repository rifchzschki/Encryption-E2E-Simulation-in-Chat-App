package utils

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func LoadEnv() {
	mode := os.Getenv("GIN_MODE")
	if mode == "" {
		mode = gin.DebugMode
	}
	gin.SetMode(mode)

	if gin.Mode() == gin.DebugMode {
		if err := godotenv.Load(); err != nil {
			log.Println(".env not found (OK in prod)")
		}
		log.Println("Running in development mode")
	} else {
		log.Println("Running in production mode")
	}
}