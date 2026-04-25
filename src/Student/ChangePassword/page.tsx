"use client"

import React, { useState, useContext } from "react"
import {
  Box, Typography, TextField, Button, Alert,
  CircularProgress, Paper, InputAdornment, IconButton,
} from "@mui/material"
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../Context/AuthContext"
import useAxios from "../../AxiosInstance/UseAxios"
import logo from "../../Images/Ndejje_University_Logo.jpg"

export default function StudentChangePasswordPage() {
  const navigate  = useNavigate()
  const axios     = useAxios()
  const { loggeduser, setAuthTokens, setLoggedUser } = useContext(AuthContext) || {}

  const [newPassword,     setNewPassword]     = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew,         setShowNew]         = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [submitting,      setSubmitting]      = useState(false)
  const [error,           setError]           = useState<string | null>(null)
  const [done,            setDone]            = useState(false)

  const rules = [
    { label: "At least 8 characters",        ok: newPassword.length >= 8 },
    { label: "Contains a number",            ok: /\d/.test(newPassword) },
    { label: "Contains an uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "Passwords match",              ok: newPassword === confirmPassword && confirmPassword.length > 0 },
  ]

  const allValid = rules.every(r => r.ok)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allValid) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await axios.post("/api/accounts/student/change_password", {
        new_password: newPassword,
        confirm_password: confirmPassword,
      })

      // Store the fresh tokens the backend returned
      const newTokens = { access: res.data.access, refresh: res.data.refresh }
      localStorage.setItem("authtokens", JSON.stringify(newTokens))
      if (setAuthTokens) setAuthTokens(newTokens)

      // Decode and update logged user — must_change_password is now false
      const { jwtDecode } = await import("jwt-decode")
      const decoded: any = jwtDecode(newTokens.access)
      if (setLoggedUser) setLoggedUser(decoded)

      setDone(true)
      // Go straight to the student portal — no re-login needed
      setTimeout(() => navigate("/student/portal"), 1800)
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(Array.isArray(detail) ? detail.join(" ") : detail || "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const eyeAdornment = (show: boolean, toggle: () => void) => ({
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={toggle} edge="end">
            {show ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    },
  })

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f5f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 3,
          border: "1px solid #e0e0e0",
          overflow: "hidden",
        }}
      >
        {/* Top banner */}
        <Box sx={{ bgcolor: "#3e397b", p: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <img src={logo} alt="NDU" style={{ height: 48, borderRadius: 6 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="white">
              NDU Student Portal
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              Account Security Setup
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 4 }}>
          {done ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 56, color: "#2e7d32", mb: 1.5 }} />
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Password Changed!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taking you to the student portal…
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <LockIcon sx={{ color: "#3e397b" }} />
                <Typography variant="h6" fontWeight={700}>
                  Set Your Password
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Welcome, <strong>{loggeduser?.first_name} {loggeduser?.last_name}</strong>!
                You are logging in for the first time. Please set a new password before continuing.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  slotProps={eyeAdornment(showNew, () => setShowNew(p => !p))}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  slotProps={eyeAdornment(showConfirm, () => setShowConfirm(p => !p))}
                />

                {/* Password strength checklist */}
                <Box sx={{ mb: 3, pl: 0.5 }}>
                  {rules.map((r, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Box
                        sx={{
                          width: 8, height: 8, borderRadius: "50%",
                          bgcolor: r.ok ? "#2e7d32" : "#ccc",
                          flexShrink: 0,
                          transition: "background 0.2s",
                        }}
                      />
                      <Typography
                        variant="caption"
                        color={r.ok ? "#2e7d32" : "text.disabled"}
                        sx={{ fontWeight: r.ok ? 600 : 400 }}
                      >
                        {r.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  disabled={!allValid || submitting}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: "1rem",
                    bgcolor: "#3e397b",
                    color: "white",
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#2d2960" },
                    "&:disabled": { bgcolor: "#b0b0b0" },
                  }}
                >
                  {submitting
                    ? <CircularProgress size={22} color="inherit" />
                    : "Set Password & Continue"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
