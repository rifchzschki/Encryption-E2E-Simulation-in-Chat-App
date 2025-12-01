import { useChatMetaStore } from '../stores/useChatMetadataStore';
import type {
  IncomingPayload,
  OutgoingSignedEncryptedPayload,
  VerifiedChatMessage,
} from '../types/chat';
import {
  fromHex,
  hashMessage,
  importPublicKeyFromXY,
  verifySignature,
} from '../utils/crypto';
import { decryptMessage } from '../utils/ecc-ecdh';
import { UserApi } from './user';

export interface FriendListChangedNotification {
  type: 'friendlist_changed';
  data: {
    username: string;
    friendship_id: string;
    timestamp: number;
  };
}

let ws: WebSocket | null = null;
let currentUser: string | null = null;
const listeners: ((m: VerifiedChatMessage) => void)[] = [];
const friendListeners: ((
  notification: FriendListChangedNotification
) => void)[] = [];

export function initChatSocket(token: string | undefined, username: string) {
  currentUser = username;
  if (ws && ws.readyState === WebSocket.OPEN) return ws;
  ws = new WebSocket(
    `${import.meta.env.VITE_API_BASE_URL}/ws/chat?token=${token}`
  );
  ws.onmessage = async (ev) => {
    try {
      const data = JSON.parse(ev.data);

      if (data.type === 'friendlist_changed') {
        friendListeners.forEach((l) => l(data));
        return;
      }

      if (!currentUser || data.receiver_username !== currentUser) return;
      const api = new UserApi(token);
      const pubReceiver = await api.fetchPublicKey(data.sender_username);
      const priv = localStorage.getItem('privateKey');
      const privEcdh = localStorage.getItem('privateKeyEcdh');
      if (!priv) return;
      const plain = await decryptMessage(
        fromHex(privEcdh as string),
        fromHex(pubReceiver.publicKeyHex.ecdh as string),
        data.encrypted_message
      );
      const recomputed = hashMessage({
        message: plain as string,
        timestamp: data.timestamp,
        sender: data.sender_username,
        receiver: data.receiver_username,
      });
      const pubRes = await api.fetchPublicKey(data.sender_username);
      const x = pubRes.publicKeyHex?.x;
      const y = pubRes.publicKeyHex?.y;
      const pubKey = x && y ? await importPublicKeyFromXY(x, y) : null;
      const hashEq = recomputed === data.message_hash;
      const sigOk = pubKey
        ? await verifySignature(
            { x: x, y: y },
            data.message_hash,
            data.signature.r,
            data.signature.s
          )
        : false;
      const msg: VerifiedChatMessage = {
        id: data.id ?? crypto.randomUUID(),
        sender_username: data.sender_username,
        receiver_username: data.receiver_username,
        message: plain as string,
        timestamp: data.timestamp,
        verified: hashEq && sigOk,
      };
      listeners.forEach((l) => l(msg));

      const { updateMeta } = useChatMetaStore.getState();
      if (data.sender_username) {
        updateMeta(data.sender_username, msg.message, msg.timestamp);
      }
    } catch (e) {
      console.error('Bad WS message', e);
    }
  };
  return ws;
}

export function sendRaw(payload: unknown) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(payload));
}

export function onIncomingMessage(cb: (m: VerifiedChatMessage) => void) {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function sendChatPayload(payload: OutgoingSignedEncryptedPayload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(payload));
}

export async function fetchChatHistory(
  receiverUsername: string,
  token: string,
  currentUser: string
): Promise<VerifiedChatMessage[]> {
  const res = await fetch(
    `${import.meta.env.VITE_PROTECTED_BASE_URL}/history/${receiverUsername}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error('Failed history fetch');
  const items: IncomingPayload[] = await res.json();
  const priv = localStorage.getItem('privateKey');
  const privEcdh = localStorage.getItem('privateKeyEcdh');
  if (!priv) return [];
  const api = new UserApi(token);

  const out: VerifiedChatMessage[] = [];
  for (const d of items) {
    if (d.sender_username === currentUser) {
      const pubReceiver = await api.fetchPublicKey(d.receiver_username);
      const plain = await decryptMessage(
        fromHex(privEcdh as string),
        fromHex(pubReceiver.publicKeyHex.ecdh as string),
        d.encrypted_message
      );
      out.push({
        id: d.id,
        sender_username: d.sender_username,
        receiver_username: d.receiver_username,
        message: plain as string,
        timestamp: d.timestamp,
        verified: true,
      });
      continue;
    }
  const pubReceiver = await api.fetchPublicKey(d.sender_username);
  const plain = await decryptMessage(
    fromHex(privEcdh as string),
    fromHex(pubReceiver.publicKeyHex.ecdh as string),
    d.encrypted_message
  );
    const recomputed = hashMessage({
      message: plain as string,
      timestamp: d.timestamp,
      sender: d.sender_username,
      receiver: d.receiver_username,
    });
    const pubRes = await api.fetchPublicKey(d.sender_username);
    const x = pubRes.publicKeyHex?.x;
    const y = pubRes.publicKeyHex?.y;
    const pubKey = x && y ? await importPublicKeyFromXY(x, y) : null;
    const hashEq = recomputed === d.message_hash;
    const sigOk = pubKey
      ? await verifySignature(
          { x: x, y: y },
          d.message_hash,
          d.signature.r,
          d.signature.s
        )
      : false;
    out.push({
      id: d.id,
      sender_username: d.sender_username,
      receiver_username: d.receiver_username,
      message: plain as string,
      timestamp: d.timestamp,
      verified: hashEq && sigOk,
    });
  }

  return out;
}

export function onFriendListChanged(
  cb: (notification: FriendListChangedNotification) => void
) {
  friendListeners.push(cb);
  return () => {
    const i = friendListeners.indexOf(cb);
    if (i >= 0) friendListeners.splice(i, 1);
  };
}
