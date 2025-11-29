import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { Button, IconButton, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth';
import { useNotificationStore } from '../stores/useNotificationStore';
import { PlusOneRounded } from '@mui/icons-material';
import { UserApi } from '../services/user';

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
      await userApi.addFriend( username, newContactUsername.trim());
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

        <IconButton onClick={() => setShowSearch((prev) => !prev)}>
          {showSearch ? <CloseIcon /> : <SearchIcon />}
        </IconButton>
        <IconButton onClick={() => setShowAddContact((prev) => !prev)}>
          {showAddContact ? <CloseIcon /> : <PlusOneRounded />}
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
