"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Grid,
  Stack,
  Divider,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CheckIcon from "@mui/icons-material/Check"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import SchoolIcon from "@mui/icons-material/School"
import { api } from "../../lib/api"
import { useNavigate } from "react-router-dom"
import logo from '../Images/Ndejje_University_Logo.jpg'
import cover_image from '../Images/cover_page.jpg'

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
  is_applicant: boolean
}

interface FormErrors {
  [key: string]: string
}

const NAVY = "#000080"
const NAVY_DARK = "#000066"
const RED = "#c0001a"

const checklist = [
  "A valid email address and mobile phone number",
  "Academic details (index number, year of sitting, awarding institution)",
  "Scanned copies of academic documents",
  "A passport-size photograph",
  "UGX 50,000 Application fee (Undergraduate) or UGX 70,000 (Graduate) on Mobile Money",
  "Stable internet connection",
]

const contacts = [
  { Icon: EmailIcon, text: "admissions@ndejjeuniversity.ac.ug" },
  { Icon: PhoneIcon, text: "+256 200 930 438" },
  { Icon: WhatsAppIcon, text: "+256 705 047 283" },
]

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#f8f9ff",
    "&:hover fieldset": { borderColor: NAVY },
    "&.Mui-focused fieldset": { borderColor: NAVY, borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: NAVY },
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    is_applicant: true,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registerErrors, setRegisterErrors] = useState<string[]>([])

  const navigate = useNavigate()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required"
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    try {
      setLoading(true)
      const response = await api.post('/api/accounts/register', formData)
      if (response.status === 201) {
        setLoading(false)
        setSuccess(true)
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          password: "",
          confirm_password: "",
          is_applicant: false,
        })
        navigate('/')
      }
    } catch (err: any) {
      console.log(err)
      if (err.response?.data.email) {
        setRegisterErrors(err.response?.data.email)
      } else if (err.response?.data.password) {
        setRegisterErrors(err.response?.data.password)
      }
      setLoading(false)
      setSuccess(false)
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>

      {/* ── LEFT PANEL ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "42%",
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
            background: "linear-gradient(160deg, rgba(0,0,128,0.92) 0%, rgba(0,0,80,0.97) 100%)",
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            p: 5,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Logo + Name */}
          <Stack direction="row" alignItems="center" spacing={2} mb={4}>
            <Box
              component="img"
              src={logo}
              alt="Ndejje University"
              sx={{ height: 55, objectFit: "contain", borderRadius: 1 }}
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
            mb={3}
          >
            "Fear of God brings Knowledge and Wisdom"
          </Typography>

          {/* Heading */}
          <Typography variant="h4" fontWeight={800} color="#fff" lineHeight={1.3} mb={1}>
            Start Your Journey With Us
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.70)" lineHeight={1.8} mb={3}>
            Join thousands of students who have taken their first step toward a brighter future at Ndejje University.
          </Typography>

          <Box sx={{ width: 60, height: 4, backgroundColor: RED, borderRadius: 2, mb: 3 }} />

          {/* Checklist */}
          <Typography variant="subtitle2" fontWeight={700} color="rgba(255,255,255,0.90)" mb={1.5}>
            What you need before you start:
          </Typography>
          <Stack spacing={1.2}>
            {checklist.map((item) => (
              <Stack key={item} direction="row" alignItems="flex-start" spacing={1.2}>
                <Box
                  sx={{
                    mt: 0.2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckIcon sx={{ fontSize: 12, color: "#fff" }} />
                </Box>
                <Typography variant="caption" color="rgba(255,255,255,0.75)" lineHeight={1.6}>
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* Contacts */}
          <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", my: 3 }} />
          <Stack spacing={1.2}>
            {contacts.map(({ Icon, text }) => (
              <Stack key={text} direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 15, color: "#fff" }} />
                </Box>
                <Typography variant="caption" color="rgba(255,255,255,0.80)" fontSize="0.78rem">
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
          px: { xs: 3, sm: 5, md: 7 },
          py: 5,
          overflowY: "auto",
        }}
      >
        {/* Mobile logo */}
        <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", alignItems: "center", mb: 4 }}>
          <Box component="img" src={logo} alt="Ndejje University" sx={{ height: 55, objectFit: "contain", mb: 1 }} />
          <Typography variant="h6" fontWeight={800} color={NAVY}>NDEJJE UNIVERSITY</Typography>
          <Typography variant="caption" color="text.secondary">Online Applications Portal</Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 440 }}>
          {/* Heading */}
          <Typography variant="h4" fontWeight={800} color={NAVY} mb={0.5}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Fill in your details below to get started with your application.
          </Typography>

          {/* Errors */}
          {registerErrors.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {registerErrors.map((err, index) => (
                <Alert key={index} severity="error" sx={{ mb: 1, borderRadius: 2 }}>
                  {index + 1}: {err}
                </Alert>
              ))}
            </Box>
          )}

          {/* Success */}
          {success && (
            <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              Account created successfully!
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  variant="outlined"
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  variant="outlined"
                  sx={fieldSx}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              sx={{ mb: 2, ...fieldSx }}
            />

            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              variant="outlined"
              sx={{ mb: 2, ...fieldSx }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  variant="outlined"
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password}
                  variant="outlined"
                  sx={fieldSx}
                />
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                background: NAVY,
                color: "#ffffff",
                fontWeight: 700,
                py: 1.7,
                mb: 2,
                textTransform: "none",
                fontSize: "1rem",
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,128,0.3)",
                "&:hover": {
                  background: NAVY_DARK,
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 28px rgba(0,0,128,0.4)",
                },
                "&:disabled": { background: "#cccccc" },
                transition: "all 0.25s ease",
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Create Account"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  href="/"
                  sx={{
                    color: RED,
                    textDecoration: "none",
                    fontWeight: 700,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Login here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
