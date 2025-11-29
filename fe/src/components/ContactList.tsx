import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';

interface ContactListProps {
  contact: { id: number; username: string; };
}

export default function ContactList({
  contact,
}: ContactListProps) {
  return (
    <React.Fragment key={contact.username}>
      <ListItem
        component="button"
        className="border-b border-gray-200 p-4 hover:bg-gray-100 transition-colors duration-300 ease-in-out"
      >
        <ListItemAvatar>
          <div className="mr-4">
            <Avatar
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${contact.username}`}
              alt={contact.username}
              sx={{ width: 56, height: 56 }}
            />
          </div>
        </ListItemAvatar>
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-col">
            <ListItemText
              className="text-bold"
              primary={contact.username}
            ></ListItemText>
            <ListItemText className="text-gray-500">Hello there</ListItemText>
          </div>
          <div className="flex flex-col items-end">
            <Typography variant="caption" color="gray">
              2:30 PM
            </Typography>
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mt-1">
              1
            </div>
          </div>
        </div>
      </ListItem>

      {<Divider />}
    </React.Fragment>
  );
}
