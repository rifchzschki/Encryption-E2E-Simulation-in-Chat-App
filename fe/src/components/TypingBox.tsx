import { useState } from 'react'
import { hashMessage, signHashHex, fromHex } from '../utils/crypto'
import { sendRaw } from '../services/chatSocket'
import type { TypingBoxProps } from '../types/chat'
import { encryptMessage } from '../utils/ecc-ecdh';



export default function TypingBox({
  me,
  to,
  onLocalAppend,
  receiverPublicKeyPem,
}: TypingBoxProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || sending) return;
    setSending(true);
    const timestamp = new Date().toISOString();
    const hash = hashMessage({
      message: value,
      timestamp,
      sender: me,
      receiver: to,
    });
    const pem = localStorage.getItem('privateKey');
    if (!pem || !receiverPublicKeyPem?.x || !receiverPublicKeyPem?.y) {
      setSending(false);
      return;
    }
    try {
      const signature = await signHashHex(pem, hash);
      const priv = localStorage.getItem("privateKeyEcdh")
      const encrypted = await encryptMessage(fromHex(priv as string), fromHex(receiverPublicKeyPem.ecdh as string), value)
      sendRaw({
        sender_username: me,
        receiver_username: to,
        encrypted_message: encrypted,
        message_hash: hash,
        signature,
        timestamp,
      });
      onLocalAppend?.(value);
      setValue('');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSend} className="p-2 border-t flex gap-2 bg-gray-50">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type message..."
        className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring focus:ring-blue-300"
      />
      <button
        type="submit"
        disabled={!value.trim() || sending}
        className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}