import { Avatar, Typography } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { ChatBubbleProps } from '../types/chat';
import { useReceiverStore } from '../stores/useReceiverStore';

export default function ChatBubble({
  message,
  isSender,
  sender,
  time,
  verified,
}: ChatBubbleProps) {
  const { receiver } = useReceiverStore();

  const formattedTime =
    time &&
    new Date(time).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div
      className={`flex w-full gap-2 mb-3 ${
        isSender ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isSender && (
        <Avatar
          src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${receiver}`}
          alt={receiver as string}
          sx={{ width: 30, height: 30 }}
          className="self-start mt-4"
        />
      )}

      <div
        className={`flex flex-col w-full ${isSender ? 'items-end' : 'items-start'}`}
      >
        {!isSender && sender && (
          <Typography
            variant="caption"
            className="font-semibold text-gray-500 ml-1 mb-1"
          >
            {sender}
          </Typography>
        )}

        <div
          className={`rounded-2xl px-4 py-2 max-w-[75%] wrap-break-word shadow-sm ${
            isSender
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
          }`}
        >
          <span className="text-[14px] leading-relaxed whitespace-pre-wrap">
            {message}
          </span>
        </div>

        <div
          className={`flex gap-1 items-center mt-1 text-[11px] ${
            isSender
              ? 'text-blue-300 justify-end'
              : 'text-gray-400 justify-start'
          }`}
        >
          {formattedTime}

          {verified ? (
            <DoneAllIcon fontSize="inherit" className="text-blue-300" />
          ) : (
            <ErrorOutlineIcon fontSize="inherit" className="text-red-400" />
          )}
        </div>
      </div>
    </div>
  );
}
