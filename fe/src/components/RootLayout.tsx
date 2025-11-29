import { useAuth } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Outlet } from 'react-router';

export default function RootLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#ffffff',
        }}
      >
        <img src='/transparent-logo.png' alt="Loading logo" />
        <CircularProgress size={60} className='absolute bottom-40'/>
      </Box>
    );
  }

  return <Outlet />;
}
