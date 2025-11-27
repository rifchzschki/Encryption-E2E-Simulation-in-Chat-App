package main

import (
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/controllers"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/services"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/utils"
)

func main() {
  client := services.GetDB()
	defer client.Prisma.Disconnect()

  userService := services.NewUserService(client)
  chatService := services.NewChatService(client)
  authController := controllers.NewAuthController(userService)
  socketController := controllers.NewSocketController(userService, chatService)
    userController := controllers.NewUserController(userService, chatService)
  
  port := utils.GetEnv("PORT", "8080")

  router := SetupRouter(authController,socketController,userController)
  router.Run(":" + port)
}