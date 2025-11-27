package controllers

import (
    "context"
    "encoding/json"
    "net/http"
    "sync"

    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
    "github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/services"
    "github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
)

type SocketController struct {
    userService *services.UserService
    chatService *services.ChatService
    upgrader    websocket.Upgrader
    clients     sync.Map
}

func NewSocketController(us *services.UserService, cs *services.ChatService) *SocketController {
    return &SocketController{
        userService: us,
        chatService: cs,
        upgrader: websocket.Upgrader{
            CheckOrigin: func(r *http.Request) bool { return true },
        },
    }
}

func (s *SocketController) ChatWS(c *gin.Context) {
    username := c.GetString("username")
    if username == "" {
        c.Status(http.StatusUnauthorized)
        return
    }
    conn, err := s.upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        return
    }
    s.clients.Store(username, conn)
    for {
        _, data, err := conn.ReadMessage()
        if err != nil {
            s.clients.Delete(username)
            break
        }
        var in types.IncomingPayload
        if err := json.Unmarshal(data, &in); err != nil {
            continue
        }
        saved, err := s.chatService.SaveIncomingMessage(context.Background(), in)
        if err != nil {
            continue
        }
        s.writeTo(username, saved)
        s.writeTo(in.ReceiverUsername, saved)
    }
}

func (s *SocketController) writeTo(username string, v interface{}) {
    val, ok := s.clients.Load(username)
    if !ok {
        return
    }
    conn, _ := val.(*websocket.Conn)
    _ = conn.WriteJSON(v)
}