package services

import (
	"context"
	"fmt"
	"strconv"
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
	sender, err := cs.prismaClient.User.
		FindUnique(db.User.Username.Equals(in.SenderUsername)).
		Exec(ctx)
	if err != nil || sender == nil {
		return types.IncomingPayload{}, fmt.Errorf("sender not found")
	}

	receiver, err := cs.prismaClient.User.
		FindUnique(db.User.Username.Equals(in.ReceiverUsername)).
		Exec(ctx)
	if err != nil || receiver == nil {
		return types.IncomingPayload{}, fmt.Errorf("receiver not found")
	}

	_, err = cs.prismaClient.Message.CreateOne(
        db.Message.Chipertext.Set(in.EncryptedMessage),
        db.Message.MessageHash.Set(in.MessageHash),
        db.Message.SignatureR.Set(in.Signature.R),
        db.Message.SignatureS.Set(in.Signature.S),
        db.Message.Sender.Link(
            db.User.Username.Equals(in.SenderUsername),
        ),
        db.Message.Receiver.Link(
            db.User.Username.Equals(in.ReceiverUsername),
        ),
    ).Exec(ctx)
	if err != nil {
		return types.IncomingPayload{}, err
	}

	return in, nil
}

func (cs *ChatService) ListHistory(ctx context.Context, a, b string) ([]types.IncomingPayload, error) {
    sender, err := cs.prismaClient.User.FindUnique(
        db.User.Username.Equals(a),
    ).Exec(ctx)
    if err != nil {
        return nil, fmt.Errorf("sender not found: %w", err)
    }

    receiver, err := cs.prismaClient.User.FindUnique(
        db.User.Username.Equals(b),
    ).Exec(ctx)
    if err != nil {
        return nil, fmt.Errorf("receiver not found: %w", err)
    }

    ms, err := cs.prismaClient.Message.FindMany(
        db.Message.SenderID.In([]string{sender.ID, receiver.ID}),
        db.Message.ReceiverID.In([]string{sender.ID, receiver.ID}),
    ).OrderBy(db.Message.Timestamp.Order(db.SortOrderAsc)).Exec(ctx)
    if err != nil {
        return nil, err
    }
    out := make([]types.IncomingPayload, 0, len(ms))
    for _, m := range ms {
        out = append(out, types.IncomingPayload{
            ID:               strconv.Itoa(m.ID),
            SenderUsername:   m.SenderID,
            ReceiverUsername: m.ReceiverID,
            EncryptedMessage: m.Chipertext,
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