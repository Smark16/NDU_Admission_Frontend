"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Alert,
  InputAdornment,
  Container,
  Paper,
  Stack,
  Typography,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Checkbox,
  ListItemText,
  CircularProgress,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  School as SchoolIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import { type ChipProps } from "@mui/material"
import CustomButton from "../../ReUsables/custombutton"

interface Campus {
  id: number
  name: string
}

interface Faculty {
  id: number
  code: string
  name: string
  campuses: Campus[]
  is_active: boolean
}

interface FormData {
  code: string
  name: string
  campuses: number[]
  is_active: boolean
}

interface Program {
  id: number;
  name: string
  faculty: Faculty | string
}

const initialFormData: FormData = {
  code: "",
  name: "",
  campuses: [],
  is_active: true,
}

export default function FacultyManagement() {
  const AxiosInstance = useAxios()
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [errMsg, setErrMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])

  // fetch program
  const fetchPrograms = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get('/api/program/list_programs')
      setPrograms(response.data)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
    }
  }
  // Fetch faculties
  const fetchFaculties = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get('/api/admissions/faculties')
      setFaculties(response.data)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
    }
  }

  // Fetch campuses
  const FetchCampuses = async () => {
    try {
      const response = await AxiosInstance.get('/api/accounts/list_campus')
      setCampuses(response.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const LoadAll = async () => {
      await Promise.all([fetchFaculties(), FetchCampuses(), fetchPrograms()])
    }
    LoadAll()
  }, [])

  const filteredFaculties = faculties.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // campus color
  const getCampusColor = (campus: string): ChipProps["color"] => {
    if (!campus) return "default"

    const lowerCampus = campus.toLowerCase()

    if (lowerCampus.includes("kampala")) return "success"
    if (lowerCampus.includes("main")) return "primary"

    return "secondary"
  }


  const handleOpenDialog = (faculty?: Faculty) => {
    if (faculty) {
      setEditingId(faculty.id)
      setFormData({
        code: faculty.code,
        name: faculty.name,
        campuses: faculty.campuses.map(c => c.id), // Extract IDs
        is_active: faculty.is_active,
      })
    } else {
      setEditingId(null)
      setFormData(initialFormData)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData(initialFormData)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle multi-select change
  const handleCampusChange = (event: SelectChangeEvent<number[]>) => {
    const {
      target: { value },
    } = event
    setFormData((prev) => ({
      ...prev,
      campuses: typeof value === 'string' ? value.split(',').map(Number) : value,
    }))
  }

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      alert("Please fill in all required fields")
      return
    }
    setIsLoading(true)
    try {
      if (editingId) {
        // Update existing faculty
        const response = await AxiosInstance.put(`/api/admissions/edit_faculties/${editingId}`, formData)
        if (response.status === 200) {
          setIsLoading(false)
          setOpenDialog(false)
          setFaculties((prev) =>
            prev.map((f) => (f.id === editingId ? response.data : f))
          )
          setSuccessMessage("Faculty updated successfully!")
        }

      } else {
        // Create new faculty
        const response = await AxiosInstance.post('/api/admissions/create_faculties', formData)
        if (response.status === 201) {
          setIsLoading(false)
          setOpenDialog(false)
          setFaculties((prev) => [...prev, response.data])
          setSuccessMessage("Faculty added successfully!")
        }
      }
    } catch (err: any) {
      setIsLoading(false)
      setOpenDialog(false)
      if (err.response?.data.detail) {
        setErrMsg(`${err.response?.data.detail}`)
      } else {
        setErrMsg("Failed to toggle status")
      }
      return
    }

    handleCloseDialog()
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteTargetId !== null) {
      setIsLoading(true)
      try {
        const response = await AxiosInstance.delete(`/api/admissions/delete_faculty/${deleteTargetId}`)
        if (response.status === 200) {
          setIsLoading(false)
          setFaculties((prev) => prev.filter((f) => f.id !== deleteTargetId))
          setSuccessMessage("Faculty deleted successfully!")
        }

      } catch (err: any) {
        if (err.response?.data.detail) {
          setErrMsg(`${err.response?.data.detail}`)
        }
        setIsLoading(false)
      }
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  const handleToggleStatus = async (id: number) => {
    const faculty = faculties.find(f => f.id === id)
    if (!faculty) return

    try {
      const updated = { ...faculty, is_active: !faculty.is_active }
      const response = await AxiosInstance.patch(`/api/admissions/change_status/${id}`, { is_active: updated.is_active })
      if (response.status === 200) {
        setFaculties((prev) => prev.map((f) => (f.id === id ? response.data : f)))
        setSuccessMessage(`Faculty has been ${response.data.is_active ? 'activated' : 'deactivated'} successfully`)
      }
    } catch (err: any) {
      if (err.response?.data.detail) {
        setErrMsg(`${err.response?.data.detail}`)
      } else {
        setErrMsg("Failed to toggle status")
      }

    }
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedFaculties = filteredFaculties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon sx={{ fontSize: 32, color: "#3e397b" }} />
          <Typography variant="h4" sx={{ 30: 600 }}>
            Faculty Management
          </Typography>
        </Box>
        <CustomButton icon={<AddIcon />} onClick={() => handleOpenDialog()} text="Add Faculty"/>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {errMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrMsg("")}>
          {errMsg}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by faculty name or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(0)
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ maxWidth: "400px" }}
          />
        </CardContent>
      </Card>
      {isLoading && filteredFaculties.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (

      filteredFaculties.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f7fa" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>Faculty Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>Campuses</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "text.primary" }}>Programs</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "text.primary" }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "text.primary" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFaculties.map((faculty) => (
                <>
                  <TableRow
                    key={faculty.id}
                    sx={{
                      "&:hover": { backgroundColor: "#fafbfc" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Chip label={faculty.code} size="small" sx={{ fontWeight: 600, color:"#3e397b" }} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{faculty.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {faculty.campuses.length > 0 ? (
                          faculty.campuses.map((campus) => (
                            <Chip key={campus.id} label={campus.name} color={getCampusColor(campus.name)} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">No campuses</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${programs.filter(p => p.faculty === faculty.name).length} programs`} size="small" variant="outlined"  sx={{color:"#3e397b"}} />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={faculty.is_active}
                        onChange={() => handleToggleStatus(faculty.id)}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(faculty)}
                          sx={{ color: "#3e397b", "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(faculty.id)}
                          sx={{ color: "error.main", "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </>

              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredFaculties.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <Card>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
            <SchoolIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>No Faculties Yet</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>Create your first faculty to get started.</Typography>
            <CustomButton icon={<AddIcon />} onClick={() => handleOpenDialog()} text="Create Faculty"/>
          </CardContent>
        </Card>
      )
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          {editingId ? "Edit Faculty" : "Add New Faculty"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Faculty Code"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
              placeholder="e.g., ENG"
              required
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Faculty Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g., Faculty of Engineering"
              required
              variant="outlined"
            />

            <FormControl fullWidth>
              <InputLabel id="campuses-label">Campuses</InputLabel>
              <Select
                labelId="campuses-label"
                multiple
                name="campuses"
                value={formData.campuses}
                onChange={handleCampusChange}
                label="Campuses"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as number[]).map((value) => {
                      const campus = campuses.find(c => c.id === value)
                      return campus ? <Chip key={value} label={campus.name} size="small" /> : null
                    })}
                  </Box>
                )}
              >
                {campuses.length > 0 ? (
                  campuses.map((campus) => (
                    <MenuItem key={campus.id} value={campus.id}>
                      <Checkbox checked={formData.campuses.includes(campus.id)} />
                      <ListItemText primary={campus.name} />
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No campuses available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton onClick={handleCloseDialog} text="Cancel" sx={{ borderColor: "#7c1519", color: "#7c1519" }} variant="outlined"/>
          <CustomButton onClick={handleSave} text= {isLoading ? (editingId ? "Updating..." : "Creating.."): (editingId ? "Update" : "Create")}/>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Faculty</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to delete this faculty? This action will also delete all associated programs and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton onClick={() => setDeleteConfirmOpen(false)} text="Cancel" sx={{ borderColor: "#7c1519", color: "#7c1519" }} variant="outlined"/>
          <CustomButton onClick={handleConfirmDelete} text={isLoading ? "Deleting..." : "Delete"}/>
        </DialogActions>
      </Dialog>
    </Container>
  )
}