"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
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
  Box,
  Typography,
  Container,
  IconButton,
  Chip,
  Alert,
  Card,
  CardContent,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import useAxios from "../../AxiosInstance/UseAxios"
import CustomButton from "../../ReUsables/custombutton"

interface Campus {
  id: number
  name: string
  address: string
  email: string
  code: string
  created_at: string
}

export default function CampusManagement() {
  const AxiosInstance = useAxios()
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [nameErrors, setNameErrors] = useState<string[]>([])
  const [codeErrors, setCodeErrors] = useState<string[]>([])
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    code: "",
  })

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

  useEffect(() => {
    fetchCampus()
  }, [])

  const handleAddClick = () => {
    setEditingId(null)
    setFormData({ name: "", address: "", code: "", email: "" })
    setOpenDialog(true)
  }

  const handleEditClick = (campus: Campus) => {
    setEditingId(campus.id)
    setFormData({
      name: campus.name,
      address: campus.address,
      code: campus.code,
      email: campus.email
    })
    setOpenDialog(true)
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({ name: "", address: "", code: "", email: "" })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      setNotification({ type: "error", message: "Please fill in all required fields" })
      return
    }
    try {
      setIsLoading(true)
      const formdata = new FormData()
      if (editingId) {
        formdata.append("name", formData.name)
        formdata.append("code", formData.code)
        formdata.append("address", formData.address)
        formdata.append("email", formData.email)

        const response = await AxiosInstance.put(`/api/accounts/edit_campus/${editingId}`, formdata)
        if (response.status === 200) {
          setIsLoading(false)
          setCampuses(campuses.map((campus) => (campus.id === editingId ? { ...campus, ...formData } : campus)))
          setNotification({ type: "success", message: "Campus updated successfully" })
        }
      } else {
        formdata.append("name", formData.name)
        formdata.append("code", formData.code)
        formdata.append("address", formData.address)
        formdata.append("email", formData.email)

        const response = await AxiosInstance.post('/api/accounts/create_campus', formdata)
        if (response.status === 201) {
          const newCampus: Campus = {
            id: response.data.id,
            ...formData,
            created_at: new Date(response.data.created_at).toISOString().split("T")[0],
          }
          setIsLoading(false)
          setCampuses([...campuses, newCampus])
          setNotification({ type: "success", message: "Campus added successfully" })

        }
      }
    } catch (err: any) {
      if (err.response?.data.detail) {
        setNotification({ type: "error", message: `${err.response?.data.detail}` })
      }
      if (err.response?.data.code) {
        setCodeErrors(err.response?.data.code)
      }
      if (err.response?.data.code) {
        setNameErrors(err.response?.data.name)
      }
    }
    setIsLoading(false)
    handleDialogClose()
    setTimeout(() => setNotification(null), 3000)
  }

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await AxiosInstance.delete(`/api/accounts/delete_campus/${id}`);
      if (response.status === 204) {
        setCampuses(prev => prev.filter(campus => campus.id !== id));
        setDeleteConfirm(null);
        setNotification({ type: "success", message: "Campus deleted successfully" });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setNotification({ type: "error", message: err.response.data.detail });
      }
      setIsLoading(false)
    } finally {
      setIsLoading(false); 
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "#1a1a2e",
              mb: 0.5,
            }}
          >
            Campus Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Manage and organize all campus locations
          </Typography>
        </Box>
        <CustomButton icon={<AddIcon />} onClick={handleAddClick} text="Add New Campus"/>
      </Box>

      {/* Notification */}
      {notification ? (
        <Alert severity={notification.type} onClose={() => setNotification(null)} sx={{ mb: 3 }}>
          {notification.message}
        </Alert>
      ) : (nameErrors.length > 0) ? (
        <Box sx={{ mb: 3 }}>
          {nameErrors.map((err, index) => (
            <Typography key={index} color="error" variant="body2">
              {err}
            </Typography>
          ))}
        </Box>
      ) : (codeErrors.length > 0) ? (
        <Box sx={{ mb: 3 }}>
          {codeErrors.map((err, index) => (
            <Typography key={index} color="error" variant="body2">
              {err}
            </Typography>
          ))}
        </Box>
      ) : ''}

      {/* Table Section */}
      {campuses.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f7fa" }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontSize: "0.95rem",
                  }}
                >
                  #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontSize: "0.95rem",
                  }}
                >
                  Campus Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontSize: "0.95rem",
                  }}
                >
                  Address
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontSize: "0.95rem",
                  }}
                >
                  Code
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontSize: "0.95rem",
                  }}
                >
                  Date Added
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a2e",
                    fontSize: "0.95rem",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campuses.map((campus, index) => (
                <TableRow
                  key={campus.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f9fafb",
                    },
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell sx={{ color: "#666", fontWeight: 500 }}>{index + 1}</TableCell>
                  <TableCell sx={{ color: "#1a1a2e", fontWeight: 600 }}>{campus.name}</TableCell>
                  <TableCell sx={{ color: "#666" }}>{campus.address || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={campus.code}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: "#3e397b",
                        color: "#3e397b",
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#666" }}>{new Date(campus.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(campus)}
                        sx={{
                          color:"#3e397b",
                          "&:hover": {
                            backgroundColor: "#e3f2fd",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirm(campus.id)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#ffebee",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card sx={{ textAlign: "center", py: 4 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              No campuses found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Click "Add New Campus" to create one.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#1a1a2e",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {editingId ? "Edit Campus" : "Add New Campus"}
          <IconButton size="small" onClick={handleDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Campus Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Main Campus"
              required
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Campus Code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., MAIN-001"
              required
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g., 123 University Avenue"
              variant="outlined"
              size="small"
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="k'pla@ndu.ac.ug"
              variant="outlined"
              size="small"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <CustomButton onClick={handleDialogClose} text="Cancel" variant="outlined" sx={{ borderColor: "#7c1519", color: "#7c1519" }}/>
          <CustomButton  onClick={handleSave} text={isLoading ? (editingId ? "Updating...." : "Adding..."): (editingId ? "Update" : "Add")} />
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1a1a2e" }}>Delete Campus</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#666" }}>
            Are you sure you want to delete this campus? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton onClick={() => setDeleteConfirm(null)} variant="outlined" text="Cancel" sx={{ borderColor: "#7c1519", color: "#7c1519" }}/>
          <CustomButton onClick={() => deleteConfirm !== null && handleDelete(deleteConfirm)} text={isLoading ? 'Deleting...' : 'Delete'}/>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
