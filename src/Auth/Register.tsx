"use client"

import type React from "react"

import { useState } from "react"
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
  Grid,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { api } from "../../lib/api"
import { useNavigate } from "react-router-dom"

import Navbar from '../Navbar/Navbar'

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
  is_applicant:boolean
}

interface FormErrors {
  [key: string]: string
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    is_applicant:true
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registerErrors, setRegisterErrors] = useState<string[]>([])

  const navigate = useNavigate()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required"
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }
     try{
      setLoading(true)
      const response = await api.post('/api/accounts/register', formData)
      if(response.status === 201){
        setLoading(false)
        setSuccess(true)
        setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
        is_applicant:false
      })
       navigate('/')
      }
     }catch(err:any){
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
    <>
    <Navbar/>
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
        <Paper
          elevation={1}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: "#ffffff",
            border: "1px solid #f0f0f0",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "#1a1a1a",
                mb: 1,
                letterSpacing: "-0.5px",
              }}
            >
              Create Account
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#888888",
                fontSize: "0.95rem",
              }}
            >
              Join us today and get started
            </Typography>
          </Box>

          {/* errors */}
           {registerErrors.length > 0 && (
          <Box sx={{ mb: 3, justifyContent:'center' }}>
            {registerErrors.map((err, index) => (
              <Alert severity="error" sx={{ mb: 3 }}>
              {err}
            </Alert>
            ))}
          </Box>
        )}

          {/* Success Message */}
          {success && (
            <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3 }}>
              Account created successfully!
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{xs:12, sm:6}}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  variant="outlined"
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fafafa",
                      "&:hover fieldset": {
                        borderColor: "#d0d0d0",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#333333",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#333333",
                    },
                  }}
                />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  variant="outlined"
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fafafa",
                      "&:hover fieldset": {
                        borderColor: "#d0d0d0",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#333333",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#333333",
                    },
                  }}
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
              size="medium"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fafafa",
                  "&:hover fieldset": {
                    borderColor: "#d0d0d0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#333333",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#333333",
                },
              }}
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
              size="medium"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fafafa",
                  "&:hover fieldset": {
                    borderColor: "#d0d0d0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#333333",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#333333",
                },
              }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{xs:12, sm:6}}>
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
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fafafa",
                      "&:hover fieldset": {
                        borderColor: "#d0d0d0",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#333333",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#333333",
                    },
                  }}
                />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
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
                  size="medium"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fafafa",
                      "&:hover fieldset": {
                        borderColor: "#d0d0d0",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#333333",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#333333",
                    },
                  }}
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
                background: "#1a1a1a",
                color: "#ffffff",
                fontWeight: 600,
                py: 1.5,
                mb: 2,
                textTransform: "none",
                fontSize: "1rem",
                borderRadius: 1.5,
                "&:hover": {
                  background: "#333333",
                },
                "&:disabled": {
                  background: "#cccccc",
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Create Account"}
            </Button>

            {/* Login Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#888888" }}>
                Already have an account?{" "}
                <Link
                  href="/"
                  sx={{
                    color: "#1a1a1a",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Login here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
    </>
  )
}
