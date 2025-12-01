import {
  Avatar,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  Skeleton,
  Typography,
} from '@mui/material';
import { useChatMetaStore } from '../stores/useChatMetadataStore';
import { useReceiverStore } from '../stores/useReceiverStore';

interface ContactListProps {
  contact: { id: number; username: string };
}

export default function ContactComponent({ contact }: ContactListProps) {
  const { setReceiver } = useReceiverStore();
  const { metas, resetUnread } = useChatMetaStore();
  const meta = metas[contact.username];
  const {loading} = useChatMetaStore()

  const formattedTime = meta?.latestTimestamp
    ? new Date(meta.latestTimestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  function handleClick() {
    resetUnread(contact.username);
    setReceiver(contact.username);
  }

  return (
    <>
      <ListItem disablePadding className="border-b border-gray-200">
        <ListItemButton
          onClick={handleClick}
          className="px-4 py-3 hover:bg-blue-50 transition"
        >
          <ListItemAvatar>
            <Avatar
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${contact.username}`}
              alt={contact.username}
              sx={{ width: 50, height: 50 }}
            />
          </ListItemAvatar>

          <div className="flex justify-between w-full gap-2">
            <div className="flex-1 min-w-0">
              {' '}
              <Typography className="font-semibold truncate">
                {contact.username}
              </Typography>
              <Typography className="text-gray-500 text-sm truncate max-w-full">
                {loading ? (<Skeleton animation="wave" />) : meta?.latestMessage }
              </Typography>
            </div>

            <div className="flex flex-col items-end shrink-0 ml-2">
              {' '}
              <Typography variant="caption" className="text-gray-400">
                {formattedTime}
              </Typography>
              {meta?.unreadCount > 0 && (
                <div className="bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center mt-1 shadow-md">
                  {meta.unreadCount}
                </div>
              )}
            </div>
          </div>
        </ListItemButton>
      </ListItem>
      <Divider />
    </>
  );
}
