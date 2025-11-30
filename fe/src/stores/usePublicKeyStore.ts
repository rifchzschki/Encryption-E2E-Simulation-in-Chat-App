import { create } from 'zustand';

type KeyMap = Record<string, string>; // username -> PEM

type PublicKeyStore = {
  keys: KeyMap;
  setKey: (username: string, pem: string) => void;
  getKey: (username: string) => string | undefined;
  clear: () => void;
};

const load = (): KeyMap => {
  try {
    const raw = sessionStorage.getItem('pk-cache');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const save = (m: KeyMap) => {
  try {
    sessionStorage.setItem('pk-cache', JSON.stringify(m));
  } catch {}
};

export const usePublicKeyStore = create<PublicKeyStore>((set, get) => ({
  keys: load(),
  setKey: (username, pem) =>
    set((state) => {
      const next = { ...state.keys, [username]: pem };
      save(next);
      return { keys: next };
    }),
  getKey: (username) => get().keys[username],
  clear: () =>
    set(() => {
      save({});
      return { keys: {} };
    }),
}));
