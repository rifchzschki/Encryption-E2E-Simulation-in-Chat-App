import type { PublicKey } from './auth';

export interface OutgoingSignedEncryptedPayload {
  sender_username: string;
  receiver_username: string;
  encrypted_message: string;
  message_hash: string;
  signature: { r: string; s: string };
  timestamp: string;
}

export interface IncomingPayload {
  id: string;
  sender_username: string;
  receiver_username: string;
  encrypted_message: string;
  message_hash: string;
  signature: { r: string; s: string };
  timestamp: string;
}

export interface VerifiedChatMessage {
  id: string;
  sender_username: string;
  receiver_username: string;
  message: string;
  timestamp: string;
  verified: boolean;
}

export interface ChatBoxProps {
  me: string;
  to?: string;
  token?: string;
  receiverPublicKeyPem?: PublicKey;
  initialMessages?: VerifiedChatMessage[];
  loadingHistory: boolean;
}

export interface ChatBubbleProps {
  isSender?: boolean;
  message: string;
  sender?: string;
  time?: string;
  verified?: boolean;
}

export interface TypingBoxProps {
  me: string;
  to: string;
  onLocalAppend?: (text: string) => void;
  token: string;
  receiverPublicKeyPem?: PublicKey;
}

export interface ChatMetadataResponse {
  contact_id: string;
  username: string;
  last_message: string;
  last_timestamp: string;
}