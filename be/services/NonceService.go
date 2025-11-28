package services

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"

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