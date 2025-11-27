import { useEffect, useState } from 'react';
import ChatBox from './ChatBox';
import { fetchMe } from '../services/user';

export default function ChatComponent() {
    const [me, setMe] = useState('loading...');
    useEffect(() => {
        fetchMe()
        .then((d) => setMe(d.username))
        .catch(() => setMe('anonymous'));
    }, []);
    return (
        <div className="flex flex-col border rounded-md bg-white h-[100vh]">
        <header className="p-2 border-b">
            <h2 className="text-lg font-semibold">Chat ({me})</h2>
        </header>
        <div className="flex-1 min-h-0">
            <ChatBox me={me} />
        </div>
        </div>
    );
}
