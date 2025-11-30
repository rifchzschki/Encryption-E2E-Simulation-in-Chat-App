import { Add, Delete, Menu } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  IconButton,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth';
import { UserApi } from '../services/user';
import { useNotificationStore } from '../stores/useNotificationStore';

interface ContactHeaderProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  refreshFriends: () => void;
}

export default function ContactHeader({
  searchQuery,
  setSearchQuery,
}: ContactHeaderProps) {
  const [showSearch, setShowSearch] = React.useState(false);
  const [showAddContact, setShowAddContact] = React.useState(false);
  const [showdeleteContactUsername, setShowDeleteContactUsername] =
    React.useState(false);
  const [newContactUsername, setNewContactUsername] = React.useState('');
  const [deleteContactUsername, setDeleteContactUsername] = React.useState('');
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
    try {
      if (!username) throw new Error('Username not found');
      await new UserApi(token)
        .addFriend(username, newContactUsername.trim())
        .then(() => {
          show(`Added ${newContactUsername} as a friend`, 'success');
          setNewContactUsername('');
          setShowAddContact(false);
        })
        .catch((err) => {
          show(err.message, 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err: unknown) {
      if (err instanceof Error) {
        show(err.message || 'Failed to add friend', 'error');
      } else {
        show('Failed to add friend', 'error');
      }
      setLoading(false);
    }
  };

  const handleDeleteFriend = async () => {
    if (!deleteContactUsername.trim()) return;

    setLoading(true);
    try {
      if (!username) throw new Error('Username not found');
      await new UserApi(token)
        .deleteFriend(username, deleteContactUsername.trim())
        .then(() => {
          show(`Deleted ${deleteContactUsername} from friends`, 'success');
          setDeleteContactUsername('');
        })
        .catch((err) => {
          show(err.message, 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err: unknown) {
      if (err instanceof Error) {
        show(err.message || 'Failed to delete friend', 'error');
      } else {
        show('Failed to delete friend', 'error');
      }
      setLoading(false);
    }
  };

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
    setShowDeleteContactUsername(false);
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
      <div className=" flex justify-around items-center bg-blue-200">
        <div className="flex">
          <IconButton
            onClick={handleClick}
            sx={{
              alignSelf: 'center',
            }}
          >
            <Menu />
            {''}
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
                onClick={handleClickAdd}
                className="flex flex-row gap-1 w-full items-start cursor-pointer mb-2 hover:bg-gray-100 p-1 rounded-md transition-colors duration-300 ease-in-out"
              >
                <Add className="text-blue-500" />
                <Typography variant="body2" color="textPrimary">
                  Add Contact
                </Typography>
              </div>
              <div
                onClick={() => {
                  setShowDeleteContactUsername((prev) => !prev);
                  setAnchorEl(null);
                }}
                className="flex flex-row gap-1 w-full items-start cursor-pointer mb-2 hover:bg-gray-100 p-1 rounded-md transition-colors duration-300 ease-in-out"
              >
                <Delete className="text-blue-500 rotate-45" />
                <Typography variant="body2" color="textPrimary">
                  Delete Contact
                </Typography>
              </div>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          </Popover>
          <figure className="flex items-center gap-3 m-0">
            <img
              src="/transparent-logo.png"
              alt="Logo"
              width={90}
              height={90}
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
        </div>
        <IconButton onClick={handleClickSearch}>
          <SearchIcon className="text-blue-500" />
        </IconButton>
      </div>

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

      {showdeleteContactUsername && (
        <div className="p-2 bg-white flex gap-2">
          <TextField
            fullWidth
            size="small"
            placeholder="Delete contact by username..."
            value={deleteContactUsername}
            onChange={(e) => setDeleteContactUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            className="rounded-md"
          />
          <Button variant="contained" onClick={handleDeleteFriend}>
            Delete
          </Button>
        </div>
      )}
    </>
  );
}
