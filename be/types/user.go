package types

type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	PublicKey PublicKey `json:"public_key"`
}