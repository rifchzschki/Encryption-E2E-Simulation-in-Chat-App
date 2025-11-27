package controllers

import (
    "context"
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/services"
)

type UserController struct {
    userService *services.UserService
    chatService *services.ChatService
}

func NewUserController(us *services.UserService, cs *services.ChatService) *UserController {
    return &UserController{userService: us, chatService: cs}
}

type PublicKeyResponse struct {
    Username     string `json:"username"`
    PublicKeyPem string `json:"public_key_pem"`
}

func (u *UserController) GetPublicKey(c *gin.Context) {
    username := c.Param("username")
    client := u.userService
    pk, err := client.GetPublicKeyByUsername(context.Background(), username)
    if err != nil {
        c.JSON(http.StatusOK, PublicKeyResponse{Username: username, PublicKeyPem: ""})
        return
    }
    c.JSON(http.StatusOK, PublicKeyResponse{Username: username, PublicKeyPem: pk})
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
    type req struct {
        Username  string `json:"username"`
        PublicKey string `json:"public_key"`
    }
    var r req
    if err := c.BindJSON(&r); err != nil || r.Username == "" || r.PublicKey == "" {
        c.Status(http.StatusBadRequest)
        return
    }
    user, err := u.userService.CreateUser(c, r.Username, r.PublicKey)
    if err != nil {
        c.Status(http.StatusConflict)
        return
    }
    c.JSON(http.StatusCreated, gin.H{
        "id":        user.ID,
        "username":  user.Username,
        "publicKey": user.PublicKey,
    })
}
