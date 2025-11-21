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
} from "@mui/material";
import Navbar from '../Navbar/Navbar';
import { AuthContext } from '../Context/AuthContext';

export default function Login() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Login must be used within AuthProvider");

  const { noAccount, loginLoading, loginUser, showErrorAlert } = context;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = "Username is required";
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

    try {
      await loginUser(username, password);
    } catch (err) {
      // loginUser already handles errors
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={1} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, border: "1px solid #f0f0f0" }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: "#1a1a1a", mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: "#888888" }}>
                Sign in to your account
              </Typography>
            </Box>

            {noAccount && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                {noAccount}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email or Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!error.username}
                helperText={error.username}
                autoComplete="username"
                sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { backgroundColor: "#fafafa" } }}
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
                sx={{ mb: 2, "& .MuiOutlinedInput-root": { backgroundColor: "#fafafa" } }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                <Link href="/forgot-password" sx={{ fontSize: "0.9rem", color: "#1a1a1a" }}>
                  Forgot Password?
                </Link>
              </Box>

              <Button
                fullWidth
                type="submit"
                disabled={loginLoading}
                sx={{
                  background: "#1a1a1a",
                  color: "#fff",
                  py: 1.5,
                  mb: 2.5,
                  "&:hover": { background: "#333" },
                  "&:disabled": { background: "#ccc" },
                }}
              >
                {loginLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#888" }}>
                  Don't have an account?{" "}
                  <Link href="/register" sx={{ color: "#1a1a1a", fontWeight: 600 }}>
                    Register here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}