"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Container,
} from "@mui/material"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import LockResetIcon from "@mui/icons-material/LockReset"
import {api} from '../../lib/api'

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const uidb64 = searchParams.get("uidb64")
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if no token in URL
  useEffect(() => {
    if (!uidb64 || !token) {
      setError("Invalid or expired reset link")
    }
  }, [uidb64, token])

  const validateForm = (): boolean => {
    if (!password) {
      setError("Password is required")
      return false
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !uidb64 || !token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post("/api/accounts/reset_password/confirm/", {
        password: password,
        password2: confirmPassword,
        uidb64: uidb64,
        token: token,
      })

      setSuccessMessage("Password reset successfully! Redirecting to login...")
      
      setTimeout(() => {
        navigate("/")   
      }, 2000)
    } catch (err: any) {
      const msg = err.response?.data?.detail ||
                  err.response?.data?.token ||
                  err.response?.data?.password ||
                  "Failed to reset password. Please try again."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev)

  return (
    <Container maxWidth="xs">
      <Paper
        elevation={6}
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <LockResetIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />

        <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
          Reset Your Password
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Enter your new password below.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error && password.length > 0}
            helperText={error && password.length > 0 ? error : "Minimum 8 characters"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!error && confirmPassword.length > 0}
            helperText={error && confirmPassword.length > 0 ? error : "Must match above"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || !password || !confirmPassword}
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
            startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  )
}