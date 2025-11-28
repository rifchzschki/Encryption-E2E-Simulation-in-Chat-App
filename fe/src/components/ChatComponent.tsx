import ChatBox from './ChatBox';
import { useAuth } from '../context/AuthContext';

export default function ChatComponent() {
    const { username } = useAuth();
    return (
        <div className="flex flex-col border rounded-md bg-white h-screen">
        <header className="p-2 border-b">
            <h2 className="text-lg font-semibold">Chat ({username})</h2>
        </header>
        <div className="flex-1 min-h-0">
            <ChatBox me={username as string} />
        </div>
        </div>
    );
}
