package main

import (
	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/controllers"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/middleware"
)

func SetupRouter(
	authController *controllers.AuthController,
) *gin.Engine{
	router := gin.Default()
	
	router.Use(middleware.CORS())

	router.GET("/health-check", func(ctx *gin.Context) {ctx.JSON(200, gin.H{"status": "ok"})})
	
	//Auth
	authGroup := router.Group("/api")
	{
		authGroup.POST("/login", authController.Login)
		authGroup.POST("/register", authController.Register)
	}

	protected := router.Group("/protected")
	protected.Use(middleware.JWTAuth())
	{
		protected.GET("/profile", func(ctx *gin.Context){
			claims, _ := ctx.Get("user")
			ctx.JSON(200, gin.H{"profile": claims})
		})
	}

	return router
}