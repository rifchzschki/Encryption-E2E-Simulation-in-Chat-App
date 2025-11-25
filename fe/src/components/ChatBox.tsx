import ChatBubble from './ChatBubble';

const dummyMessages = [
  {
    id: 1,
    isSender: true,
    message: 'Hello! How are you?',
  },
  {
    id: 2,
    isSender: false,
    message: "I'm good, thanks! How about you?",
  },
  {
    id: 3,
    isSender: true,
    message: 'Doing well! What are your plans for today?',
  },
  {
    id: 4,
    isSender: false,
    message: "I'm thinking of going for a hike. The weather looks great!",
  },
  {
    id: 5,
    isSender: true,
    message: 'That sounds fun! Enjoy your hike.',
  },
];

export default function ChatBox() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <div className="mb-4">
          <div className="font-bold">Contact Name</div>
          <div className="text-sm text-gray-500">Last seen: 2 hours ago</div>
        </div>
        <div className="space-y-4 w-full flex flex-col">
          {dummyMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.message}
              isSender={msg.isSender}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
