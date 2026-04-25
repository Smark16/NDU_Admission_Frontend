"use client";

import React, { useState, useContext } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Link,
  Stack,
  Divider,
} from "@mui/material";
import {
  Facebook,
  YouTube,
  Instagram,
  Twitter,
  LinkedIn,
} from "@mui/icons-material";
import { AuthContext } from '../Context/AuthContext';
import cover_image from '../Images/cover_page.jpg';
import logo from '../Images/Ndejje_University_Logo.jpg';
import EmailDialog from './send_email';
import { api } from '../../lib/api';

const PORTAL_TYPES = [
  { id: "applicant",  label: "Applicant" },
  { id: "student",    label: "Student" },
  { id: "admin",      label: "Administrator" },
  { id: "staff",      label: "Staff" },
];

const SOCIAL_ICONS = [Facebook, YouTube, Instagram, Twitter, LinkedIn];

export default function Login() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Login must be used within AuthProvider");

  const { noAccount, loginLoading, loginUser, showErrorAlert, showSuccessAlert } = context;

  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState<Record<string, string>>({});
  const [open, setOpen]           = useState(false);
  const [loadEmail, setLoadEmail] = useState(false);
  const [portalType, setPortalType] = useState("applicant");

  const handleEmailSubmit = async (email: string) => {
    try {
      setLoadEmail(true);
      const res = await api.post('api/accounts/send_email', { email });
      showSuccessAlert(res?.data?.detail || 'Email sent successfully');
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.detail || 'Something went wrong, please try again');
    } finally {
      setLoadEmail(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = "Username or email is required";
    if (!password)        errors.password = "Password is required";
    setError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await loginUser(username, password, portalType as any);
  };

  const selectedPortal = PORTAL_TYPES.find(p => p.id === portalType);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ── LEFT PANEL: Hero / Branding ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: "0 0 60%",
          position: "relative",
          flexDirection: "column",
          backgroundImage: `url(${cover_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark gradient overlay — heavier on left for text legibility */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(10,10,40,0.88) 0%, rgba(10,10,40,0.55) 55%, rgba(10,10,40,0.15) 100%)",
          }}
        />

        {/* NDU Logo — top left */}
        <Box sx={{ position: "absolute", top: 32, left: 40, zIndex: 2 }}>
          <img
            src={logo}
            alt="Ndejje University Logo"
            style={{ height: 72, borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
          />
        </Box>

        {/* Bottom content — welcome text + social */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            mt: "auto",
            p: { md: 5, lg: 7 },
            pb: { md: 5 },
          }}
        >
          <Typography
            variant="h3"
            fontWeight={800}
            color="white"
            sx={{ mb: 2, lineHeight: 1.2, letterSpacing: "-0.5px" }}
          >
            Welcome to<br />NDU Portal
          </Typography>

          <Typography
            variant="body1"
            color="rgba(255,255,255,0.72)"
            sx={{ maxWidth: 430, mb: 4, lineHeight: 1.8 }}
          >
            Ndejje University (NDU) was founded in 1992. It is owned by all six
            Church of Uganda (CoU) Dioceses in Buganda Region — the
            "Ndejje University Foundation Consortium".
          </Typography>

          {/* Social icons */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            {SOCIAL_ICONS.map((Icon, i) => (
              <Box
                key={i}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.65)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    borderColor: "rgba(255,255,255,0.7)",
                  },
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
              </Box>
            ))}
          </Stack>

          <Typography variant="caption" color="rgba(255,255,255,0.35)">
            www.ndejjeuniversity.ac.ug
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT PANEL: Login Form ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#ffffff",
          px: { xs: 3, sm: 6 },
          py: 4,
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>

          {/* Mobile-only logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 3 }}>
            <img src={logo} alt="NDU Logo" style={{ height: 60 }} />
          </Box>

          {/* Heading */}
          <Typography variant="h5" fontWeight={700} color="#1a1a1a" sx={{ mb: 0.5 }}>
            Sign in to NDU Portal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select your portal type and enter your credentials
          </Typography>

          {/* Portal type selector */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {PORTAL_TYPES.map((p) => (
              <Chip
                key={p.id}
                label={p.label}
                onClick={() => setPortalType(p.id)}
                sx={{
                  borderRadius: "8px",
                  fontWeight: portalType === p.id ? 600 : 400,
                  bgcolor: portalType === p.id ? "#3e397b" : "transparent",
                  color: portalType === p.id ? "white" : "text.secondary",
                  border: "1px solid",
                  borderColor: portalType === p.id ? "#3e397b" : "#d0d0d0",
                  transition: "all 0.18s",
                  "&:hover": {
                    bgcolor: portalType === p.id ? "#2d2960" : "#f0f0f0",
                    borderColor: portalType === p.id ? "#2d2960" : "#bbb",
                  },
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
            ))}
          </Box>

          {/* Error alert */}
          {noAccount && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
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
                mb: 2.5,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
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
                mb: 1.5,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />

            <Box textAlign="right" mb={3}>
              <Link
                underline="hover"
                onClick={() => setOpen(true)}
                sx={{
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "#3e397b",
                  fontWeight: 500,
                }}
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
                py: 1.6,
                fontSize: "1rem",
                fontWeight: 600,
                bgcolor: "#3e397b",
                color: "#fff",
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(62,57,123,0.35)",
                "&:hover": {
                  bgcolor: "#2d2960",
                  boxShadow: "0 6px 20px rgba(62,57,123,0.45)",
                },
                "&:disabled": { bgcolor: "#b0b0b0", boxShadow: "none" },
                transition: "all 0.2s",
              }}
            >
              {loginLoading
                ? <CircularProgress size={22} color="inherit" />
                : `Sign in as ${selectedPortal?.label}`}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.disabled">or</Typography>
            </Divider>

            <Stack direction="row" justifyContent="center" spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
              </Typography>
              <Link
                href="/register"
                underline="hover"
                variant="body2"
                fontWeight={600}
                color="#3e397b"
              >
                Apply here
              </Link>
            </Stack>
          </Box>
        </Box>
      </Box>

      <EmailDialog
        open={open}
        loading={loadEmail}
        onClose={() => setOpen(false)}
        onSubmit={handleEmailSubmit}
        title="Reset your password"
        description="Enter your email address and we'll send you a reset link."
        submitButtonText="Send Reset Link"
      />
    </Box>
  );
}
