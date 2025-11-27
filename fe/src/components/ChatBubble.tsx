import type { ChatBubbleProps } from '../types/chat';

export default function ChatBubble({
  message,
  isSender,
  sender,
  time,
  verified,
}: ChatBubbleProps) {
  return (
    <div
      className={`flex flex-col mb-2 ${isSender ? 'items-end' : 'items-start'}`}
    >
      {!isSender && sender && (
        <span className="text-xs text-gray-500 mb-0.5">{sender}</span>
      )}
      <div
        className={`p-2 rounded-lg max-w-xs break-words ${
          isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
        }`}
      >
        {message}
      </div>
      <div className="flex gap-2 items-center text-[10px] mt-0.5 text-gray-400">
        {time && (
          <span>
            {new Date(time).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        <span>{verified ? '✅ Verified' : '❌ Unverified'}</span>
      </div>
    </div>
  );
}
