package services

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/prisma/db"
)

type UserService struct{
	prismaClient *db.PrismaClient
}

func NewUserService(client *db.PrismaClient) *UserService {
	return &UserService{
		prismaClient: client,
	}
}

func (us *UserService) CreateUser(ctx *gin.Context, username string, publicKeyHex string) (*db.UserModel, error){
	user, err := us.prismaClient.User.CreateOne(
		db.User.Username.Set(username),
		db.User.PublicKey.Set(publicKeyHex),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	return user, nil
}


func (us *UserService) GetPublicKeyByUsername(ctx context.Context, username string) (string, error) {
	c,err := us.prismaClient.User.FindUnique(db.User.Username.Equals(username)).Exec(ctx)
	if err != nil {
		return "", err
	}
	return c.PublicKey, nil
}