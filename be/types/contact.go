package types

type FriendRequestPayload struct {
	Username       string `json:"username"`
	FriendUsername string `json:"friendUsername"`
}
