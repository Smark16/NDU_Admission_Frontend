"use client"

import React, { useEffect, useState, type ChangeEvent } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Snackbar,
  Alert,
  type SelectChangeEvent,
  CircularProgress,
} from "@mui/material"
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  School as SchoolIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material"
import BulkUpload from "./bulk_upload"
import useAxios from "../../../AxiosInstance/UseAxios"
import ListPrograms from "./list_programs"
import Manage from "./manage"

interface Campus {
  id: number
  name: string
}

interface Faculty {
  id: number
  name: string
}

interface AcademicLevel {
  id: number
  name: string
}

interface Program {
  id: number
  name: string
  short_form: string
  code: string
  academic_level: string
  campuses: Campus[]
  faculty: string
  min_years: number | undefined
  max_years: number | undefined
  is_active: boolean
}

interface BulkUploadResult {
  success: number
  failed: number
  errors: string[]
}

const ProgramManagement: React.FC = () => {
  const AxiosInstance = useAxios()

  const [programs, setPrograms] = useState<Program[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [openBulkDialog, setOpenBulkDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    type: "success" | "error"
  }>({ open: false, message: "", type: "success" })
  const [bulkUploadResult, setBulkUploadResult] = useState<BulkUploadResult | null>(null)
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Form state uses number[] for campuses (IDs only)
  const initialForm = {
    name: "",
    short_form: "",
    code: "",
    academic_level: null as number | null,
    campuses: [] as number[],
    faculty: null as number | null,
    min_years: undefined as number | undefined,
    max_years: undefined as number | undefined,
    is_active: true,
  };


  const [formData, setFormData] = useState(initialForm)

  // Fetch Academic Levels
  const fetchAcademicLevels = async () => {
    try {
      const response = await AxiosInstance.get<AcademicLevel[]>("/api/admissions/list_academic_level")
      setAcademicLevels(response.data)
    } catch (err) {
      console.error("Failed to fetch academic levels", err)
    }
  }

  // Fetch Data
  const fetchPrograms = async () => {
    try {
      const response = await AxiosInstance.get("/api/program/list_programs")
      setPrograms(response.data)
    } catch (e) {
      console.error("Failed to fetch programs", e)
    }
  }

  const fetchCampuses = async () => {
    try {
      const { data } = await AxiosInstance.get<Campus[]>("/api/accounts/list_campus")
      setCampuses(data)
    } catch (e) {
      console.error("Failed to fetch campuses", e)
    }
  }

  const fetchFaculties = async () => {
    try {
      const { data } = await AxiosInstance.get<Faculty[]>("/api/admissions/faculties")
      setFaculties(data)
    } catch (e) {
      console.error("Failed to fetch faculties", e)
    }
  }

  useEffect(() => {
    fetchPrograms()
    fetchCampuses()
    fetchFaculties()
    fetchAcademicLevels()
  }, [])

  // Filter Programs
  const filteredPrograms = programs.filter(
    (p) =>
      p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle Campus Multi-Select Change
  const handleCampusChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value
    const selectedIds = typeof value === "string" ? value.split(",").map(Number) : value
    setFormData((prev) => ({ ...prev, campuses: selectedIds }))
  }

  // open dialog
  const handleOpenDialog = (program?: Program) => {
    if (program) {
      setEditingId(program.id)
      const facultyObj = faculties.find(f => f.name === program.faculty);
      const academicLevelObj = academicLevels.find(al => al.name === program.academic_level);
      setFormData({
        name: program.name,
        short_form: program.short_form,
        code: program.code,
        academic_level: academicLevelObj?.id ?? null,
        campuses: program.campuses.map(c => c.id),
        faculty: facultyObj?.id ?? null,
        min_years: program.min_years,
        max_years: program.max_years,
        is_active: program.is_active,
      })
    } else {
      setEditingId(null)
      setFormData(initialForm)
    }
    setOpenDialog(true)
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData(initialForm)
  }

  // Save Program
  const handleSaveProgram = async () => {
    if (!formData.name) {
      setSnackbar({ open: true, message: "Name and Code are required", type: "error" })
      return
    }
    setIsLoading(true)
    const payload = {
      ...formData,
      academic_level: Number(formData.academic_level),
      campuses: formData.campuses,
      faculty: formData.faculty || null,
    }

    try {
      if (editingId) {
        const { data } = await AxiosInstance.put<Program>(`/api/program/update_program/${editingId}`, payload)
        setIsLoading(false)
        setPrograms((prev) => prev.map((p) => (p.id === editingId ? {
          ...data,
          faculty: faculties.find(f => f.id === Number(data.faculty))?.name ?? data.faculty,
          academic_level: academicLevels.find(a => a.id === Number(data.academic_level))?.name ?? data.academic_level,
        } : p)))
        setSnackbar({ open: true, message: "Program updated", type: "success" })
      } else {
        const { data } = await AxiosInstance.post<Program>("/api/program/create_programs", payload)
        setIsLoading(false)
        setPrograms((prev) => [
          ...prev,
          {
            ...data,
            faculty: faculties.find(f => f.id === Number(data.faculty))?.name ?? data.faculty,
            academic_level: academicLevels.find(a => a.id === Number(data.academic_level))?.name ?? data.academic_level,
          }
        ])
        setSnackbar({ open: true, message: "Program created", type: "success" })
      }
      handleCloseDialog()
    } catch (e: any) {
      setSnackbar({ open: true, message: e.response?.data?.detail || "Save failed", type: "error" })
      setIsLoading(false)
    }
  }

  // Delete Program
  const handleDeleteProgram = async (id: number) => {
    try {
      setIsLoading(true)
      await AxiosInstance.delete(`/api/program/delete_program/${id}`)
      setPrograms((prev) => prev.filter((p) => p.id !== id))
      setSnackbar({ open: true, message: "Program deleted", type: "success" })
      setIsLoading(false)
    } catch (e) {
      setSnackbar({ open: true, message: "Delete failed", type: "error" })
      setIsLoading(false)
    } finally {
      setDeleteConfirm(null)
      setIsLoading(false)
    }
  }

  // Toggle Status
  const handleToggleStatus = async (id: number) => {
    const prog = programs.find((p) => p.id === id)
    if (!prog) return
    try {
      const { data } = await AxiosInstance.patch<Program>(`/api/program/change_status/${id}`, {
        is_active: !prog.is_active,
      })
      setPrograms((prev) => prev.map((p) => (p.id === id ? data : p)))
      setSnackbar({ open: true, message: `program has been ${data.is_active ? 'activated' : 'deactivated'} successfully`, type: "success" })
    } catch (e) {
      console.error(e)
    }
  }

  // bulk upload
  const handleBulkUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setBulkUploadResult(null)
    setBulkUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file_name", file.name)
      formData.append("file_path", file)

      const response = await AxiosInstance.post('/api/program/bulk_upload', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setBulkUploadProgress(percent)
          }
        },
      })

      // Success
      const summary = response.data.summary || {
        success: response.data.created_programs?.length || 0,
        failed: response.data.failed_count || 0,
        errors: response.data.errors || [],
      }

      setBulkUploadResult(summary)

      if (response.data.created_programs?.length) {
        const normalizedNewPrograms = response.data.created_programs.map((p: any) => ({
          ...p,
          faculty: faculties.find(f => f.id === Number(p.faculty))?.name ?? "Unknown Faculty",
          academic_level: academicLevels.find(al => al.id === Number(p.academic_level))?.name ?? "Unknown Level",
          campuses: Array.isArray(p.campuses)
            ? p.campuses.map((c: any) => typeof c === 'object' ? c : campuses.find(cc => cc.id === c)).filter(Boolean)
            : [],
        }))

        setPrograms(prev => [...prev, ...normalizedNewPrograms])
      }

      setSnackbar({
        open: true,
        message: `${summary.success} program(s) imported successfully`,
        type: "success",
      })

    } catch (err: any) {
      console.error("Bulk upload failed:", err)

      const data = err.response?.data
      let errorTitle = "Upload failed"
      let errorDetails: string[] = []

      if (data) {
        if (data.error) errorTitle = data.error
        if(data.details) errorTitle = data.details
        if (data.missing?.length) {
          errorDetails.push(`Missing columns: ${data.missing.join(", ")}`)
        }
        if(data.errors){
          errorDetails.push(`${data.errors.join(", ")}`)
        }
        if (data.tip) {
          errorDetails.push(data.tip)
        }
        if (data.detected?.length) {
          errorDetails.push(`Detected columns: ${data.detected.slice(0, 10).join(", ")}${data.detected.length > 10 ? "..." : ""}`)
        }
        if (data.detail) {
          errorDetails = [data.detail]
        }
      }

      const finalErrors = errorDetails.length > 0 ? errorDetails : ["Unknown error occurred"]

      setBulkUploadResult({
        success: 0,
        failed: 1,
        errors: [`${errorTitle}:`, ...finalErrors],
      })

      setSnackbar({
        open: true,
        message: errorTitle,
        type: "error",
      })

    } finally {
      setIsUploading(false)
      setBulkUploadProgress(100)
      setTimeout(() => setBulkUploadProgress(0), 1000) // reset bar after a moment
      e.target.value = "" // clear file input
    }
  }
  
  // Export to Excel (sends campus ID)
  const handleExportExcel = async () => {
    try {
      setIsLoading(true)
      const url = '/api/program/download_program_sheet';

      const resp = await AxiosInstance.get(url, { responseType: "blob" });

      const blob = new Blob([resp.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `programs-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      setIsLoading(false)
      setSnackbar({
        open: true,
        message: "Excel exported successfully!",
        type: "success",
      })
    } catch (e) {
      setIsLoading(false)
      console.error("Export failed:", e);
      setSnackbar({
        open: true,
        message: "Export failed. Please try again.",
        type: "success",
      })
    } 
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Program Management
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Manage academic programs, fees, and enrollment information
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
            <CardContent>
              <Typography color="inherit" variant="body2" sx={{ mb: 1 }}>Total Programs</Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>{programs.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
            <CardContent>
              <Typography color="inherit" variant="body2" sx={{ mb: 1 }}>Active Programs</Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>{programs.filter((p) => p?.is_active).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
            <CardContent>
              <Typography color="inherit" variant="body2" sx={{ mb: 1 }}>Undergraduate</Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>{programs.filter((p) => p?.academic_level === "Undergraduate").length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
            <CardContent>
              <Typography color="inherit" variant="body2" sx={{ mb: 1 }}>Postgraduate</Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>{programs.filter((p) => p?.academic_level === "Postgraduate").length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search + Actions */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
        <TextField
          placeholder="Search programs by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} /> }}
          sx={{ flex: 1 }}
          size="small"
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add New Program
        </Button>
        <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setOpenBulkDialog(true)}>
          Bulk Upload
        </Button>
         <Button variant="outlined" startIcon={<FileDownloadIcon/>} onClick={handleExportExcel}>
         {isLoading ? <CircularProgress size={20}/> : 'Download Excel/CSV'}
        </Button>
      </Box>

      {/* Table */}
      <ListPrograms
        programs={filteredPrograms}
        onEdit={handleOpenDialog}
        onDelete={setDeleteConfirm}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add/Edit Dialog */}
      <Manage
        open={openDialog}
        editingId={editingId}
        formData={formData}
        campuses={campuses}
        faculties={faculties}
        academicLevels={academicLevels}
        isLoading={isLoading}
        onClose={handleCloseDialog}
        onSave={handleSaveProgram}
        onFormChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
        onCampusChange={handleCampusChange}
      />

      {/* Bulk Upload Dialog */}
      <BulkUpload
        open={openBulkDialog}
        onClose={() => setOpenBulkDialog(false)}
        isUploading={isUploading}
        uploadProgress={bulkUploadProgress}
        result={bulkUploadResult}
        onUpload={handleBulkUpload}
        onResetResult={() => setBulkUploadResult(null)}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Program</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this program? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => deleteConfirm !== null && handleDeleteProgram(deleteConfirm)}
            variant="contained"
            color="error"
          >
            {isLoading ? 'deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default ProgramManagement