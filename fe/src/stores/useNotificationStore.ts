import { create } from 'zustand';

type Severity = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
  open: boolean;
  message: string;
  severity: Severity;

  show: (message: string, severity?: Severity, duration?: number) => void;
  close: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  open: false,
  message: '',
  severity: 'info',

  show: (message, severity = 'info', duration = 5000) => {
    set({ open: true, message, severity });

    setTimeout(() => set({ open: false }), duration);
  },

  close: () => set({ open: false }),
}));
