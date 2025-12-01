import {
  Avatar,
  IconButton,
  Typography,
  Tooltip,
  Popover,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import CallIcon from '@mui/icons-material/Call';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { useReceiverStore } from '../stores/useReceiverStore';
import { useAuth } from '../context/AuthContext';
import { UserApi } from '../services/user';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useState } from 'react';

export default function ChatHeader() {
  const { receiver } = useReceiverStore();
  const { username, token, setLoading } = useAuth();
  const { show } = useNotificationStore();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const closeMenus = () => {
    setAnchorEl(null);
    setConfirmDelete(false);
  };

  const handleDeleteFriend = async () => {
    if (!receiver || !username) return;
    setLoading(true);

    try {
      await new UserApi(token).deleteFriend(username, receiver);
      show(`Deleted ${receiver} from contacts`, 'success');
      closeMenus();
    } catch (err: any) {
      show(err.message || 'Failed to delete', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-gray-50 shadow-sm">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar
          src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${receiver}`}
          alt={receiver as string}
          sx={{ width: 48, height: 48 }}
        />
        <div className="flex flex-col min-w-0">
          <Typography variant="subtitle1" className="font-semibold truncate">
            {receiver}
          </Typography>
          <Typography variant="caption" className="text-green-600">
            Online
          </Typography>
        </div>
      </div>

      <Tooltip title="Video Call">
        <IconButton size="small" className="hover:text-blue-600">
          <VideoCallIcon fontSize="medium" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Voice Call">
        <IconButton size="small" className="hover:text-blue-600">
          <CallIcon fontSize="medium" />
        </IconButton>
      </Tooltip>

      <IconButton onClick={handleMenuOpen}>
        <MoreVertIcon />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeMenus}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <div className="p-2 w-48 space-y-1">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 p-2 w-full rounded hover:bg-gray-100 text-left transition"
            >
              <DeleteIcon className="text-red-600" />
              <span className="text-sm">Delete Contact</span>
            </button>
          ) : (
            <div className="p-2 space-y-2">
              <Typography variant="body2" className="text-gray-700">
                Delete "{receiver}"?
              </Typography>
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={handleDeleteFriend}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </Popover>
    </header>
  );
}
