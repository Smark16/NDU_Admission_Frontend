"use client"

import type React from "react"
import { useState, useEffect, useContext, useRef } from "react"
import {
  Container,
  Grid,
  TextField,
  Button,
  Avatar,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Stack,
  Chip,
  Divider,
  IconButton,
  Alert,
} from "@mui/material"
import {
  Save as SaveIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  // Business as BusinessIcon,
  CalendarMonth as CalendarIcon,  // ✅ valid icon
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"
import { AuthContext } from "../../Context/AuthContext"
import useAxios from "../../AxiosInstance/UseAxios"

interface User {
  first_name: string
  last_name: string
  email: string
  phone: number
}
interface UserData {
  id:number
  profile_photo?: string
  date_joined: string
  // campuses: Array<{ name: string }>
}

function ProfileSkeleton() {
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={20} sx={{ mt: 1 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <Skeleton variant="rectangular" height={60} />
            <CardContent>
              <Stack spacing={2}>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <Skeleton variant="circular" width={150} height={150} sx={{ mx: "auto", mt: 2 }} />
            <Skeleton variant="text" sx={{ mt: 2 }} />
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default function ApplicantProfile() {
  const { loggeduser } = useContext(AuthContext) || {}
  const fileInputRef = useRef<HTMLInputElement>(null);
  const AxiosInstance = useAxios()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: 0,
  })

  // get user profile
  const fetchUserProfile = async () => {
    try {
      const response = await AxiosInstance.get('/api/accounts/user_profile')
      console.log('profile', response.data)
      const data: UserData = {
        id:response.data.id,
        profile_photo: response.data.profile_photo,
        date_joined: response.data.date_joined
        // campuses: [{ name: "Main Campus" }, { name: "Downtown Campus" }],
      }
      setUserData(data)
      setProfileImage(data.profile_photo || null)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
      setIsLoading(false)
    }
  }

  // get user data
  const fetchUserData = async () => {
    try {
      const response = await AxiosInstance.get(`/api/accounts/get_user/${loggeduser?.user_id}`)
      const data: User = {
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
        phone: response.data.phone,
      }
      setUserInfo(data)
      setFormData({
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone
      })
      setIsLoading(false)
    } catch (err) {
      console.log(err)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
    fetchUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      const formdata = new FormData()
      if(file && file instanceof File){
        formdata.append('profile_photo', file)
      }

      await AxiosInstance.put(`/api/accounts/edit_profile/${userData?.id}`, formdata)

    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    const formdata = new FormData()
    formdata.append("first_name", formData.firstName)
    formdata.append("last_name", formData.lastName)
    formdata.append("email", formData.email)
    formdata.append("phone", String(Number(formData.phone)))

    const response = await AxiosInstance.put(`/api/accounts/edit_user/${loggeduser?.user_id}`, formdata)
    if (response.status === 200) {
      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)

    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      firstName: formData?.firstName || "",
      lastName: formData?.lastName || "",
      email: formData.email || "",
      phone: formData?.phone || 0,
    })
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Profile Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your account information and preferences
        </Typography>
      </Box>

      {/* Success Message */}
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage("")}
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
          icon={<CheckCircleIcon />}
        >
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Form Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <CardHeader
              avatar={<PersonIcon sx={{ color: "primary.main" }} />}
              title="Personal Information"
              action={
                !isEditing && (
                  <IconButton onClick={handleEdit} color="primary">
                    <EditIcon />
                  </IconButton>
                )
              }
              sx={{
                background: "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(21, 101, 192, 0.04) 100%)",
                borderBottom: "1px solid",
                borderColor: "divider",
                py: 2,
              }}
            />

            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter first name"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter last name"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter email address"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: "action.active" }} />,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="Enter phone number"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: "action.active" }} />,
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Edit/Save/Cancel Buttons */}
                {isEditing && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
                    <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ flex: 1 }}>
                      Save Changes
                    </Button>
                    <Button type="button" variant="outlined" onClick={handleCancel} sx={{ flex: 1 }}>
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Profile Picture Card */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardHeader
                title="Profile Picture"
                sx={{
                  background: "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(21, 101, 192, 0.04) 100%)",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  py: 2,
                }}
              />
              <CardContent sx={{ textAlign: "center", p: { xs: 2, md: 3 } }}>
                <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                  <Avatar
                    alt="Profile"
                    src={
                      selectedFile
                    ? URL.createObjectURL(selectedFile) 
                    : typeof userData?.profile_photo === "string"
                      ? `${import.meta.env.VITE_API_BASE_URL}${userData?.profile_photo}` 
                      : undefined
                    }
                    sx={{
                      width: 150,
                      height: 150,
                      border: "4px solid",
                      borderColor: "primary.main",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  {isEditing && (
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": { backgroundColor: "primary.dark" },
                      }}
                      size="small"
                    >
                      <PhotoCameraIcon fontSize="small" />
                      <input 
                      hidden 
                      accept="image/*" 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload} />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Current profile picture
                </Typography>
              </CardContent>
            </Card>

            {/* Account Information Card */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CardHeader
                title="Account Information"
                sx={{
                  background: "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(21, 101, 192, 0.04) 100%)",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  py: 2,
                }}
              />
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                      Username
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formData.email}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                      Role
                    </Typography>
                    <Chip label={loggeduser?.is_applicant && 'Applcant'} color="primary" variant="outlined" size="small" />
                  </Box>

                  <Divider />

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <CalendarIcon sx={{ fontSize: 18, color: "action.active", mt: 0.3 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                          Member Since
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {userData?.date_joined}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* {userData?.campuses && userData.campuses.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <BusinessIcon sx={{ fontSize: 18, color: "action.active", mt: 0.3 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                              Assigned Campuses
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {userData.campuses.map((campus, idx) => (
                                <Chip key={idx} label={campus.name} size="small" variant="outlined" sx={{ mb: 0.5 }} />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>
                    </>
                  )} */}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}
