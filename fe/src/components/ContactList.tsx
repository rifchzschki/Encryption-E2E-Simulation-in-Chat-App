import React, { useEffect} from 'react';
import ContactComponent from './ContactComponent';
import { useAuth } from '../context/AuthContext';
import { useChatMetaStore } from '../stores/useChatMetadataStore';
import { UserApi } from '../services/user';
import { resolveBulkMetadataEncryption } from '../utils/ecc-ecdh';

interface ContactListProps {
  contact: { id: number; username: string; };
}

export default function ContactList({
  contact,
}: ContactListProps) {
   const { token } = useAuth();
   const { setMetadataBulk } = useChatMetaStore();
    useEffect(() => {
      if (!token || !contact.username) return;
      
      const priv = localStorage.getItem("privateKeyEcdh");
      if (!priv) return;
      
      async function load() {
        try {
          new UserApi(token)
            .fetchChatMetadata()
            .then((items) => {
              setMetadataBulk(
                items.map((it) => ({
                  contact: it.username,
                  latestMessage: it.last_message,
                  latestTimestamp: it.last_timestamp,
                  unreadCount: 0, 
                }))
              );
              resolveBulkMetadataEncryption(token as string, priv as string)
            });
        } catch (err) {
          console.error('Failed metadata fetch', err);
        }
      }

      load();
    }, [token, contact.username]);
  return (
    <React.Fragment key={contact.username}>
      <ContactComponent contact={contact}/>
    </React.Fragment>
  );
}
