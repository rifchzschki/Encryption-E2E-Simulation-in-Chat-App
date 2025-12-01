import { List } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ContactHeader from '../components/ContactHeader';
import { useAuth } from '../context/AuthContext';
import { onFriendListChanged } from '../services/chatSocket';
import { UserApi } from '../services/user';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useChatMetaStore } from '../stores/useChatMetadataStore';
import { resolveBulkMetadataEncryption } from '../utils/ecc-ecdh';
import ContactComponent from './ContactComponent';

interface Friend {
  id: number;
  username: string;
}

function Contacts() {
  const { username, token } = useAuth();
  const { show } = useNotificationStore();
  const { setMetadataBulk, setLoading } = useChatMetaStore();
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

  useEffect(() => {
    const unsubscribe = onFriendListChanged((notification) => {
      if (notification.data.friendship_id === null) {
        show(
          `${notification.data.username} removed you as a friend!`,
          'warning'
        );
        fetchFriends();
        return;
      } else {
        show(`${notification.data.username} added you as a friend!`, 'success');
        fetchFriends();
      }
    });

    return unsubscribe;
  }, [fetchFriends, show]);

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!token) return;

    const priv = localStorage.getItem('privateKeyEcdh');
    if (!priv) return;

    async function load() {
      try {
        setLoading(true);

        const items = await new UserApi(token).fetchChatMetadata();

        setMetadataBulk(
          items.map((it) => ({
            contact: it.username,
            latestMessage: it.last_message,
            latestTimestamp: it.last_timestamp,
            unreadCount: 0,
          }))
        );

        await resolveBulkMetadataEncryption(token as string, priv as string);
      } catch (err) {
        console.error('Failed metadata fetch', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  return (
    <div className="">
      <div className="flex flex-col">
        <ContactHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          refreshFriends={fetchFriends}
        />

        <div className="grow overflow-y-auto">
          <List className="p-0">
            {filteredFriends.map((friend) => (
              <React.Fragment key={friend.username}>
                <ContactComponent contact={friend} />
              </React.Fragment>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
