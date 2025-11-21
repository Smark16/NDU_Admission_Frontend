"use client"

import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Container,
  TextField,
  Select,
  MenuItem,
  TextareaAutosize,
  Button,
  Box,
  Grid,
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
import PersonIcon from "@mui/icons-material/Person"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import PublicIcon from "@mui/icons-material/Public"
import LocationCityIcon from "@mui/icons-material/LocationCity"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

import useAxios from "../../../AxiosInstance/UseAxios"
import useHook from "../../../Hooks/useHook"
import { AuthContext } from "../../../Context/AuthContext"

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
  study_mode: string
  programs: Programs[]
  date_of_birth: string
}

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: "white",
}))

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}))

export default function AdmitStudentPage() {
  const { id } = useParams()
  const {batch} = useHook()
  const {loggeduser} = useContext(AuthContext) || {}
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
  const [ApplicantError, setApplicantError] = useState<string[]>([])
  const [isAdmitted, setIsAdmitted] = useState(false)

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
      const response = await AxiosInstance.get(`/api/admissions/single_app/${id}`)
      setApplication(response.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getApplication()
    fetchCampus()
  }, [])


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
    if (!formData.student_id || !formData.program) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
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

    // 1. Last 2 digits of year → "25"
    const year = new Date().getFullYear().toString().slice(-2)

    // 2. Campus code
    const selectedCampusId = Number(formData.campus)
    const selectedCampus = campus.find(c => c.id === selectedCampusId)
    const campusNumber = selectedCampus?.name.includes("Kampala") ? "2" : "1"

    // 3. Faculty code from selected program
    const selectedProgram = application.programs.find(p => p.id === Number(formData.program))
    const facultyCode = selectedProgram?.faculty
      ? (typeof selectedProgram.faculty === "object" ? selectedProgram.faculty.code : selectedProgram.faculty)
      : "000"

    // 4. Study mode (first letter)
    const studyMode = (application.study_mode?.[0]?.toUpperCase()) || "D"

    // 5. Random 4-digit number: 0001 to 9999
    const randomNumber = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")

    // 6. Final Reg No
    const regNo = `${year}/${campusNumber}/${facultyCode}/${studyMode}/${randomNumber}`

    // Update form
    setFormData(prev => ({ ...prev, reg_no: regNo }))

    return regNo
  }

  const handleGeneratePayCode = () => {
    // Option 1: Random 10-digit number starting with 1 or 2
    const prefix = Math.random() < 0.5 ? "1" : "2"  // 50% chance of 1 or 2
    const random9Digits = String(Math.floor(Math.random() * 900000000) + 100000000) // 100000000 – 999999999
    const payCode = prefix + random9Digits  // e.g. "1" + "004567896" → "1004567896"

    // Update form (you'll need a field for pay_code)
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
        admitted_batch:batch?.id,
        reg_no: formData.reg_no,
        study_mode: application?.study_mode || "",
        application: application?.id || 0,
        is_admitted:true,
        admitted_by:loggeduser?.user_id
      }

      const response = await AxiosInstance.post('/api/admissions/create_admissions', payload)
      if(response.status === 201){
        setIsAdmitted(response.data.is_admitted)
      }
      setSnackbar({
        open: true,
        message: "Student admitted successfully!",
        type: "success",
      })
      setIsLoading(false)
      setOpenDialog(false)

    } catch (err:any) {
      if(err.response?.data.application){
        setApplicantError(err.response?.data.application)
      }
       setSnackbar({
        open: true,
        message: "Student admission failed!",
        type: "error",
      })
      setIsLoading(false)
    }
    setTimeout(() => {
      setFormData({ student_id: "", program: "", notes: "", reg_no: "", study_mode: "", campus: "" })
    }, 1000)
  }

  // send offer letter
  const handleSendLetter = async()=>{
    try{
      setIsLoading(true)
       const response = await AxiosInstance.post(`/api/offer_letter/send_letter/${application?.id}`)
       console.log(response.data)
       setIsLoading(false)
    }catch(err){
      console.log(err)
      setIsLoading(false)
    }
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

      {/* Applicant Information Section */}
      <StyledCard>
        <CardHeader
          avatar={<PersonIcon sx={{ color: "white" }} />}
          title="Applicant Information"
          titleTypographyProps={{ variant: "h6", sx: { fontWeight: 600 } }}
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            "& .MuiCardHeader-avatar": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              padding: "8px",
            },
          }}
        />
        <CardContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem>
                <IconWrapper>
                  <PersonIcon sx={{ fontSize: 20 }} />
                </IconWrapper>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {application?.first_name} {application?.last_name}
                  </Typography>
                </Box>
              </InfoItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem>
                <IconWrapper>
                  <EmailIcon sx={{ fontSize: 20 }} />
                </IconWrapper>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {application?.email}
                  </Typography>
                </Box>
              </InfoItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem>
                <IconWrapper>
                  <PhoneIcon sx={{ fontSize: 20 }} />
                </IconWrapper>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {application?.phone}
                  </Typography>
                </Box>
              </InfoItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem>
                <IconWrapper>
                  <CalendarTodayIcon sx={{ fontSize: 20 }} />
                </IconWrapper>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {application?.date_of_birth}
                  </Typography>
                </Box>
              </InfoItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem>
                <IconWrapper>
                  <PublicIcon sx={{ fontSize: 20 }} />
                </IconWrapper>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Nationality
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {application?.nationality}
                  </Typography>
                </Box>
              </InfoItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem>
                <IconWrapper>
                  <LocationCityIcon sx={{ fontSize: 20 }} />
                </IconWrapper>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Gender
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {application?.gender}
                  </Typography>
                </Box>
              </InfoItem>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>

      {/* Admit Form Section */}
      <StyledCard>
        <CardHeader
          avatar={<CheckCircleIcon sx={{ color: "white" }} />}
          title="Admission Details"
          titleTypographyProps={{ variant: "h6", sx: { fontWeight: 600 } }}
          sx={{
            backgroundColor: "#4caf50",
            color: "white",
            "& .MuiCardHeader-avatar": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              padding: "8px",
            },
          }}
        />
        <CardContent sx={{ pt: 3 }}>
          {/* Warning Alert */}
          <Alert severity="warning" sx={{ mb: 3 }} icon={null}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Important:
            </Typography>
            <Typography variant="body2">
              Please verify all information is correct before admitting the student. This action cannot be undone.
            </Typography>
          </Alert>

          {/* Form Fields */}
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
                  {index === 0 ? "📍 Primary Choice: " : `Choice ${index + 1}: `}
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
                  {application?.campus.id === c.id ? `📍 Primary Choice: ${c.name}` : `${index + 1}: ${c.name}`}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Select which campus to admit the student into. Batch will be automatically assigned based on the program
              selected.
            </Typography>
          </FormSection>

          {/* pay_code */}
          <FormSection>
            <Button
              variant="contained"
              size="small"
              onClick={handleGeneratePayCode}
              sx={{
                textTransform: "none",
                borderColor: "#1976d2",
              }}
            >
              Generate pay_code
            </Button>
            <TextField
              fullWidth
              label="Student Number"
              name="studentId"
              value={formData.student_id}
              onChange={handleInputChange}
              placeholder="Enter unique student ID"
              variant="outlined"
              inputProps={{ maxLength: 50 }}
              helperText="This will be the student's unique identification number"
              sx={{ mb: 2 }}
            />
          </FormSection>

          {/* reg_no */}
          <FormSection>
            <Button
              variant="contained"
              size="small"
              onClick={handleGenerateRegNo}
              sx={{
                textTransform: "none",
                borderColor: "#1976d2",
              }}
            >
              Generate reg_no
            </Button>
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

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", mt: 4 }}>
            {isAdmitted && (
                <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={handleSendLetter}
              sx={{ px: 2 }}
            >
              {isLoading ? 'sending letter....' : 'send offer letter to portal'}
            </Button>
            )}
             
             <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}>
            <Button variant="outlined" onClick={() => window.history.back()} sx={{ px: 3 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={handleSubmitClick}
              sx={{ px: 4 }}
            >
              Admit Student
            </Button>
          </Box>
          </Box>
          
        </CardContent>
      </StyledCard>

      {/* Confirmation Dialog */}
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
          <Button onClick={handleCancel} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmAdmit} variant="contained" color="success">
            {isLoading ? 'Confirming...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
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
