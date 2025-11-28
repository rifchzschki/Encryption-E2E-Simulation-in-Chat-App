import React, { useState } from 'react';
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  IconButton,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

function ContactPage() {
  const [showSearch, setShowSearch] = useState(false); // state toggle search bar
  const [searchQuery, setSearchQuery] = useState('');

  const contacts = [
    { name: 'Contact 1', avatar: 'https://i.pravatar.cc/40?img=1' },
    { name: 'Contact 2', avatar: 'https://i.pravatar.cc/40?img=2' },
    { name: 'Contact 3', avatar: 'https://i.pravatar.cc/40?img=3' },
  ];

  // filter contacts based on searchQuery
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-row w-full border-black border-2 h-screen">
      {/* Contacts Sidebar */}
      <div className="flex flex-col w-1/4 border-r border-blue-300">
        <div className="p-4 flex flex-row justify-between items-center bg-blue-200">
          <figure className="flex items-center gap-3 m-0">
            <img
              src="/transparent-logo.png"
              alt="Logo"
              width={50}
              height={50}
            />

            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              CypherTalk
            </Typography>
          </figure>

          {/* Search button / close button */}
          <IconButton onClick={() => setShowSearch((prev) => !prev)}>
            {showSearch ? <CloseIcon /> : <SearchIcon />}
          </IconButton>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="p-2 bg-white">
            <TextField
              fullWidth
              size="small"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-md"
            />
          </div>
        )}

        {/* Contacts List */}
        <div className="flex-grow overflow-y-auto">
          <List className="p-0">
            {filteredContacts.map((contact, index) => (
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
                      <ListItemText className="text-gray-500">
                        Hello there
                      </ListItemText>
                    </div>
                    <div className="flex flex-col items-end">
                      <Typography variant="caption" color="gray">
                        2:30 PM
                      </Typography>
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mt-1">
                        3
                      </div>
                    </div>
                  </div>
                </ListItem>
                {index < filteredContacts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex flex-col w-3/4 p-4">
        <h2>Chat</h2>
      </div>
    </div>
  );
}

export default ContactPage;
