package types

type IncomingPayload struct {
    ID               string `json:"id"`
    SenderUsername   string `json:"sender_username"`
    ReceiverUsername string `json:"receiver_username"`
    EncryptedMessage string `json:"encrypted_message"`
    MessageHash      string `json:"message_hash"`
    Signature        struct {
        R string `json:"r"`
        S string `json:"s"`
    } `json:"signature"`
    Timestamp string `json:"timestamp"`
}