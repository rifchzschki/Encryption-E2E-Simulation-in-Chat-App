import type { OutgoingSignedEncryptedPayload, VerifiedChatMessage, IncomingPayload } from '../types/chat'
import { eccDecrypt, hashMessage, importPublicKey, verifySignature, toHex } from '../utils/crypto'
import { UserApi } from './user'

let ws: WebSocket | null = null
const listeners: ((m: VerifiedChatMessage) => void)[] = []

export function initChatSocket(token: string) {
  if (ws && ws.readyState === WebSocket.OPEN) return ws
  ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/chat?token=${token}`)
  ws.onmessage = async ev => {
    try {
      const data: IncomingPayload = JSON.parse(ev.data)
      const plain = await eccDecrypt(data.encrypted_message)
      const recomputed = hashMessage({
        message: plain,
        timestamp: data.timestamp,
        sender: data.sender_username,
        receiver: data.receiver_username,
      })
      const userService = new UserApi(token)
      const pubRes = await userService.fetchPublicKey(data.sender_username)
      const pubKeyPem = pubRes.public_key_pem || ''
      const pubKey = pubKeyPem ? await importPublicKey(pubKeyPem) : null
      const hashEq = toHex(recomputed) === data.message_hash
      const sigOk = pubKey ? await verifySignature(pubKey, data.message_hash, data.signature.r, data.signature.s) : false
      const verified = hashEq && sigOk
      const msg: VerifiedChatMessage = {
        id: data.id ?? crypto.randomUUID(),
        sender_username: data.sender_username,
        receiver_username: data.receiver_username,
        message: plain,
        timestamp: data.timestamp,
        verified,
      }
      listeners.forEach(l => l(msg))
    } catch (e) {
      console.error('Bad WS message', e)
    }
  }
  return ws
}

export function sendRaw(payload: unknown) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  ws.send(JSON.stringify(payload))
}

export function onIncomingMessage(cb: (m: VerifiedChatMessage) => void) {
  listeners.push(cb)
  return () => {
    const i = listeners.indexOf(cb)
    if (i >= 0) listeners.splice(i, 1)
  }
}

export function sendChatPayload(payload: OutgoingSignedEncryptedPayload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  ws.send(JSON.stringify(payload))
}

export async function fetchChatHistory(receiverUsername: string): Promise<VerifiedChatMessage[]> {
  const token = localStorage.getItem('authToken') || ''
  const res = await fetch(`${import.meta.env.VITE_PROTECTED_BASE_URL}/history/${receiverUsername}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed history fetch')
  const items: IncomingPayload[] = await res.json()
  const out: VerifiedChatMessage[] = []
  for (const d of items) {
    const plain = await eccDecrypt(d.encrypted_message)
    const recomputed = hashMessage({
      message: plain,
      timestamp: d.timestamp,
      sender: d.sender_username,
      receiver: d.receiver_username,
    })
    const userService = new UserApi(token)
    const pubRes = await userService.fetchPublicKey(d.sender_username)
    const pubKeyPem = pubRes.public_key_pem || ''
    const pubKey = pubKeyPem ? await importPublicKey(pubKeyPem) : null
    const hashEq = toHex(recomputed) === d.message_hash
    const sigOk = pubKey ? await verifySignature(pubKey, d.message_hash, d.signature.r, d.signature.s) : false
    out.push({
      id: d.id,
      sender_username: d.sender_username,
      receiver_username: d.receiver_username,
      message: plain,
      timestamp: d.timestamp,
      verified: hashEq && sigOk,
    })
  }
  return out
}