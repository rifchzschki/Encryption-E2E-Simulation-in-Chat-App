import { Avatar, IconButton, Typography, Tooltip } from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useReceiverStore } from '../stores/useReceiverStore';

export default function ChatHeader() {
  const { receiver } = useReceiverStore();

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

      <div className="flex items-center gap-2">
        <Tooltip title="Video Call">
          <IconButton size="small" className="hover:text-blue-600">
            <VideoCallIcon fontSize="medium" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Call">
          <IconButton size="small" className="hover:text-blue-600">
            <CallIcon fontSize="medium" />
          </IconButton>
        </Tooltip>

        <Tooltip title="More options">
          <IconButton size="small" className="hover:text-blue-600">
            <MoreVertIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </div>
    </header>
  );
}
