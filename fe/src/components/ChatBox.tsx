import { useEffect, useRef, useState } from 'react';
import ChatBubble from './ChatBubble';
import TypingBox from './TypingBox';
import { initChatSocket, onIncomingMessage } from '../services/chatSocket';
import { fetchChatHistory } from '../services/chatSocket';
import type { VerifiedChatMessage,ChatBoxProps } from '../types/chat';


export default function ChatBox({ me, to = 'bob' }: ChatBoxProps) {
  const [messages, setMessages] = useState<VerifiedChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  
  useEffect(() => {
    fetchChatHistory(to)
      .then((hist) => setMessages(hist))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [to]);

  
  useEffect(() => {
    const token = localStorage.getItem('authToken') || '';
    initChatSocket(token);
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
      verified: false, 
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
              key={m.id}
              message={m.message}
              sender={m.sender_username}
              isSender={m.sender_username === me}
              time={m.timestamp}
              verified={m.verified}
            />
          ))}
      </div>
      <TypingBox me={me} to={to} onLocalAppend={appendLocal} />
    </div>
  );
}
