import TypingBox from '../components/TypingBox';
import ChatBox from '../components/ChatBox';

function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <ChatBox></ChatBox>
      <TypingBox></TypingBox>
    </div>
  );
}

export default ChatPage;
