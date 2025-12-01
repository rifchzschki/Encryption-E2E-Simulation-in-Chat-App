import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchChatHistory } from '../services/chatSocket';
import { UserApi } from '../services/user';
import { useReceiverStore } from '../stores/useReceiverStore';
import type { PublicKey } from '../types/auth';
import type { VerifiedChatMessage } from '../types/chat';
import ChatBox from './ChatBox';
import ChatHeader from './ChatHeader';
import { CircularProgress, Typography } from '@mui/material';

export default function ChatComponent() {
  const { username, token } = useAuth();
  const { receiver } = useReceiverStore();

  const [receiverPublicKeyPem, setReceiverPublicKeyPem] =
    useState<PublicKey | null>(null);
  const [history, setHistory] = useState<VerifiedChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!receiver || !token) return;

    let cancelled = false;
    const load = async () => {
      try {
        const api = new UserApi(token ?? undefined);
        const res = await api.fetchPublicKey(receiver);
        if (!cancelled) {
          setReceiverPublicKeyPem(res.publicKeyHex ?? null);
        }
      } catch {
        if (!cancelled) setReceiverPublicKeyPem(null);
      }
    };
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
    fetchChatHistory(receiver, token, username || '')
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [receiver, token]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 border-l border-gray-200">
      {receiver ? (
        <>
          <ChatHeader />

          {loadingHistory ? (
            <div className="flex-1 flex items-center justify-center">
              <CircularProgress size={34} />
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <ChatBox
                key={receiver}
                me={username as string}
                to={receiver}
                token={token ?? undefined}
                receiverPublicKeyPem={receiverPublicKeyPem ?? undefined}
                initialMessages={history}
                loadingHistory={loadingHistory}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center select-none">
          <Typography variant="h6" className="text-gray-600">
            Select a chat to start messaging ✨
          </Typography>
          <Typography variant="body2" className="text-gray-500 mt-1">
            Your encrypted chats will show up here.
          </Typography>
        </div>
      )}
    </div>
  );
}
