import { useEffect, useRef, useState } from 'react';
import ChatBubble from './ChatBubble';
import TypingBox from './TypingBox';
import { initChatSocket, onIncomingMessage } from '../services/chatSocket';
import { fetchChatHistory } from '../services/chatSocket';
import type { VerifiedChatMessage,ChatBoxProps } from '../types/chat';


export default function ChatBox({
  me,
  to = 'budi',
  token,
  receiverPublicKeyPem,
  initialMessages = [],
  loadingHistory = false,
}: ChatBoxProps) {
  const [loading, setLoading] = useState(loadingHistory);
   
   const [messages, setMessages] =
     useState<VerifiedChatMessage[]>(initialMessages);
  
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setLoading(loadingHistory);
  }, [loadingHistory]);

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
  }, [me, to]);

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
      receiver_username: to,
      message: text,
      timestamp: new Date().toISOString(),
      verified: true,
    };
    setMessages((prev) => [...prev, optimistic]);
  }

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 bg-white min-h-0"
      >
        {loading && <div className="text-sm text-gray-400">Loading...</div>}
        {!loading &&
          messages.map((m) => (
            <ChatBubble
              key={`${m.timestamp}-${m.sender_username}-${m.receiver_username}`}
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
        to={to}
        onLocalAppend={appendLocal}
        token={token || ''}
        receiverPublicKeyPem={receiverPublicKeyPem}
      />
    </div>
  );
}
