"use client";

import React, { useState, useContext } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import Navbar from '../Navbar/Navbar';
import { AuthContext } from '../Context/AuthContext';
import cover_image from '../Images/cover_page.jpg'; 

export default function Login() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Login must be used within AuthProvider");

  const { noAccount, loginLoading, loginUser, showErrorAlert } = context;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = "Username or email is required";
    if (!password) errors.password = "Password is required";
    setError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showErrorAlert("Please fix the form errors");
      return;
    }
    await loginUser(username, password);
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: `url(${cover_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          py: 4,
        }}
      >
        {/* Dark Overlay for Text Readability */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)",
            zIndex: 1,
          }}
        />

        {/* Login Card */}
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
          <Paper
            elevation={10}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: 4,
              backdropFilter: "blur(10px)",
              background: "rgba(255, 255, 255, 0.92)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            {/* Header */}
            <Stack spacing={1} textAlign="center" mb={4}>
              <Typography
                variant="h4"
                fontWeight={700}
                color="#1a1a1a"
                letterSpacing="-0.5px"
              >
                Welcome to NDU Portal
              </Typography>
            </Stack>

            {/* Error Alert */}
            {noAccount && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {noAccount}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email or Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!error.username}
                helperText={error.username}
                autoComplete="username"
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafafa",
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error.password}
                helperText={error.password}
                autoComplete="current-password"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafafa",
                    borderRadius: 2,
                  },
                }}
              />

              <Box textAlign="right" mb={3}>
                <Link
                  href="/forgot-password"
                  underline="hover"
                  color="primary"
                  fontWeight={500}
                >
                  Forgot Password?
                </Link>
              </Box>

              <Button
                fullWidth
                type="submit"
                size="large"
                disabled={loginLoading}
                sx={{
                  py: 1.8,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(90deg, #1a1a1a 0%, #333 100%)",
                  color: "#fff",
                  borderRadius: 3,
                  textTransform: "none",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #000 0%, #222 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                  },
                  "&:disabled": {
                    background: "#aaa",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {loginLoading ? <CircularProgress size={26} color="inherit" /> : "Sign In"}
              </Button>

              <Stack direction="row" justifyContent="center" spacing={1} mt={4}>
                <Typography color="text.secondary">
                  Don't have an account?
                </Typography>
                <Link
                  href="/register"
                  underline="hover"
                  fontWeight={600}
                  color="#1a1a1a"
                >
                  Register here
                </Link>
              </Stack>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}