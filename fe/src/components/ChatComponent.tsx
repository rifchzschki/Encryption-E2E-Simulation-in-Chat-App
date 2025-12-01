import ChatBox from './ChatBox';
import { useAuth } from '../context/AuthContext';
import { useReceiverStore } from '../stores/useReceiverStore';
import { useEffect, useState } from 'react';
import { UserApi } from '../services/user';
import type { PublicKey } from '../types/auth';
import type { VerifiedChatMessage } from '../types/chat';
import { fetchChatHistory } from '../services/chatSocket';

export default function ChatComponent() {
  const { username, token } = useAuth();
  const { receiver } = useReceiverStore();
  const [receiverPublicKeyPem, setReceiverPublicKeyPem] =
    useState<PublicKey | null>(null);
  const [history, setHistory] = useState<VerifiedChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!receiver || !token) return;
  }, [receiver, token]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!receiver) {
        setReceiverPublicKeyPem(null);
        return;
      }
      try {
        const api = new UserApi(token ?? undefined);
        const res = await api.fetchPublicKey(receiver);
        if (!cancelled) setReceiverPublicKeyPem(res.publicKeyHex ?? null);
      } catch {
        if (!cancelled) setReceiverPublicKeyPem(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [receiver, token]);

  useEffect(() => {
    if (!receiver || !token) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    fetchChatHistory(receiver,token, username || "")
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
    }, [receiver, token]);

  return (
    <div className="flex flex-col border rounded-md bg-white h-screen">
      <header className="p-2 border-b">
        <h2 className="text-lg font-semibold">{receiver ?? 'Start Chat'}</h2>
      </header>
      <div className="flex-1 min-h-0">
        <ChatBox
          key={receiver ?? 'empty'}
          me={username as string}
          to={receiver || ''}
          token={token?.toString()}
          receiverPublicKeyPem={receiverPublicKeyPem || undefined}
          initialMessages={history}
          loadingHistory={loadingHistory}
        />
      </div>
    </div>
  );
}
