import { create } from 'zustand';

export interface ChatMeta {
  latestMessage: string | null;
  latestTimestamp: string | null;
  unreadCount: number;
}

interface ChatMetaStore {
  metas: Record<string, ChatMeta>;
  updateMeta: (username: string, msg: string, timestamp: string) => void;
  resetUnread: (username: string) => void;
  setMetadataBulk: (
    data: {
      contact: string;
      latestMessage: string;
      latestTimestamp: string;
      unreadCount: number;
    }[]
  ) => void;
}

export const useChatMetaStore = create<ChatMetaStore>((set) => ({
  metas: {},

  updateMeta: (username, msg, timestamp) =>
    set((state) => ({
      metas: {
        ...state.metas,
        [username]: {
          latestMessage: msg,
          latestTimestamp: timestamp,
          unreadCount: (state.metas[username]?.unreadCount ?? 0) + 1,
        },
      },
    })),

  resetUnread: (username) =>
    set((state) => ({
      metas: {
        ...state.metas,
        [username]: {
          ...state.metas[username],
          unreadCount: 0,
        },
      },
    })),

  setMetadataBulk: (data) => {
    const metas: Record<string, ChatMeta> = {};
    data.forEach((item) => {
      metas[item.contact] = {
        latestMessage: item.latestMessage, 
        latestTimestamp: item.latestTimestamp,
        unreadCount: item.unreadCount ?? 0,
      };
    });
    set({ metas }); 
  },
}));
