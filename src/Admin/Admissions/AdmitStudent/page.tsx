"use client"

import { useContext, useEffect, useState } from "react"
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
  CircularProgress,
  LinearProgress,
  Backdrop,
  FormControl,
  InputLabel, 
} from "@mui/material"
import { styled } from "@mui/material/styles"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

import useAxios from "../../../AxiosInstance/UseAxios"
import useHook from "../../../Hooks/useHook"
import { AuthContext } from "../../../Context/AuthContext"
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
  id: number;
  name: string;
  code: string | number
}
interface Programs {
  id: number;
  name: string
  code: string
  faculty: Faculty | string
}

interface Application {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  nationality: string;
  gender: string;
  email: string;
  campus: Campus
  programs: Programs[]
  date_of_birth: string
}

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}))

export default function AdmitStudentPage() {
  const { id } = useParams()
  const {admissionBatch} = useHook()
  const navigate = useNavigate()
  const { loggeduser} = useContext(AuthContext) || {}
  const AxiosInstance = useAxios()
  const [application, setApplication] = useState<Application | null>(null)
  const [campus, setCampus] = useState<Campus[]>([])
  const [formData, setFormData] = useState({
    student_id: "",
    program: "",
    campus: "",
    study_mode: "",
    reg_no: "",
    notes: "",
  })

  const [openDialog, setOpenDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loadApplication, setLoadApplication] = useState(false)
  const [isAdmitted, setIsAdmitted] = useState(false)

  // ← ONLY THESE 3 LINES ADDED FOR PROGRESS
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [showProgress, setShowProgress] = useState(false)

  // fetch campus
  const fetchCampus = async () => {
    try {
      const response = await AxiosInstance.get('/api/accounts/list_campus')
      setCampus(response.data)
    } catch (err) {
      console.log(err)
    }
  }

  // fetch application
  const getApplication = async () => {
    try {
      setLoadApplication(true)
      const response = await AxiosInstance.get(`/api/admissions/single_app/${id}`)
      setApplication(response.data)
    } catch (err) {
      console.log(err)
    }finally{
      setLoadApplication(false)
    }
  }

  useEffect(() => {
    getApplication()
    fetchCampus()
  }, [])

  // ← UPDATED: Now with auto-navigate on success
  useEffect(() => {
    if (!showProgress || !id) return

    const interval = setInterval(async () => {
      try {
        const res = await AxiosInstance.get(`/api/offer_letter/status/${id}`)
        setProgress(res.data.progress)
        setStatus(res.data.status)

        if (res.data.progress === 100 || res.data.status === "email_sent") {
          clearInterval(interval)
          setTimeout(() => {
            setShowProgress(false)
            navigate('/admin/application_list') 
          }, 1500)
        }

        if (res.data.status === "failed") {
          clearInterval(interval)
          setShowProgress(false)
        }
      } catch (err) {
        console.log("Polling error:", err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [showProgress, id, AxiosInstance, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleChange = (event: SelectChangeEvent<string | number>) => {
    const { name, value } = event.target;
    if (!name) return;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitClick = () => {
    if (!formData.student_id || !formData.program || !formData.campus || !formData.study_mode || !formData.reg_no) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields: program, campus, study mode, student number, and reg number",
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
    const selectedCampus = campus.find(c => c.id === selectedCampusId)
    const campusNumber = selectedCampus?.name.includes("Kampala") ? "2" : "1"
    const selectedProgramCode = application.programs.find(p => p.id === Number(formData.program))?.code
    const studyMode = (formData?.study_mode)
    const randomNumber = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")
    const regNo = `${year}/${campusNumber}/${selectedProgramCode}/${studyMode}/${randomNumber}`

    setFormData(prev => ({ ...prev, reg_no: regNo }))
    return regNo
  }

  const handleGeneratePayCode = () => {
    const prefix = Math.random() < 0.5 ? "1" : "2"  
    const random9Digits = String(Math.floor(Math.random() * 900000000) + 100000000) 
    const payCode = prefix + random9Digits  
    setFormData(prev => ({ ...prev, student_id: payCode }))
  }

  const handleConfirmAdmit = async () => {
    try {
      setOpenDialog(true)
      setIsLoading(true)

      const payload = {
        student_id: formData.student_id,
        admitted_campus: formData.campus,
        admitted_program: formData.program,
        admission_notes: formData.notes,
        admitted_batch: admissionBatch?.id,
        reg_no: formData.reg_no,
        study_mode: formData?.study_mode || "",
        application: application?.id || 0,
        is_admitted: true,
        admitted_by: loggeduser?.user_id
      }

      const response = await AxiosInstance.post('/api/admissions/create_admissions', payload)
      if (response.status === 201) {
        setIsAdmitted(response.data.is_admitted)
      }
      setSnackbar({
        open: true,
        message: "Student admitted successfully!",
        type: "success",
      })
      setIsLoading(false)
      setOpenDialog(false)

    } catch (err: any) {
      if (err.response?.data.application) {
        setSnackbar({
        open: true,
        message: `${err.response?.data.application}`,
        type: "error",
      })
      }else if(err.response?.data.detail){
        setSnackbar({
        open: true,
        message: `${err.response?.data.detail}`,
        type: "error",
      })
      }else{
        setSnackbar({
          open: true,
          message: "Student admission failed!",
          type: "error",
        })
      }
      setIsLoading(false)
    }
    setTimeout(() => {
      setFormData({ student_id: "", program: "", notes: "", reg_no: "", study_mode: "", campus: "" })
    }, 1000)
  }

  const handleSendLetter = async () => {
    try {
      setIsLoading(true)
      setShowProgress(true)
      setProgress(0)
      setStatus("")

      const response = await AxiosInstance.post(`/api/offer_letter/send_letter/${application?.id}`)
      console.log(response.data)
      setIsLoading(false)
       setSnackbar({
        open: true,
        message: `${response.data?.detail}`,
        type: "success",
      })

    } catch (err:any) {
      setShowProgress(false)
      console.log(err)
      if(err.response?.data.detail){
         setSnackbar({
        open: true,
        message: `${err.response?.data.detail}`,
        type: "error",
      })
      }else{
        setSnackbar({
         open: true,
         message: "Failed to send offer letter to student",
         type: "error",
       })
      }
      setIsLoading(false)
    }
  }

  if(loadApplication){
    return ( 
      <Box
        sx={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={30} thickness={4} sx={{ color: "#7c1519" }} />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => window.history.back()} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Admit Student
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Application #{application?.id}
        </Typography>
      </Box>

      {/* ← REPLACED YOUR OLD BOX WITH THIS BEAUTIFUL MODAL */}
      <Backdrop open={showProgress} sx={{ zIndex: 9999, bgcolor: "rgba(0,0,0,0.85)" }}>
        <Box
          sx={{
            bgcolor: "white",
            p: 6,
            borderRadius: 5,
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            textAlign: "center",
            minWidth: 440,
            maxWidth: 500,
          }}
        >
          <CircularProgress
            variant="determinate"
            value={progress}
            size={130}
            thickness={6}
            sx={{ color: progress === 100 ? "#4caf50" : "#3e397b" }}
          />
          <Typography variant="h5" sx={{ mt: 4, fontWeight: 700, color: "#1a1a1a" }}>
            Generating Offer Letter
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, color: "#444", minHeight: 60 }}>
            {status === "converting_pdf" && "Converting to PDF..."}
            {status === "email_sent" && "Offer Letter Sent Successfully!"}
            {status === "failed" && "Generation Failed"}
            {(!status || status === "docx_generated") && "Preparing your document..."}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 4,
              height: 16,
              borderRadius: 8,
              bgcolor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                bgcolor: progress === 100 ? "#4caf50" : "#3e397b",
              },
            }}
          />
          <Typography variant="h3" sx={{ mt: 3, fontWeight: 900, color: progress === 100 ? "#4caf50" : "#3e397b" }}>
            {progress}%
          </Typography>
        </Box>
      </Backdrop>

      {/* Admit Form Section */}
      <StyledCard>
        <CardHeader
          avatar={<CheckCircleIcon sx={{ color: "white" }} />}
          title={`Admission Details for ${application?.first_name} ${application?.last_name} (${application?.phone})`}
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
          <FormSection>
            <Select
              fullWidth
              name="program"
              value={formData.program}
              onChange={handleChange}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="" disabled>
                Select Program
              </MenuItem>
              {application?.programs.map((program, index) => (
                <MenuItem key={program.id} value={program.id}>
                  {index === 0 ? "Primary Choice: " : `Choice ${index + 1}: `}
                  {program.name} ({program.code})
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Select which program to admit the student into. Batch will be automatically assigned based on the program
              selected.
            </Typography>
          </FormSection>

          <FormSection>
            <Select
              fullWidth
              name="campus"
              value={formData.campus}
              onChange={handleChange}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value='' disabled>
                Select Campus
              </MenuItem>
              {campus.map((c, index) => (
                <MenuItem key={c.id} value={c.id}>
                  {application?.campus.id === c.id ? `Primary Choice: ${c.name}` : `${index + 1}: ${c.name}`}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Select which campus to admit the student into. Batch will be automatically assigned based on the program
              selected.
            </Typography>
          </FormSection>

           {/* Study Mode */}
          <Box>
            <FormControl fullWidth required>
              <InputLabel>Study Mode</InputLabel>
              <Select
                name="study_mode"
                value={formData.study_mode}
                onChange={handleChange}
                label="Study Mode"
              >
                <MenuItem value="W">Weekend</MenuItem>
                <MenuItem value="D">Day</MenuItem>
                <MenuItem value="DL">Distance Learning</MenuItem>
                <MenuItem value="DJ">Day January</MenuItem>
                <MenuItem value="WJ">Weekend January</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#666" }}>
              Select your preferred study mode
            </Typography>
          </Box>

          <FormSection>
            <CustomButton onClick={handleGeneratePayCode} text=" Generate pay_code"/>
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
          </FormSection>

          <FormSection>
            <CustomButton onClick={handleGenerateRegNo} text="Generate reg_no"/>
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
          </FormSection>

          <FormSection>
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
          </FormSection>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", mt: 4 }}>
            {isAdmitted && (
              <CustomButton 
              icon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                onClick={handleSendLetter}
                text={showProgress ? "Generating Letter..." : isLoading ? "Sending..." : "Send Offer Letter to Portal"}
                />
            )}

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}>
              <CustomButton variant="outlined" onClick={() => window.history.back()} sx={{borderColor:"#7c1519", color:"#7c1519"}} text="Cancel"/>
                <CustomButton icon={<CheckCircleIcon />} onClick={handleSubmitClick} text="Admit Student"/>
            </Box>
          </Box>

        </CardContent>
      </StyledCard>

      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Admission</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 2 }}>
            Are you sure you want to admit <strong>{application?.first_name} {application?.last_name}</strong> to{" "}
            <strong>{application?.programs.find((p) => p.id === Number.parseInt(formData.program))?.name}</strong>? This action
            cannot be reversed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton onClick={handleCancel} variant="outlined" sx={{borderColor:"#7c1519", color:"#7c1519"}} text="Cancel"/>
          <CustomButton onClick={handleConfirmAdmit} text={isLoading ? 'Confirming...' : 'Confirm'}/>
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
          severity={snackbar.type as "success" | "error" | "info" | "warning"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}