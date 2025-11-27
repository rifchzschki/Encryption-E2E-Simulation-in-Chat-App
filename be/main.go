package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/controllers"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/services"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/utils"
)

func main() {
  client := services.GetDB()
  quit := make(chan os.Signal, 1)
  signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

  go func() {
      <-quit
      log.Println("Shutting down DB gracefully...")
      if err := client.Prisma.Disconnect(); err != nil {
          log.Println("Error disconnecting Prisma:", err)
      }
      os.Exit(0)
  }()

  userService := services.NewUserService(client)
  chatService := services.NewChatService(client)
  authController := controllers.NewAuthController(userService)
  socketController := controllers.NewSocketController(userService, chatService)
    userController := controllers.NewUserController(userService, chatService)
  
  port := utils.GetEnv("PORT", "8080")

  router := SetupRouter(authController,socketController,userController)
  router.Run(":" + port)
}