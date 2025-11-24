package types

type AuthPayload struct{
	Username string `json:"username"`
	PublicKey string `json:"publicKeyHex"`
}