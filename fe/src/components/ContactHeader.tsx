import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth';
import { useNotificationStore } from '../stores/useNotificationStore';

interface ContactHeaderProps {
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export default function ContactHeader({
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
}: ContactHeaderProps) {
  const { setLoading, token, setToken } = useAuth();
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
    </>
  );
}
