"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  TextField,
  Select,
  MenuItem,
  TextareaAutosize,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  type SelectChangeEvent,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

import useAxios from "../../../AxiosInstance/UseAxios"
import CustomButton from "../../../ReUsables/custombutton"

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
  },
}))

interface Campus {
  id: number
  name: string
}

interface Faculty {
  id: number
  name: string
  code: string | number
}

interface Program {
  id: number
  name: string
  code: string
  faculty: Faculty | string
}

interface Application {
  id: number
  first_name: string
  last_name: string
  phone: string
  nationality: string
  gender: string
  email: string
  campus: Campus
  study_mode: string
  programs: Program[]
  date_of_birth: string
}

interface AdmittedData {
  id: number
  student_id: string
  reg_no: string
  admission_notes: string
  admitted_program: Program
  admitted_campus: Campus
  application: number  // ← this is the application ID
}

export default function EditAdmittedStudentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const AxiosInstance = useAxios()

  const [application, setApplication] = useState<Application | null>(null)
  const [admittedData, setAdmittedData] = useState<AdmittedData | null>(null)
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Form state - pre-filled from backend
  const [formData, setFormData] = useState({
    student_id: "",
    reg_no: "",
    program: "",
    campus: "",
    study_mode: "",
    notes: "",
  })

  const [openDialog, setOpenDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  })

  // Fetch campuses
  const fetchCampuses = async () => {
    try {
      const response = await AxiosInstance.get('/api/accounts/list_campus')
      setCampuses(response.data)
    } catch (err) {
      console.log(err)
    }
  }

  // Step 1: Fetch admitted student data (contains application ID)
  const getAdmittedData = async () => {
    try {
      const response = await AxiosInstance.get(`/api/admissions/candidate_admission/${id}/`)
      const data = response.data
      setAdmittedData(data)

      // Pre-fill form with admitted data
      setFormData({
        student_id: data.student_id || "",
        reg_no: data.reg_no || "",
        program: data.admitted_program?.id?.toString() || "",
        campus: data.admitted_campus?.id?.toString() || "",
        study_mode: data.study_mode || "",
        notes: data.admission_notes || "",
      })
    } catch (err) {
      console.log(err)
      setSnackbar({
        open: true,
        message: "Failed to load admitted student data",
        type: "error",
      })
    }
  }

  const getApplication = async () => {
    if (!admittedData?.application) return

    try {
      const response = await AxiosInstance.get(`/api/admissions/single_app/${admittedData.application}`)
      setApplication(response.data)
    } catch (err) {
      console.log("Failed to fetch application:", err)
    }
  }

  // Run fetches in correct order
  useEffect(() => {
    fetchCampuses()
    getAdmittedData()
  }, [id])

  // Fetch application only after admittedData is available
  useEffect(() => {
    getApplication()
  }, [admittedData?.application]) 

  console.log('admittedData', admittedData)
  console.log('application ID from admitted', admittedData?.application)
  console.log('full application object', application)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (event: SelectChangeEvent<string | number>) => {
    const { name, value } = event.target
    if (!name) return
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitClick = () => {
    if (!formData.student_id.trim() || !formData.reg_no.trim()) {
      setSnackbar({
        open: true,
        message: "Student ID and Registration Number are required",
        type: "error",
      })
      return
    }
    setOpenDialog(true)
  }

  const handleCancel = () => {
    setOpenDialog(false)
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleGenerateRegNo = () => {
    if (!application) return

    const year = new Date().getFullYear().toString().slice(-2)
    const selectedCampusId = Number(formData.campus)
    const selectedCampus = campuses.find(c => c.id === selectedCampusId)
    const campusNumber = selectedCampus?.name.includes("Kampala") ? "2" : "1"
    const selectedProgramCode = application.programs.find(p => p.id === Number(formData.program))?.code
    const studyMode = (application.study_mode?.[0]?.toUpperCase()) || "D"
    const randomNumber = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")
    const regNo = `${year}/${campusNumber}/${selectedProgramCode}/${studyMode}/${randomNumber}`

    setFormData(prev => ({ ...prev, reg_no: regNo }))
  }

  const handleGeneratePayCode = () => {
    const prefix = Math.random() < 0.5 ? "1" : "2"
    const random9Digits = String(Math.floor(Math.random() * 900000000) + 100000000)
    const payCode = prefix + random9Digits
    setFormData(prev => ({ ...prev, student_id: payCode }))
  }

  const handleConfirmAdmit = async () => {
    try {
      setIsLoading(true)

      const payload = {
        student_id: formData.student_id.trim(),
        reg_no: formData.reg_no.trim(),
        admitted_campus: formData.campus,
        admitted_program: formData.program,
        admission_notes: formData.notes.trim(),
        study_mode: formData.study_mode || application?.study_mode || "",
      }

      await AxiosInstance.patch(`/api/admissions/update_admission/${id}/`, payload)

      setSnackbar({
        open: true,
        message: "Student record updated successfully!",
        type: "success",
      })

      setTimeout(() => {
        navigate(-1)
      }, 1500)
    } catch (err: any) {
      let errorMessage = "Update failed!"

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.response?.data?.non_field_errors) {
        errorMessage = err.response.data.non_field_errors[0]
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        type: "error",
      })
    } finally {
      setIsLoading(false)
      setOpenDialog(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header - unchanged */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => window.history.back()} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Update Admitted Student
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Application #{application?.id || "Loading..."}
        </Typography>
      </Box>

      {/* Form Card - UI kept exactly as original */}
      <StyledCard>
        <CardHeader
          avatar={<CheckCircleIcon sx={{ color: "white" }} />}
          title="Admission Details"
          titleTypographyProps={{ variant: "h6", sx: { fontWeight: 600 } }}
          sx={{
            backgroundColor: "#958fd6ff",
            color: "white",
            "& .MuiCardHeader-avatar": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              padding: "8px",
            },
          }}
        />
        <CardContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }} icon={null}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Important:
            </Typography>
            <Typography variant="body2">
              Please verify all information is correct before updating. Changes will be permanent.
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Select
              fullWidth
              name="program"
              value={formData.program}
              onChange={handleSelectChange}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="" disabled>
                Select Program
              </MenuItem>
              {application?.programs?.map((program, index) => (
                <MenuItem key={program.id} value={program.id}>
                  {index === 0 ? "Primary Choice: " : `Choice ${index + 1}: `}
                  {program.name} ({program.code})
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Select which program to assign to this student.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Select
              fullWidth
              name="campus"
              value={formData.campus}
              onChange={handleSelectChange}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="" disabled>
                Select Campus
              </MenuItem>
              {campuses.map((c, _index) => (
                <MenuItem key={c.id} value={c.id}>
                  {admittedData?.admitted_campus?.id === c.id ? `Current: ${c.name}` : c.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Select campus for this student.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <CustomButton onClick={handleGeneratePayCode} text="Generate pay_code" />
            <TextField
              fullWidth
              label="Student Number"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              placeholder="Enter unique student ID"
              variant="outlined"
              inputProps={{ maxLength: 50 }}
              helperText="This will be the student's unique identification number"
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <CustomButton onClick={handleGenerateRegNo} text="Generate reg_no" />
            <TextField
              fullWidth
              label="Reg No"
              name="reg_no"
              value={formData.reg_no}
              onChange={handleInputChange}
              placeholder="Enter unique student Reg_no"
              variant="outlined"
              inputProps={{ maxLength: 50 }}
              helperText="This will be the student's unique identification number"
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Admission Notes (Optional)
            </Typography>
            <TextareaAutosize
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Optional notes about this admission (e.g., special considerations, scholarship information, etc.)"
              minRows={4}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontFamily: "inherit",
                fontSize: "14px",
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", mt: 4 }}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", width: "100%" }}>
              <CustomButton
                variant="outlined"
                onClick={() => window.history.back()}
                sx={{ borderColor: "#7c1519", color: "#7c1519" }}
                text="Cancel"
              />
              <CustomButton
                icon={<CheckCircleIcon />}
                onClick={handleSubmitClick}
                text="Update Student"
              />
            </Box>
          </Box>
        </CardContent>
      </StyledCard>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Update</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 2 }}>
            Are you sure you want to update admission details for{" "}
            <strong>{application?.first_name} {application?.last_name}</strong>
            <br /><br />
            This will overwrite existing data.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton
            onClick={handleCancel}
            variant="outlined"
            sx={{ borderColor: "#7c1519", color: "#7c1519" }}
            text="Cancel"
          />
          <CustomButton
            onClick={handleConfirmAdmit}
            text={isLoading ? 'Updating...' : 'Confirm Update'}
          />
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.type as any}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}