"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  IconButton,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import EmailIcon from "@mui/icons-material/Email"

interface EmailDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (email: string) => Promise<void> | void
  title?: string
  description?: string
  submitButtonText?: string
  loading?: boolean
}

export default function EmailDialog({
  open,
  onClose,
  onSubmit,
  title = "Enter your email",
  description = "We'll send a confirmation or reset link to this address.",
  submitButtonText = "Submit",
  loading,
}: EmailDialogProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(email.trim())
      // Optional: close dialog only on success
      // onClose()
      setEmail("") // reset field
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setError(null)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="email-dialog-title"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        },
      }}
    >
      <DialogTitle id="email-dialog-title" sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {description}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <EmailIcon color="action" sx={{ mt: 1.5 }} />
          <TextField
            autoFocus
            margin="dense"
            label="Email address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null) // clear error on typing
            }}
            onKeyDown={handleKeyDown}
            error={!!error}
            helperText={error || "We'll never share your email with anyone else."}
            disabled={isSubmitting || loading}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={isSubmitting || loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || loading || !email.trim()}
          startIcon={(isSubmitting || loading) && <CircularProgress size={20} color="inherit" />}
        >
          {isSubmitting || loading ? "Submitting..." : submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}