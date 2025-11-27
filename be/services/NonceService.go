package services

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha3"
	"encoding/hex"
	"fmt"
	"math/big"
	"sync"
	"time"

	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/types"
)

type NonceData struct {
	Value     string
	ExpiresAt time.Time
}

var (
	nonceStore = make(map[string]NonceData)
	nonceMu    sync.Mutex
)

func StoreNonce(username, nonce string, ttl time.Duration) {
	nonceMu.Lock()
	defer nonceMu.Unlock()

	nonceStore[username] = NonceData{
		Value:     nonce,
		ExpiresAt: time.Now().Add(ttl),
	}
}

func TakeNonce(username string) (string, bool) {
	nonceMu.Lock()
	defer nonceMu.Unlock()

	data, ok := nonceStore[username]
	if !ok {
		return "", false
	}
	if time.Now().After(data.ExpiresAt) {
		delete(nonceStore, username)
		return "", false
	}
	delete(nonceStore, username)
	return data.Value, true
}

	
func GenerateNonce() (string, error) {
    randomBytes := make([]byte, 32) // 256-bit
    _, err := rand.Read(randomBytes)
    if err != nil {
        return "", err
    }
    return hex.EncodeToString(randomBytes), nil
}

func VerifySignature(publicKeyXHex, publicKeyYHex, message string, signatureHex types.Signature) (bool, error) {
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