package types

type IdentityPayload struct{
	Username string `json:"username"`
	PublicKeyHex PublicKey `json:"publicKeyHex"`
}

type PublicKey struct{
	X string `json:"x"`
	Y string `json:"y"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Signature Signature `json:"signature"`
}

type Signature struct {
	R string `json:"r"`
	S string `json:"s"`
}

type NonceChallengeRequest struct{
	Username string `form:"username" json:"username" binding:"required"`
}

type ChallengeResponse struct{
	Nonce string `json:"nonce"`
}

type PublicKeyResponse struct {
    Username     string `json:"username"`
    PublicKeyPem string `json:"public_key_pem"`
}

const EXPIRATION_REFRESH_TOKEN int = 24*3600 // 1 hari
const EXPIRATION_ACCESS_TOKEN int = 5*60 // 5 menit