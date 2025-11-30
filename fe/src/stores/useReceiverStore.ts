import { create } from 'zustand';

type ReceiverState = {
  receiver: string | null;
  setReceiver: (username: string) => void;
  clearReceiver: () => void;
};

export const useReceiverStore = create<ReceiverState>((set) => ({
  receiver: null,
  setReceiver: (username) => set({ receiver: username }),
  clearReceiver: () => set({ receiver: null }),
}));
