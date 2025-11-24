"use client"

import { useEffect, useState, useContext } from "react"
import { type ChipProps } from "@mui/material"
import {
  Container,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  Alert,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Autocomplete,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
  People,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import { AuthContext } from "../../Context/AuthContext"

interface Campus {
  id: number
  name: string
}

interface Role {
  id: number
  name: string
}

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  last_login: string | null
  date_joined: string
  campuses: Campus[]
  password: string;
  confirm_password: string;
  role: string | null
  phone?: string | null
}

const getRoleColor = (role: string | null): "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success" => {
  const colors: Record<string, any> = {
    admin: "error",
    reviewer: "primary",
    staff: "info",
    user: "default",
  }
  return role ? colors[role] || "default" : "default"
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function UserManagement() {
  const AxiosInstance = useAxios()
  const { showErrorAlert = () => { }, showSuccessAlert = () => { } } = useContext(AuthContext) || {}
  const [users, setUsers] = useState<User[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [registerErrors, setRegisterErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [campuses, setCampuses] = useState<Campus[]>([])

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    role: "",
    is_staff: true,
    campuses: [] as number[],
  })

  // campus color
  const getCampusColor = (campus: string): ChipProps["color"] => {
    if (!campus) return "default"

    const lowerCampus = campus.toLowerCase()

    if (lowerCampus.includes("kampala")) return "success"
    if (lowerCampus.includes("main")) return "primary"

    return "secondary"
  }

  // fetch campuses
  const fetchCampus = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get('/api/accounts/list_campus')
      setCampuses(response.data)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
      setIsLoading(false)
    }
  }

  // fetch roles
  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get('/api/accounts/list_roles')
      setUserRoles(response.data)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
    }
  }

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get("/api/accounts/list_users")
      console.log("Fetched users:", response.data)
      setUsers(response.data)
      setIsLoading(false)
    } catch (err: any) {
      console.error("Error fetching users:", err)
      setErrorMessage("Failed to load users.")
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchCampus()
    fetchRoles()
  }, [])

  type TemplateFormKeys = "campuses";
  const handleFormChange = (field: TemplateFormKeys, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: "",
        confirm_password: "",
        phone: user.phone || "",
        is_staff: true,
        role: user.role || "",
        campuses: user.campuses.map((c) => c.id),
      })
    } else {
      setSelectedUser(null)
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        phone: "",
        role: "",
        is_staff: false,
        campuses: [],
      })
    }
    setOpenDialog(true)
    setShowPassword(false)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setErrorMessage("")
  }

  const validateForm = () => {
    if (!formData.email) return "Email and username are required."
    if (!selectedUser && !formData.password) return "Password is required for new users."
    if (!formData.first_name || !formData.last_name) return "First and last name are required."
    return null
  }

  const handleSaveUser = async () => {
    const validationError = validateForm()
    setIsLoading(true)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        is_staff: true,
        phone: formData.phone,
        campuses: formData.campuses,
        ...(selectedUser ? {} : { password: formData.password, confirm_password: formData.confirm_password }),
      }

      if (selectedUser) {
        await AxiosInstance.put(`/api/accounts/edit_user/${selectedUser.id}`, payload)
        setSuccessMessage("User updated successfully!")
        showSuccessAlert("Resgistration successfull")
        setIsLoading(false)
      } else {
        await AxiosInstance.post("/api/accounts/register", payload)
        setSuccessMessage("User created successfully!")
        showSuccessAlert("Resgistration successfull")
        setIsLoading(false)
      }

      fetchUsers()
      handleCloseDialog()
    } catch (err: any) {
      if (err.response?.data.email) {
        setRegisterErrors(err.response?.data.email)
      } else if (err.response?.data.password) {
        setRegisterErrors(err.response?.data.password)
      }else{
        setErrorMessage(err.response?.data?.detail || "Failed to save user.")
      }
      showErrorAlert("Failed to register user")
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: number) => {
    const user = users.find((u) => u.id === id)
    if (!user) return

    try {
      await AxiosInstance.patch(`/api/accounts/change_user_status/${id}`, {
        is_active: !user.is_active,
      })
      setUsers(users.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u)))
      setSuccessMessage(`User ${user.is_active ? "deactivated" : "activated"} successfully!`)
    } catch (err) {
      setErrorMessage("Failed to update user status.")
    }
  }

  const handleOpenDeleteDialog = (id: number) => {
    setDeleteUserId(id)
    setOpenDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteUserId === null) return

    try {
      setIsLoading(true)
      await AxiosInstance.delete(`/api/accounts/delete_user/${deleteUserId}`)
      setUsers(users.filter((u) => u.id !== deleteUserId))
      setSuccessMessage("User deleted successfully!")
      setIsLoading(false)
    } catch (err: any) {
      setErrorMessage(`${err.response?.data.detail}`)
      setIsLoading(false)
    } finally {
      setOpenDeleteDialog(false)
      setDeleteUserId(null)
      setIsLoading(false)
    }
  }

  const getFullName = (user: User) => {
    return `${user.first_name} ${user.last_name}`.trim()
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          User Management
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add New User
        </Button>
      </Box>

      {/* Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Campus(es)</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Card variant="outlined" sx={{ border: "none", backgroundColor: "transparent" }}>
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 8,
                        textAlign: "center",
                      }}
                    >
                      <People sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Users Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start inviting team members to manage the system.
                      </Typography>
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow
                  key={user.id}
                  sx={{
                    "&:hover": { backgroundColor: "#fafafa" },
                    opacity: user.is_active ? 1 : 0.6,
                    transition: "all 0.2s",
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {getFullName(user)}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.campuses && user.campuses.length > 0 ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {user.campuses.map((campus) => (
                          <Chip
                            key={campus.id}  
                            label={campus.name}
                            color={getCampusColor(campus.name)}
                            size="small"
                            variant="outlined" 
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No campus assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role || "No Role"}
                      color={getRoleColor(user.role)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={user.is_active ? "Active" : "Inactive"}>
                      <Switch
                        checked={user.is_active}
                        onChange={() => handleToggleActive(user.id)}
                        size="small"
                        color="success"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>{formatDate(user.date_joined)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit User">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete User">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(user.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
          {selectedUser ? "Edit User" : "Add New User"}
        </DialogTitle>

        {registerErrors.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {registerErrors.map((err, index) => (
              <Alert severity="error" sx={{ mb: 3 }}>
              {err}
            </Alert>
            ))}
          </Box>
        )}
        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            placeholder="Enter first name"
            size="small"
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            placeholder="Enter last name"
            size="small"
          />
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            size="small"
          />

          <Autocomplete
            multiple
            options={campuses}
            getOptionLabel={(option) => option.name}
            value={campuses.filter((p) => formData.campuses.includes(p.id))}
            onChange={(_, newValue) => {
              handleFormChange("campuses", newValue.map((v) => v.id))
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Campuses"
                placeholder="Search and select Campus..."
                required={formData.campuses.length === 0}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            loading={campuses.length === 0}
            noOptionsText="No Campuses found"
          />

          <TextField
            fullWidth
            type="tel"
            label="Phone"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value
              setFormData({
                ...formData,
                phone: value,
              })
            }}
            placeholder="Enter phone number"
            size="small"
          />
          <Box sx={{ position: "relative" }}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={selectedUser ? "Leave empty to keep current" : "Enter password"}
              size="small"
            // disabled={!!selectedUser}
            />
            {!selectedUser && (
              <IconButton
                sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            )}
          </Box>

          <Box sx={{ position: "relative" }}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Confirm Password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              placeholder={selectedUser ? "Leave empty to keep current" : "Enter password"}
              size="small"
            // disabled={!!selectedUser}
            />
            {!selectedUser && (
              <IconButton
                sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            )}
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {userRoles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading
              ? (selectedUser ? "Updating..." : "Creating...")
              : (selectedUser ? "Update" : "Create")} User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>Are you sure you want to delete this user? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}