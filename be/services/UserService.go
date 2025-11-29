package services

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/prisma/db"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
)

type UserService struct {
	prismaClient *db.PrismaClient
}

func NewUserService(client *db.PrismaClient) *UserService {
	return &UserService{
		prismaClient: client,
	}
}

func (us *UserService) CreateUser(ctx *gin.Context, username string, publicKeyHex types.PublicKey) (*db.UserModel, error) {
	user, err := us.prismaClient.User.CreateOne(
		db.User.Username.Set(username),
		db.User.PublicKeyX.Set(publicKeyHex.X),
		db.User.PublicKeyY.Set(publicKeyHex.Y),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (us *UserService) CheckUserExists(ctx *gin.Context, username string) error {
	_, err := us.prismaClient.User.FindUnique(
		db.User.Username.Equals(username),
	).Exec(ctx)
	return err
}

func (us *UserService) GetPublicKey(ctx *gin.Context, username string) (types.PublicKey, error) {
	user, err := us.prismaClient.User.FindUnique(
		db.User.Username.Equals(username),
	).Exec(ctx)
	if err != nil {
		return types.PublicKey{}, err
	}
	return types.PublicKey{
		X: user.PublicKeyX,
		Y: user.PublicKeyY,
	}, nil
}

func (us *UserService) GetUserByUsername(ctx *gin.Context, username string) (*db.UserModel, error) {
	user, err := us.prismaClient.User.FindUnique(
		db.User.Username.Equals(username),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (us *UserService) GetAllMessagesByUser(ctx *gin.Context, username string) ([]*db.MessageModel, error) {
	user, err := us.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	messages, err := us.prismaClient.Message.FindMany(
		db.Message.Or(
			db.Message.SenderID.Equals(user.ID),
			db.Message.ReceiverID.Equals(user.ID),
		),
	).Exec(ctx)

	if err != nil {
		return nil, err
	}

	// Convert to []*db.MessageModel
	messagePointers := make([]*db.MessageModel, len(messages))
	for i := range messages {
		messagePointers[i] = &messages[i]
	}

	return messagePointers, nil
}

func (us *UserService) GetFriends(ctx *gin.Context, username string) ([]db.UserModel, error) {
	// Find the user
	user, err := us.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	// Find all friendships where user is either user1 or user2
	relations, err := us.prismaClient.UserFriend.FindMany(
		db.UserFriend.Or(
			db.UserFriend.User1ID.Equals(user.ID),
			db.UserFriend.User2ID.Equals(user.ID),
		),
	).With(
		db.UserFriend.User1.Fetch(),
		db.UserFriend.User2.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	friends := make([]db.UserModel, 0)
	for _, rel := range relations {
		if rel.User1ID == user.ID && rel.User2() != nil {
			friends = append(friends, *rel.User2())
		} else if rel.User2ID == user.ID && rel.User1() != nil {
			friends = append(friends, *rel.User1())
		}
	}

	return friends, nil
}

func (us *UserService) AddFriend(ctx *gin.Context, username, friendUsername string) (*db.UserFriendModel, error) {
	// Find both users
	user, err := us.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	friend, err := us.GetUserByUsername(ctx, friendUsername)
	if err != nil {
		return nil, fmt.Errorf("friend user not found")
	}

	// Cannot add self
	if user.ID == friend.ID {
		return nil, fmt.Errorf("cannot add yourself as a friend")
	}

	// Enforce sorted IDs to satisfy unique constraint
	user1 := user.ID
	user2 := friend.ID
	if user1 > user2 {
		user1, user2 = user2, user1
	}

	// Create friendship
	friendship, err := us.prismaClient.UserFriend.CreateOne(
		db.UserFriend.User1.Link(db.User.ID.Equals(user1)),
		db.UserFriend.User2.Link(db.User.ID.Equals(user2)),
	).Exec(ctx)

	if err != nil {
		if strings.Contains(err.Error(), "Unique constraint failed") {
			return nil, fmt.Errorf("already friends")
		}
		return nil, err
	}

	return friendship, nil
}
