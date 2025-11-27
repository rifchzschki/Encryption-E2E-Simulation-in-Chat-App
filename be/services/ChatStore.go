package services

import (
    "context"
    "time"
    "github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/prisma/db"
    "github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
)

type ChatService struct {
    prismaClient *db.PrismaClient
}

func NewChatService(client *db.PrismaClient) *ChatService {
    return &ChatService{prismaClient: client}
}

func (cs *ChatService) SaveIncomingMessage(ctx context.Context, in types.IncomingPayload) (types.IncomingPayload, error) {
    ts, err := time.Parse(time.RFC3339, in.Timestamp)
    if err != nil {
        ts = time.Now().UTC()
    }
    _, err = cs.prismaClient.Message.CreateOne(
        db.Message.Receiver.Set(in.ReceiverUsername),
        db.Message.Encrypted.Set(in.EncryptedMessage),
        db.Message.MessageHash.Set(in.MessageHash),
        db.Message.SignatureR.Set(in.Signature.R),
        db.Message.SignatureS.Set(in.Signature.S),
		db.Message.Sender.Set(in.SenderUsername),
        db.Message.Timestamp.Set(ts),
    ).Exec(ctx)
    return in, err
}

func (cs *ChatService) ListHistory(ctx context.Context, a, b string) ([]types.IncomingPayload, error) {
    ms, err := cs.prismaClient.Message.FindMany(
        db.Message.Sender.In([]string{a, b}),
        db.Message.Receiver.In([]string{a, b}),
    ).OrderBy(db.Message.Timestamp.Order(db.SortOrderAsc)).Exec(ctx)
    if err != nil {
        return nil, err
    }
    out := make([]types.IncomingPayload, 0, len(ms))
    for _, m := range ms {
        out = append(out, types.IncomingPayload{
            ID:               string(m.ID),
            SenderUsername:   m.Sender,
            ReceiverUsername: m.Receiver,
            EncryptedMessage: m.Encrypted,
            MessageHash:      m.MessageHash,
            Signature: struct {
                R string `json:"r"`
                S string `json:"s"`
            }{R: m.SignatureR, S: m.SignatureS},
            Timestamp: m.Timestamp.Format(time.RFC3339),
        })
    }
    return out, nil
}