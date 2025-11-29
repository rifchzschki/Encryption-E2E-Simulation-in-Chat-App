import SearchIcon from '@mui/icons-material/Search';
import { Button, IconButton, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth';
import { useNotificationStore } from '../stores/useNotificationStore';
import { UserApi } from '../services/user';
import { Popover } from '@mui/material';
import { Add, Menu } from '@mui/icons-material';

interface ContactHeaderProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  refreshFriends: () => void; // callback to reload friends after adding
}

export default function ContactHeader({
  searchQuery,
  setSearchQuery,
  // refreshFriends,
}: ContactHeaderProps) {
  const [showSearch, setShowSearch] = React.useState(false);
  const [showAddContact, setShowAddContact] = React.useState(false);
  const [newContactUsername, setNewContactUsername] = React.useState('');
  const { username, setLoading, token, setToken } = useAuth();
  const { show } = useNotificationStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoading(true);
    new AuthService(token)
      .logout()
      .then(() => {
        show('Berhasil logout', 'success');
        navigate('/auth');
        setToken(null);
      })
      .catch((err) => {
        show(err.message, 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAddFriend = async () => {
    if (!newContactUsername.trim()) return;

    setLoading(true);
    const userApi = new UserApi(token);
    try {
      if (!username) throw new Error('Username not found');
      await userApi.addFriend(username, newContactUsername.trim());
      show(`Added ${newContactUsername} as a friend`, 'success');
      setNewContactUsername('');
      setShowAddContact(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        show(err.message || 'Failed to add friend', 'error');
      } else {
        show('Failed to add friend', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // optional: add friend on Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddFriend();
    }
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setSearchQuery('');
    setShowAddContact(false);
    setShowSearch(false);
  };

  const handleClickAdd = () => {
    setShowAddContact((prev) => !prev);
    setAnchorEl(null);
  };

  const handleClickSearch = () => {
    setShowSearch((prev) => !prev);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <>
      <div className="p-4 flex flex-row justify-between items-center bg-blue-200">
        <Button onClick={handleLogout}>Logout</Button>

        <figure className="flex items-center gap-3 m-0">
          <img src="/transparent-logo.png" alt="Logo" width={50} height={50} />
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

        <IconButton onClick={handleClick}>
          <Menu />{' '}
        </IconButton>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <div className="flex flex-col p-2">
            <div
              onClick={handleClickSearch}
              className="flex flex-row gap-1 w-full items-start cursor-pointer mb-2 hover:bg-gray-100 p-1 rounded-md transition-colors duration-300 ease-in-out"
            >
              <SearchIcon className="text-blue-500" />
              <Typography variant="body2" color="textPrimary">
                Search
              </Typography>
            </div>
            <div
              onClick={handleClickAdd}
              className="flex flex-row gap-1 w-full items-start cursor-pointer mb-2 hover:bg-gray-100 p-1 rounded-md transition-colors duration-300 ease-in-out"
            >
              <Add className="text-blue-500" />
              <Typography variant="body2" color="textPrimary">
                Add Contact
              </Typography>
            </div>
          </div>
        </Popover>
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

      {/* Add Contact bar */}
      {showAddContact && (
        <div className="p-2 bg-white flex gap-2">
          <TextField
            fullWidth
            size="small"
            placeholder="Add new contact by username..."
            value={newContactUsername}
            onChange={(e) => setNewContactUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            className="rounded-md"
          />
          <Button variant="contained" onClick={handleAddFriend}>
            Add
          </Button>
        </div>
      )}
    </>
  );
}
