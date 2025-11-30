package services

import (
	"context"
	"fmt"
	"strconv"
	_"time"

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

	timestampISO := in.Timestamp // string yang dikirim FE
	_, err = cs.prismaClient.Message.CreateOne(
        db.Message.Chipertext.Set(in.EncryptedMessage),
        db.Message.MessageHash.Set(in.MessageHash),
        db.Message.SignatureR.Set(in.Signature.R),
        db.Message.SignatureS.Set(in.Signature.S),
  		db.Message.TimestampRaw.Set(timestampISO),
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

	idToUsername := map[string]string{
        sender.ID:   sender.Username,
        receiver.ID: receiver.Username,
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
            SenderUsername:   idToUsername[m.SenderID],
            ReceiverUsername: idToUsername[m.ReceiverID],
            EncryptedMessage: m.Chipertext,
            MessageHash:      m.MessageHash,
            Signature: struct {
                R string `json:"r"`
                S string `json:"s"`
            }{R: m.SignatureR, S: m.SignatureS},
            Timestamp: m.TimestampRaw,
        })
    }
	fmt.Println("History", out)
    return out, nil
}