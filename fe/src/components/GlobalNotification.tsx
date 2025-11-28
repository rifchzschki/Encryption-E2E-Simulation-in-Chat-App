import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '../stores/useNotificationStore';

export default function GlobalNotification() {
  const { open, message, severity, close } = useNotificationStore();

  return (
    <Snackbar
      open={open}
      onClose={close}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ zIndex: 99999 }}
    >
      <Alert onClose={close} severity={severity} variant="filled" elevation={6}>
        {message}
      </Alert>
    </Snackbar>
  );
}
