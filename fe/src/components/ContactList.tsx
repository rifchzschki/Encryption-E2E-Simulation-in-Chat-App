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
  filteredContacts: Array<{ name: string; avatar: string }>;
  contact: {
    name: string;
    avatar: string;
  };
  index: number;
}

export default function ContactList({
  filteredContacts,
  contact,
  index,
}: ContactListProps) {
  return (
    <React.Fragment key={contact.name}>
      <ListItem
        component="button"
        className="border-b border-gray-200 p-4 hover:bg-gray-100 transition-colors duration-300 ease-in-out"
      >
        <ListItemAvatar>
          <Avatar
            src={contact.avatar}
            alt={contact.name}
            sx={{ width: 56, height: 56 }}
            className="mr-4"
          />
        </ListItemAvatar>
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-col">
            <ListItemText
              className="text-bold"
              primary={contact.name}
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

      {index < filteredContacts.length - 1 && <Divider />}
    </React.Fragment>
  );
}
