import { useEffect, useRef, useState } from 'react';
import ChatBubble from './ChatBubble';
import TypingBox from './TypingBox';
import { initChatSocket, onIncomingMessage } from '../services/chatSocket';
import type { VerifiedChatMessage, ChatBoxProps } from '../types/chat';
import { CircularProgress, Typography } from '@mui/material';
import { useReceiverStore } from '../stores/useReceiverStore';
import { useChatMetaStore } from '../stores/useChatMetadataStore';

export default function ChatBox({
  me,
  to,
  token,
  receiverPublicKeyPem,
  initialMessages = [],
  loadingHistory = false,
}: ChatBoxProps) {
  const {receiver} = useReceiverStore()
  const {resetUnread} = useChatMetaStore()
  const [loading, setLoading] = useState(loadingHistory);
  const [messages, setMessages] =
    useState<VerifiedChatMessage[]>(initialMessages);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMessages(initialMessages), [initialMessages]);
  useEffect(() => setLoading(loadingHistory), [loadingHistory]);
  useEffect(() => {
    if (!receiver) return;
    resetUnread(receiver);
  }, [receiver]);

  useEffect(() => {
    initChatSocket(token?.toString(), me);
    const off = onIncomingMessage((msg) => {
      if (
        (msg.sender_username === me && msg.receiver_username === to) ||
        (msg.sender_username === to && msg.receiver_username === me)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return off;
  }, [me, to, token]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  function appendLocal(text: string) {
    const optimistic: VerifiedChatMessage = {
      id: crypto.randomUUID(),
      sender_username: me,
      receiver_username: to as string,
      message: text,
      timestamp: new Date().toISOString(),
      verified: true,
    };
    setMessages((prev) => [...prev, optimistic]);
  }

  const isEmpty = !loading && messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0"
      >
        {loading && (
          <div className="flex justify-center items-center h-full">
            <CircularProgress size={34} />
          </div>
        )}

        {isEmpty && (
          <div className="flex justify-center items-center h-full text-center select-none">
            <Typography variant="body2" className="text-gray-500">
              Belum ada pesan. Mulai percakapan sekarang ✨
            </Typography>
          </div>
        )}

        {!loading &&
          messages.map((m) => (
            <ChatBubble
              key={m.id ?? `${m.timestamp}-${m.sender_username}`}
              message={m.message}
              sender={m.sender_username}
              isSender={m.sender_username === me}
              time={m.timestamp}
              verified={m.verified}
            />
          ))}
      </div>

      <TypingBox
        me={me}
        to={to as string}
        onLocalAppend={appendLocal}
        token={token || ''}
        receiverPublicKeyPem={receiverPublicKeyPem}
      />
    </div>
  );
}
