import { useEffect, useState, useCallback } from 'react';
import { List } from '@mui/material';
import ContactList from '../components/ContactList';
import ContactHeader from '../components/ContactHeader';
import { useAuth } from '../context/AuthContext';
import { UserApi } from '../services/user';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useMemo } from 'react';

interface Friend {
  id: number;
  username: string;
}

function Contacts() {
  const { username, token } = useAuth();
  const { show } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);

  const userApi = useMemo(() => new UserApi(token), [token]);

  const fetchFriends = useCallback(async () => {
    if (!username) return;
    try {
      const data = await userApi.fetchFriends(username);
      setFriends(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        show(err.message || 'Failed to fetch friends', 'error');
      } else {
        show('Failed to fetch friends', 'error');
      }
    }
  }, [username, userApi, show]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchFriends();
    };
    fetchData();
  }, [fetchFriends]);

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="">
      <div className="flex flex-col border-r border-blue-300">
        <ContactHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          refreshFriends={fetchFriends}
        />

        <div className="grow overflow-y-auto">
          <List className="p-0">
            {filteredFriends.map((friend) => (
              <ContactList
                key={friend.id}
                contact={friend}
              />
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
