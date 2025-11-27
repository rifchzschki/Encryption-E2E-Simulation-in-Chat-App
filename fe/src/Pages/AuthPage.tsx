import { Visibility, VisibilityOff } from "@mui/icons-material";
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
} from "@mui/material";
import { useState } from "react";
import { validateAuthForm } from "../utils/auth";
import { authService } from "../services/auth";
import type { AuthInput } from "../types/auth";

function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (key: "username" | "password", value: string) => {
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
        console.log("Success (register):", formValues);
        // TODO: call API register di sini
        const authServiceInstance = new authService();
        const res = await authServiceInstance.register(formValues as AuthInput)
        console.log(res);

      } else {
        console.log("Succes (Login):", formValues);
        // TODO: call API login di sini
        const authServiceInstance = new authService();
        const res = await authServiceInstance.login(formValues as AuthInput)
        console.log(res);
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
            width: "100%",
            maxWidth: 380,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" textAlign="center" mb={2} fontWeight="bold">
            {isLogin ? "Login" : "Register"}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl variant="outlined" fullWidth error={!!errors.username}>
              <InputLabel>Username</InputLabel>
              <OutlinedInput
                type="text"
                value={formValues.username}
                onChange={(e) => handleChange("username", e.target.value)}
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
                type={showPassword ? "text" : "password"}
                value={formValues.password}
                onChange={(e) => handleChange("password", e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
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
              {isLogin ? "Masuk" : "Daftar"}
            </Button>

            <Typography
              textAlign="center"
              variant="body2"
              sx={{ cursor: "pointer" }}
              onClick={() => setIsLogin((prev) => !prev)}
            >
              {isLogin ? "Belum punya akun? Daftar" : "Sudah punya akun? Login"}
            </Typography>
          </Box>
        </Card>
      </section>
    </div>
  );
}

export default AuthPage;
