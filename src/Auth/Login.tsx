"use client";

import React, { useState, useContext } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SchoolIcon from "@mui/icons-material/School";
import { AuthContext } from '../Context/AuthContext';
import logo from '../Images/Ndejje_University_Logo.jpg';
import cover_image from '../Images/cover_page.jpg';
import EmailDialog from './send_email';
import { api } from '../../lib/api';

const NAVY = "#000080";
const NAVY_DARK = "#000066";
const RED = "#c0001a";

const contacts = [
  { Icon: EmailIcon, text: "admissions@ndejjeuniversity.ac.ug" },
  { Icon: PhoneIcon, text: "+256 200 930 438" },
  { Icon: WhatsAppIcon, text: "+256 705 047 283" },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#f8f9ff",
    "&:hover fieldset": { borderColor: NAVY },
    "&.Mui-focused fieldset": { borderColor: NAVY, borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: NAVY },
};

export default function Login() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Login must be used within AuthProvider");

  const { noAccount, loginLoading, loginUser, showErrorAlert, showSuccessAlert } = context;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [loadEmail, setLoadEmail] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEmailSubmit = async (email: string) => {
    try {
      setLoadEmail(true);
      const res = await api.post('api/accounts/send_email', { email });
      showSuccessAlert(`${res?.data?.detail}` || 'Email sent successfully');
    } catch (err: any) {
      showErrorAlert(`${err?.response?.data?.detail}` || 'Something went wrong, please try again');
    } finally {
      setLoadEmail(false);
    }
  };

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
    <Box sx={{ minHeight: "100vh", display: "flex" }}>

      {/* ── LEFT PANEL ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "45%",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${cover_image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Navy overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, rgba(0,0,128,0.92) 0%, rgba(0,0,80,0.97) 100%)`,
          }}
        />

        {/* Content */}
        <Box sx={{ position: "relative", zIndex: 1, p: 5, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Logo + Name */}
          <Stack direction="row" alignItems="center" spacing={2} mb={5}>
            <Box
              component="img"
              src={logo}
              alt="Ndejje University"
              sx={{ height: 60, objectFit: "contain", borderRadius: 1 }}
            />
            <Box>
              <Typography variant="h6" fontWeight={800} color="#fff" lineHeight={1.1}>
                NDEJJE
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#fff" lineHeight={1.1}>
                UNIVERSITY
              </Typography>
            </Box>
          </Stack>

          {/* Motto */}
          <Typography
            variant="caption"
            color="rgba(255,255,255,0.60)"
            fontStyle="italic"
            display="block"
            mb={2}
          >
            "Fear of God brings Knowledge and Wisdom"
          </Typography>

          {/* Tagline */}
          <Typography variant="h4" fontWeight={800} color="#fff" lineHeight={1.3} mb={2}>
            Online Applications Portal
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.75)" lineHeight={1.8} mb={5}>
            Empowering minds and transforming lives through quality, innovation-driven education in the heart of Uganda.
          </Typography>

          {/* Decorative divider */}
          <Box sx={{ width: 60, height: 4, backgroundColor: RED, borderRadius: 2, mb: 5 }} />

          {/* Contact info */}
          <Stack spacing={1.5}>
            {contacts.map(({ Icon, text }) => (
              <Stack key={text} direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 16, color: "#fff" }} />
                </Box>
                <Typography variant="caption" color="rgba(255,255,255,0.85)" fontSize="0.8rem">
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Bottom badge */}
        <Box sx={{ position: "relative", zIndex: 1, p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SchoolIcon sx={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }} />
            <Typography variant="caption" color="rgba(255,255,255,0.4)">
              Uganda's oldest and most respected private Christian University
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* ── RIGHT PANEL ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          px: { xs: 3, sm: 6, md: 8 },
          py: 6,
        }}
      >
        {/* Mobile logo (shown only on small screens) */}
        <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", alignItems: "center", mb: 4 }}>
          <Box component="img" src={logo} alt="Ndejje University" sx={{ height: 60, objectFit: "contain", mb: 1 }} />
          <Typography variant="h6" fontWeight={800} color={NAVY}>NDEJJE UNIVERSITY</Typography>
          <Typography variant="caption" color="text.secondary">Online Applications Portal</Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Heading */}
          <Typography variant="h4" fontWeight={800} color={NAVY} mb={0.5}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Sign in to your applicant account to continue.
          </Typography>

          {/* Error */}
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
              sx={{ mb: 2.5, ...fieldSx }}
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
              sx={{ mb: 1.5, ...fieldSx }}
            />

            <Box textAlign="right" mb={3}>
              <Link
                underline="hover"
                onClick={handleOpen}
                fontWeight={500}
                fontSize="0.875rem"
                sx={{ cursor: "pointer", color: NAVY }}
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
                py: 1.7,
                fontSize: "1rem",
                fontWeight: 700,
                background: NAVY,
                color: "#fff",
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 20px rgba(0,0,128,0.3)",
                "&:hover": {
                  background: NAVY_DARK,
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 28px rgba(0,0,128,0.4)",
                },
                "&:disabled": { background: "#aaa" },
                transition: "all 0.25s ease",
              }}
            >
              {loginLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 2.5 }}>
              <Box sx={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }} />
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{
                  color: "#000080",
                  fontSize: "0.95rem",
                  letterSpacing: "0.3px",
                  whiteSpace: "nowrap",
                }}
              >
                New here? Join us!
              </Typography>
              <Box sx={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }} />
            </Box>

            <Button
              fullWidth
              href="/register"
              size="large"
              sx={{
                py: 1.7,
                fontSize: "1rem",
                fontWeight: 700,
                background: RED,
                color: "#fff",
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 20px rgba(192,0,26,0.25)",
                "&:hover": {
                  background: "#a0001a",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 28px rgba(192,0,26,0.35)",
                },
                transition: "all 0.25s ease",
              }}
            >
              Sign Up for an Account
            </Button>
          </Box>
        </Box>
      </Box>

      <EmailDialog
        open={open}
        loading={loadEmail}
        onClose={handleClose}
        onSubmit={handleEmailSubmit}
        title="Reset your password"
        description="Enter your email address and we'll send you a reset link."
        submitButtonText="Send Reset Link"
      />
    </Box>
  );
}
