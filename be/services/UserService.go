package services

import (
	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/prisma/db"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
)

type UserService struct{
	prismaClient *db.PrismaClient
}

func NewUserService(client *db.PrismaClient) *UserService {
	return &UserService{
		prismaClient: client,
	}
}

func (us *UserService) CreateUser(ctx *gin.Context, username string, publicKeyHex types.PublicKey) (*db.UserModel, error){
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



