package controllers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/services"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
)

type UserController struct {
	userService *services.UserService
	chatService *services.ChatService
}

func NewUserController(us *services.UserService, cs *services.ChatService) *UserController {
	return &UserController{userService: us, chatService: cs}
}

func (u *UserController) GetPublicKey(c *gin.Context) {
	username := c.Param("username")
	client := u.userService
	pk, err := client.GetPublicKey(c, username)
	if err != nil {
		c.JSON(http.StatusNotFound, types.IdentityPayload{Username: username, PublicKeyHex: types.PublicKey{X: "", Y: ""}})
		return
	}
	c.JSON(http.StatusOK, types.IdentityPayload{Username: username, PublicKeyHex: pk})
}

func (u *UserController) ChatHistoryHandler(c *gin.Context) {
	me := c.GetString("username")
	if me == "" {
		c.Status(http.StatusUnauthorized)
		return
	}
	to := c.Param("username_receiver")
	if to == "" {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}
	list, err := u.chatService.ListHistory(context.Background(), me, to)
	if err != nil {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (u *UserController) CreateUser(c *gin.Context) {
	var r types.IdentityPayload
	if err := c.BindJSON(&r); err != nil || r.Username == "" || r.PublicKeyHex.X == "" || r.PublicKeyHex.Y == "" {
		c.Status(http.StatusBadRequest)
		return
	}
	user, err := u.userService.CreateUser(c, r.Username, r.PublicKeyHex)
	if err != nil {
		c.Status(http.StatusConflict)
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"id":        user.ID,
		"username":  user.Username,
		"publicKey": types.PublicKey{X: user.PublicKeyX, Y: user.PublicKeyY},
	})
}

func (u *UserController) GetAllMessagesByUser(c *gin.Context) {
	username := c.Param("username")
	messages, err := u.userService.GetAllMessagesByUser(c, username)
	if err != nil {
		c.JSON(http.StatusNotFound, []interface{}{})
		return
	}
	c.JSON(http.StatusOK, messages)
}

func (u *UserController) AddFriendHandler(c *gin.Context) {
	var r types.FriendRequestPayload
	if err := c.BindJSON(&r); err != nil || r.Username == "" || r.FriendUsername == "" {
		c.Status(http.StatusBadRequest)
		return
	}

	friendship, err := u.userService.AddFriend(c, r.Username, r.FriendUsername)
	if err != nil {
		types.FailResponse(c, http.StatusConflict, err.Error(), err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":           friendship.ID,
		"userID":       friendship.User1ID,
		"friendUserID": friendship.User2ID,
	})
}

func (u *UserController) GetFriendsHandler(c *gin.Context) {
	username := c.Param("username")
	friends, err := u.userService.GetFriends(c, username)
	if err != nil {
		types.FailResponse(c, http.StatusInternalServerError, err.Error(), err.Error())
		return
	}
	c.JSON(http.StatusOK, friends)
}
