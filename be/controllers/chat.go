package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/services"
)

type ChatController struct {
	ChatService *services.ChatService
}

func NewChatController(s *services.ChatService) *ChatController {
	return &ChatController{s}
}

func (cc *ChatController) GetChatMetadata(c *gin.Context) {
	userId := c.GetString("UserId")
	metadata, err := cc.ChatService.GetChatMetadata(c, userId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	fmt.Println(metadata)

	c.JSON(http.StatusOK, metadata)
}
