package main

import (
	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/controllers"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/middleware"
)

func SetupRouter(
	authController *controllers.AuthController,
	socketController *controllers.SocketController,
	userController *controllers.UserController,
	chatController *controllers.ChatController,
) *gin.Engine {
	router := gin.Default()

	router.Use(middleware.CORS())

	router.GET("/health-check", func(ctx *gin.Context) { ctx.JSON(200, gin.H{"status": "oke"}) })

	authGroup := router.Group("/api")
	{
		authGroup.POST("/login", authController.Login)
		authGroup.GET("/nonce", authController.ReqChallenge)
		authGroup.POST("/register", authController.Register)
		authGroup.GET("/refresh", authController.RefreshToken)
		authGroup.GET("/ws/chat", socketController.ChatWS)
	}

	protected := authGroup.Group("/protected")
	protected.Use(middleware.JWTAuth())
	{
		protected.POST("/logout", authController.Logout)
		protected.GET("/profile", func(ctx *gin.Context) {
			claims, _ := ctx.Get("claims")
			ctx.JSON(200, gin.H{"profile": claims})
		})
		protected.GET("/me", func(ctx *gin.Context) {
			claims, _ := ctx.Get("claims")
			ctx.JSON(200, gin.H{"profile": claims})
		})
		protected.GET("/chat/metadata", chatController.GetChatMetadata)
		protected.GET("/history/:username_receiver", userController.ChatHistoryHandler)
		protected.GET("/users/:username/public-key", userController.GetPublicKey)
		protected.GET("/friends/:username", userController.GetFriendsHandler)
		protected.POST("/friends/add", userController.AddFriendHandler)
		protected.DELETE("/friends/delete/:username/:friend_username", userController.DeleteFriendHandler)
	}

	return router
}
