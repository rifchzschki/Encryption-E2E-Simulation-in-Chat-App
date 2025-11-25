interface ChatBubbleProps {
  isSender?: boolean;
  message: string;
}

export default function ChatBubble({ message, isSender }: ChatBubbleProps) {
  return (
    <div
      className={`p-2 rounded max-w-lg ${isSender ? 'bg-blue-400 text-white self-end' : 'bg-gray-200'}`}
    >
      {message}
    </div>
  );
}
