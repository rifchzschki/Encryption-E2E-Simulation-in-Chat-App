package utils

import (
	"crypto/sha3"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

func HashRefreshToken(token string) (string, error) {
	sha := sha3.Sum256([]byte(token))
	shaStr := hex.EncodeToString(sha[:])

	bytes, err := bcrypt.GenerateFromPassword([]byte(shaStr), bcrypt.DefaultCost)
	return string(bytes), err
}

func CompareRefreshTokenHash(hash, token string) bool {
	sha := sha3.Sum256([]byte(token))
	shaStr := hex.EncodeToString(sha[:])
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(shaStr)) == nil
}