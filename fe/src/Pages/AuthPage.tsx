import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import type { AuthInput } from '../types/auth';
import { validateAuthForm } from '../utils/auth';

function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (key: 'username' | 'password', value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const newErrors = validateAuthForm(isLogin, formValues);
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async () => {
    if (validate()) {
      if (!isLogin) {
        try {
          new authService().register(formValues as AuthInput).then((res) => {
            setToken(res.access_token);
            console.log('redirect anjing1');
            navigate('/');
          });
        } catch (err) {
          console.error(err); // harusnya nanti pakai modal atau toast
        }
      } else {
        try {
          new authService().login(formValues as AuthInput).then((res) => {
            setToken(res.access_token);
            console.log('redirect anjing2');
            navigate('/');
          });
        } catch (err) {
          console.error(err); // harusnya nanti pakai modal atau toast
        }
      }
    }
  };

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <section className="flex items-center justify-center w-0 lg:w-3/5 bg-gray-300">
        <figure className="">
          <img src="/transparent-logo.png" alt="logo" />
        </figure>
      </section>
      <section className="bg-blue-400 flex items-center justify-center w-full lg:w-2/5 p-6">
        <Card
          sx={{
            padding: 4,
            width: '100%',
            maxWidth: 380,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" textAlign="center" mb={2} fontWeight="bold">
            {isLogin ? 'Login' : 'Register'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl variant="outlined" fullWidth error={!!errors.username}>
              <InputLabel>Username</InputLabel>
              <OutlinedInput
                type="text"
                value={formValues.username}
                onChange={(e) => handleChange('username', e.target.value)}
                label="Username"
                autoComplete="username"
              />
              {errors.username && (
                <Typography variant="caption" color="error">
                  {errors.username}
                </Typography>
              )}
            </FormControl>

            <FormControl variant="outlined" fullWidth error={!!errors.password}>
              <InputLabel>Password</InputLabel>
              <OutlinedInput
                type={showPassword ? 'text' : 'password'}
                value={formValues.password}
                onChange={(e) => handleChange('password', e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
              {errors.password && (
                <Typography variant="caption" color="error">
                  {errors.password}
                </Typography>
              )}
            </FormControl>

            <Button variant="contained" fullWidth onClick={handleSubmit}>
              {isLogin ? 'Masuk' : 'Daftar'}
            </Button>

            <Typography
              textAlign="center"
              variant="body2"
              sx={{ cursor: 'pointer' }}
              onClick={() => setIsLogin((prev) => !prev)}
            >
              {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}
            </Typography>
          </Box>
        </Card>
      </section>
    </div>
  );
}

export default AuthPage;
