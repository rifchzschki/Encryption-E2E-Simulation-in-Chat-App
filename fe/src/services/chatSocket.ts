import type {
  OutgoingSignedEncryptedPayload,
  VerifiedChatMessage,
  IncomingPayload,
} from '../types/chat';
import {
  eccDecrypt,
  hashMessage,
  verifySignature,
  importPublicKeyFromXY,
} from '../utils/crypto';
import { UserApi } from './user';

let ws: WebSocket | null = null;
let currentUser: string | null = null;
const listeners: ((m: VerifiedChatMessage) => void)[] = [];

export function initChatSocket(token: string | undefined, username: string) {
  currentUser = username;
  if (ws && ws.readyState === WebSocket.OPEN) return ws;
  ws = new WebSocket(
    `${import.meta.env.VITE_API_BASE_URL}/ws/chat?token=${token}`
  );
  ws.onmessage = async (ev) => {
    try {
      const data: IncomingPayload = JSON.parse(ev.data);
      if (!currentUser || data.receiver_username !== currentUser) return;
      const priv = localStorage.getItem('privateKey');
      if (!priv) return;
      const plain = await eccDecrypt(data.encrypted_message, priv);
      const recomputed = hashMessage({
        message: plain,
        timestamp: data.timestamp,
        sender: data.sender_username,
        receiver: data.receiver_username,
      });
      const api = new UserApi(token);
      const pubRes = await api.fetchPublicKey(data.sender_username);
      const x = pubRes.publicKeyHex?.x;
      const y = pubRes.publicKeyHex?.y;
      const pubKey = x && y ? await importPublicKeyFromXY(x, y) : null;
      const hashEq = recomputed === data.message_hash;
      console.log('HASHEQ: ', hashEq);
      const sigOk = pubKey
        ? await verifySignature(
            { x: x, y: y },
            data.message_hash,
            data.signature.r,
            data.signature.s
          )
        : false;
      console.log('signok: ', sigOk);
      const msg: VerifiedChatMessage = {
        id: data.id ?? crypto.randomUUID(),
        sender_username: data.sender_username,
        receiver_username: data.receiver_username,
        message: plain,
        timestamp: data.timestamp,
        verified: hashEq && sigOk,
      };
      listeners.forEach((l) => l(msg));
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
  if (!priv) return [];
  const api = new UserApi(token);
  const out: VerifiedChatMessage[] = [];
  for (const d of items) {
    if (d.sender_username === currentUser) {
      out.push({
        id: d.id,
        sender_username: d.sender_username,
        receiver_username: d.receiver_username,
        message: 'Encrypted message',
        timestamp: d.timestamp,
        verified: true,
      });
      continue;
    }
    const plain = await eccDecrypt(d.encrypted_message, priv);
    const recomputed = hashMessage({
      message: plain,
      timestamp: d.timestamp,
      sender: d.sender_username,
      receiver: d.receiver_username,
    });
    const pubRes = await api.fetchPublicKey(d.sender_username);
    const x = pubRes.publicKeyHex?.x;
    const y = pubRes.publicKeyHex?.y;
    const pubKey = x && y ? await importPublicKeyFromXY(x, y) : null;
    const hashEq = recomputed === d.message_hash;
    console.log(hashEq);
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
      message: plain,
      timestamp: d.timestamp,
      verified: hashEq && sigOk,
    });
  }

  return out;
}
