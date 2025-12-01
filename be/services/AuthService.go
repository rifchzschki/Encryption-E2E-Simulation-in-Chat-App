package services

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/sha3"
	"encoding/hex"
	"fmt"
	"math/big"
	"time"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/middleware"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/prisma/db"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/utils"
)

type AuthService struct{
	prismaClient *db.PrismaClient
}

func NewAuthService(client *db.PrismaClient) *AuthService {
	return &AuthService{
		prismaClient: client,
	}
}

func (as *AuthService) VerifySignature(publicKeyXHex, publicKeyYHex, message string, signatureHex types.Signature) (bool, error) {
	rBInt := new(big.Int)
	rBInt, ok := rBInt.SetString(signatureHex.R, 16)
	if !ok {
		return false, fmt.Errorf("Konversi R gagal")
	} 

	sBInt := new(big.Int)
	sBInt, ok = sBInt.SetString(signatureHex.S, 16)
	if !ok {
		return false, fmt.Errorf("Konversi S gagal")
	} 
		
	X := new(big.Int)
	X, ok = X.SetString(publicKeyXHex, 16)
	if !ok{
		return false, fmt.Errorf("Konversi X gagal")
	}

	Y := new(big.Int)
	Y, ok = Y.SetString(publicKeyYHex, 16)
	if !ok {
		return false, fmt.Errorf("Konversi Y gagal")
	}

	nonceBytes, err := hex.DecodeString(message)
	if err != nil {
		return false, err
	}

	hash := sha3.Sum256(nonceBytes)
	pub := &ecdsa.PublicKey{
		Curve: elliptic.P256(),
		X: X,
		Y: Y,
	}
	return ecdsa.Verify(pub, hash[:], rBInt, sBInt), nil
}

func (as *AuthService) ProcessLogin(ctx *gin.Context, user *db.UserModel, pub types.PublicKey, payload types.LoginRequest) (string, string, error) {
	nonce, ok := TakeNonce(payload.Username)
	if !ok {
		return "", "", fmt.Errorf("no valid challenge found for user")
	}

	valid, err := as.VerifySignature(pub.X, pub.Y, nonce, payload.Signature)
	if err != nil || !valid {
		if(err == nil) {
			err = fmt.Errorf("signature verification failed")
		}
		return "", "", err
	}

	accessToken, err := middleware.GenerateAccessToken(user.ID, user.Username)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	sessionID := uuid.NewString()
	refreshToken, err := middleware.GenerateRefreshToken(sessionID, user.Username)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	rtHash, err := utils.HashRefreshToken(refreshToken)
	if err != nil {
		return "", "", fmt.Errorf("failed to hash refresh token: %w", err)
	}

	userAgent := ctx.Request.UserAgent()
	ip := ctx.ClientIP()

	_, err = as.prismaClient.UserSession.CreateOne(
		db.UserSession.RefreshTokenHash.Set(rtHash),
		db.UserSession.ExpiresAt.Set(time.Now().Add(types.EXPIRATION_REFRESH_TOKEN)),
		db.UserSession.User.Link(db.User.ID.Equals(user.ID)),
		db.UserSession.ID.Set(sessionID),
		db.UserSession.UserAgent.Set(userAgent),
		db.UserSession.IPAddress.Set(ip),
	).Exec(ctx)

	if err != nil {
		return "", "", fmt.Errorf("failed to create user session: %w", err)
	}

	fmt.Println(accessToken, refreshToken)

	return accessToken, refreshToken, nil
}