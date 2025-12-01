import SendRoundedIcon from '@mui/icons-material/SendRounded';
import IconButton from '@mui/material/IconButton';
import { useEffect, useRef, useState } from 'react';
import { sendRaw } from '../services/chatSocket';
import type { TypingBoxProps } from '../types/chat';
import { fromHex, hashMessage, signHashHex } from '../utils/crypto';
import { encryptMessage } from '../utils/ecc-ecdh';

export default function TypingBox({
  me,
  to,
  onLocalAppend,
  receiverPublicKeyPem,
}: TypingBoxProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [value]);

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
    const mySecret = localStorage.getItem('privateKeyEcdh');

    if (!pem || !mySecret || !receiverPublicKeyPem?.ecdh) {
      console.warn('Missing keys!');
      setSending(false);
      return;
    }

    try {
      const signature = await signHashHex(pem, hash);
      const encrypted = await encryptMessage(
        fromHex(mySecret),
        fromHex(receiverPublicKeyPem.ecdh),
        value
      );

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
    <form
      onSubmit={handleSend}
      className="flex items-end gap-2 px-3 py-2 border-t border-gray-400 bg-white shadow-sm"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSend(e);
          }
        }}
        placeholder="Type a message..."
        className="flex-1 resize-none overflow-hidden px-4 py-3 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={sending}
      />

      <IconButton
        type="submit"
        disabled={!value.trim() || sending}
        sx={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '8px',
          '&:hover': { backgroundColor: '#1e40af' },
          opacity: !value.trim() || sending ? 0.6 : 1,
        }}
      >
        <SendRoundedIcon fontSize="small" />
      </IconButton>
    </form>
  );
}
