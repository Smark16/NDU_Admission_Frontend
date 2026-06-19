"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  TextField,
  TextareaAutosize,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

import useAxios from "../../../AxiosInstance/UseAxios"
import CustomButton from "../../../ReUsables/custombutton"
import useHook from "../../../Hooks/useHook"

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
  campuses?: Campus[]
}

interface ProgramBatchOption {
  id: number
  name: string
  start_date: string | null
  academic_year: string
  is_active: boolean
}

interface ProgramBatchesOptionsResponse {
  batches: ProgramBatchOption[]
  default_program_batch_id: number | null
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
  study_mode: string
  admission_notes: string
  admitted_program: Program
  admitted_campus: Campus
  application: number
  intended_program_batch?: {
    id: number
    name: string
    academic_year?: string
    start_date?: string | null
  } | null
}

function programOfferedAtCampus(
  program: Program,
  campusId: number,
  applicationCampusId?: number
): boolean {
  const offered = program.campuses
  if (!offered?.length) {
    return applicationCampusId != null ? campusId === applicationCampusId : false
  }
  return offered.some((c) => c.id === campusId)
}

function programsForCampus(
  programs: Program[],
  campusId: number,
  applicationCampusId?: number
): Program[] {
  return programs.filter((p) => programOfferedAtCampus(p, campusId, applicationCampusId))
}

function resolveCampusForProgram(
  program: Program,
  currentCampusId: string,
  applicationCampus?: Campus
): string {
  const offered = program.campuses ?? []
  if (!offered.length) {
    return applicationCampus ? String(applicationCampus.id) : currentCampusId
  }
  if (offered.length === 1) {
    return String(offered[0].id)
  }
  const currentNum = currentCampusId ? Number(currentCampusId) : null
  if (currentNum && offered.some((c) => c.id === currentNum)) {
    return currentCampusId
  }
  if (applicationCampus && offered.some((c) => c.id === applicationCampus.id)) {
    return String(applicationCampus.id)
  }
  return String(offered[0].id)
}

export default function EditAdmittedStudentPage() {
  const { id } = useParams()
  const { admissionBatch } = useHook()
  const navigate = useNavigate()
  const AxiosInstance = useAxios()

  const [application, setApplication] = useState<Application | null>(null)
  const [admittedData, setAdmittedData] = useState<AdmittedData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadApplication, setLoadApplication] = useState(false)
  const [isGeneratingRegNo, setIsGeneratingRegNo] = useState(false)

  const [formData, setFormData] = useState({
    student_id: "",
    reg_no: "",
    program: "",
    campus: "",
    study_mode: "",
    notes: "",
    intended_program_batch: "",
  })

  const [programBatchOptions, setProgramBatchOptions] = useState<ProgramBatchOption[]>([])
  const [loadingProgramBatches, setLoadingProgramBatches] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  })

  const applicationPrograms = useMemo(() => {
    if (!application?.programs?.length) return []
    return Array.isArray(application.programs) ? application.programs : []
  }, [application])

  const applicationCampusId = application?.campus?.id

  const eligibleCampuses = useMemo(() => {
    const byId = new Map<number, Campus>()
    for (const program of applicationPrograms) {
      for (const campus of program.campuses ?? []) {
        byId.set(campus.id, campus)
      }
    }
    if (byId.size === 0 && application?.campus?.id) {
      byId.set(application.campus.id, application.campus)
    }
    if (admittedData?.admitted_campus?.id) {
      byId.set(admittedData.admitted_campus.id, admittedData.admitted_campus)
    }
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [application, applicationPrograms, admittedData?.admitted_campus])

  const selectedCampusName = useMemo(() => {
    const id = formData.campus ? Number(formData.campus) : null
    if (!id) return ""
    return eligibleCampuses.find((c) => c.id === id)?.name ?? ""
  }, [formData.campus, eligibleCampuses])

  const singleCampusChoice = eligibleCampuses.length <= 1
  const singleProgramChoice = applicationPrograms.length <= 1

  const getAdmittedData = async () => {
    try {
      const response = await AxiosInstance.get(`/api/admissions/candidate_admission/${id}/`)
      const data = response.data
      setAdmittedData(data)

      setFormData({
        student_id: data.student_id || "",
        reg_no: data.reg_no || "",
        program: data.admitted_program?.id?.toString() || "",
        campus: data.admitted_campus?.id?.toString() || "",
        study_mode: data.study_mode || "",
        notes: data.admission_notes || "",
        intended_program_batch: data.intended_program_batch?.id
          ? String(data.intended_program_batch.id)
          : "",
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
      setLoadApplication(true)
      const response = await AxiosInstance.get(`/api/admissions/single_app/${admittedData.application}`)
      const app = response.data
      let programs = app.programs
      if (!Array.isArray(programs)) programs = []
      setApplication({ ...app, programs })
    } catch (err) {
      console.log("Failed to fetch application:", err)
    } finally {
      setLoadApplication(false)
    }
  }

  useEffect(() => {
    getAdmittedData()
  }, [id])

  useEffect(() => {
    getApplication()
  }, [admittedData?.application])

  useEffect(() => {
    if (!application?.id || !formData.program) return
    const program = applicationPrograms.find((p) => String(p.id) === formData.program)
    if (!program) return
    setFormData((prev) => {
      const campus = resolveCampusForProgram(program, prev.campus, application.campus)
      if (campus === prev.campus) return prev
      return { ...prev, campus }
    })
  }, [application?.id, applicationPrograms])

  const programIdForBatches = formData.program

  useEffect(() => {
    if (!programIdForBatches) {
      setProgramBatchOptions([])
      return
    }
    let cancelled = false
    setLoadingProgramBatches(true)
    const appId = admittedData?.application
    const batchQs = appId ? `?application_id=${appId}` : ""
    AxiosInstance.get<ProgramBatchesOptionsResponse | ProgramBatchOption[]>(
      `/api/admissions/program_batches_options/${programIdForBatches}${batchQs}`
    )
      .then((res) => {
        if (cancelled) return
        const raw = res.data
        const batches = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as ProgramBatchesOptionsResponse)?.batches)
            ? (raw as ProgramBatchesOptionsResponse).batches
            : []
        const defaultId = Array.isArray(raw)
          ? null
          : (raw as ProgramBatchesOptionsResponse)?.default_program_batch_id ?? null
        setProgramBatchOptions(batches)
        setFormData((prev) => {
          if (prev.program !== programIdForBatches) return prev
          if (prev.intended_program_batch) return prev
          if (defaultId != null) return { ...prev, intended_program_batch: String(defaultId) }
          return prev
        })
      })
      .catch(() => {
        if (!cancelled) setProgramBatchOptions([])
      })
      .finally(() => {
        if (!cancelled) setLoadingProgramBatches(false)
      })
    return () => {
      cancelled = true
    }
  }, [programIdForBatches, admittedData?.application, AxiosInstance])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = useCallback(
    (event: SelectChangeEvent<string | number>) => {
      const { name, value } = event.target
      if (!name) return
      const strVal = value === "" || value === undefined ? "" : String(value)

      if (name === "campus") {
        setFormData((prev) => {
          const campusId = Number(strVal)
          const validPrograms = programsForCampus(
            applicationPrograms,
            campusId,
            application?.campus?.id
          )
          const stillValid = validPrograms.some((p) => String(p.id) === prev.program)
          return {
            ...prev,
            campus: strVal,
            program: stillValid
              ? prev.program
              : validPrograms[0]
                ? String(validPrograms[0].id)
                : "",
            intended_program_batch: stillValid ? prev.intended_program_batch : "",
          }
        })
        return
      }

      if (name === "program") {
        setFormData((prev) => {
          const program = applicationPrograms.find((p) => String(p.id) === strVal)
          const campus = program
            ? resolveCampusForProgram(program, prev.campus, application?.campus)
            : prev.campus
          return {
            ...prev,
            program: strVal,
            campus,
            intended_program_batch: "",
          }
        })
        return
      }

      setFormData((prev) => ({
        ...prev,
        [name]: name === "study_mode" || name === "intended_program_batch" ? strVal : value,
      }))
    },
    [applicationPrograms, application?.campus]
  )

  const handleSubmitClick = () => {
    if (!formData.student_id.trim() || !formData.reg_no.trim()) {
      setSnackbar({
        open: true,
        message: "Student ID and Registration Number are required",
        type: "error",
      })
      return
    }
    if (!formData.campus || !formData.program) {
      setSnackbar({
        open: true,
        message: "Select a valid campus and programme from the applicant's choices.",
        type: "error",
      })
      return
    }
    const campusId = Number(formData.campus)
    const program = applicationPrograms.find((p) => String(p.id) === formData.program)
    if (program && !programOfferedAtCampus(program, campusId, applicationCampusId)) {
      setSnackbar({
        open: true,
        message: "Selected programme is not offered at the chosen campus.",
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

  const handleGenerateRegNo = async () => {
    if (!application) return

    setIsGeneratingRegNo(true)
    try {
      const res = await AxiosInstance.post("/api/admissions/generate-reg-no/", {
        campus: formData.campus ? Number(formData.campus) : formData.campus,
        program: formData.program ? Number(formData.program) : formData.program,
        batch: admissionBatch?.id,
        study_mode: formData.study_mode,
      })

      const regNo = res.data.reg_no
      setFormData((prev) => ({ ...prev, reg_no: regNo }))
      return regNo
    } catch (err: any) {
      console.error("Failed to generate reg no", err)
      if (err.response?.data?.error) {
        setSnackbar({
          open: true,
          message: `${err.response?.data.error}`,
          type: "error",
        })
      }
    } finally {
      setIsGeneratingRegNo(false)
    }
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
        study_mode: formData.study_mode,
        intended_program_batch: formData.intended_program_batch
          ? Number(formData.intended_program_batch)
          : null,
      }

      await AxiosInstance.patch(`/api/admissions/update_admission/${id}/`, payload)

      setSnackbar({
        open: true,
        message: "Student record updated successfully!",
        type: "success",
      })

      setTimeout(() => {
        navigate("/admin/admited_students")
      }, 1500)
    } catch (err: any) {
      let errorMessage = "Update failed!"

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.response?.data?.non_field_errors) {
        errorMessage = err.response.data.non_field_errors[0]
      } else if (err.response?.data?.admitted_campus) {
        errorMessage = err.response.data.admitted_campus[0]
      } else if (err.response?.data?.admitted_program) {
        errorMessage = err.response.data.admitted_program[0]
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

  if (loadApplication) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={30} thickness={4} sx={{ color: "#7c1519" }} />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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

          <Alert severity="info" sx={{ mb: 3 }}>
            Campus and programme must stay aligned. You can change either one here, but only combinations
            from this applicant&apos;s programme choices are allowed.
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Campus
            </Typography>
            {eligibleCampuses.length === 0 && applicationPrograms.length ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No campus is linked to this applicant&apos;s programme choices. Fix the application first.
              </Alert>
            ) : null}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="edit-campus-label">Campus</InputLabel>
              <Select
                labelId="edit-campus-label"
                label="Campus"
                name="campus"
                value={formData.campus}
                onChange={handleSelectChange}
                disabled={!eligibleCampuses.length}
              >
                <MenuItem value="" disabled>
                  Select campus
                </MenuItem>
                {eligibleCampuses.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                    {application?.campus?.id === c.id ? " (application campus)" : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              {singleCampusChoice
                ? "Only one campus applies for this applicant's choices."
                : "Pick a campus, or change programme below and campus will follow."}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Programme
            </Typography>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="edit-program-label">Programme</InputLabel>
              <Select
                labelId="edit-program-label"
                label="Programme"
                name="program"
                value={formData.program}
                onChange={handleSelectChange}
                disabled={!applicationPrograms.length}
              >
                <MenuItem value="" disabled>
                  Select programme
                </MenuItem>
                {applicationPrograms.map((program, index) => (
                  <MenuItem key={program.id} value={String(program.id)}>
                    {index === 0 ? "Primary choice: " : `Choice ${index + 1}: `}
                    {program.name} ({program.code})
                    {program.campuses?.length
                      ? ` — ${program.campuses.map((c) => c.name).join(", ")}`
                      : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              {singleProgramChoice
                ? "Only one programme on this application."
                : selectedCampusName
                  ? `All applicant choices shown. Current campus: ${selectedCampusName} — campus updates when you pick a programme at another location.`
                  : "All programme choices from the application. Campus updates automatically when needed."}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth variant="outlined" disabled={!formData.program || loadingProgramBatches}>
              <InputLabel id="edit-intended-batch-label">Academic programme batch</InputLabel>
              <Select
                labelId="edit-intended-batch-label"
                label="Academic programme batch"
                name="intended_program_batch"
                value={formData.intended_program_batch}
                onChange={handleSelectChange}
              >
                <MenuItem value="">
                  <em>Use system default (auto cohort)</em>
                </MenuItem>
                {programBatchOptions.map((b) => (
                  <MenuItem key={b.id} value={String(b.id)}>
                    {b.name}
                    {b.academic_year ? ` (${b.academic_year})` : ""}
                    {b.start_date ? ` — starts ${b.start_date}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Cohort for curriculum and fees. Changing this updates placement when an academic enrollment record exists.
            </Typography>
          </Box>

          <Box>
            <FormControl fullWidth required>
              <InputLabel>Study Mode</InputLabel>
              <Select
                name="study_mode"
                value={formData.study_mode}
                onChange={handleSelectChange}
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

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Student identifiers
            </Typography>
            <TextField
              fullWidth
              label="Student / pay number"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              variant="outlined"
              inputProps={{ maxLength: 50 }}
              helperText="Assigned at admission. Edit only to correct a typo."
              sx={{ mb: 2 }}
            />
            <CustomButton
              onClick={handleGenerateRegNo}
              text={isGeneratingRegNo ? "Generating..." : "Generate new reg no"}
            />
            <TextField
              fullWidth
              label="Registration number"
              name="reg_no"
              value={formData.reg_no}
              onChange={handleInputChange}
              variant="outlined"
              inputProps={{ maxLength: 50 }}
              helperText="Uses campus, programme, and study mode above when you generate."
              sx={{ mb: 2, mt: 1 }}
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
              <CustomButton icon={<CheckCircleIcon />} onClick={handleSubmitClick} text="Update Student" />
            </Box>
          </Box>
        </CardContent>
      </StyledCard>

      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Update</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 2 }}>
            Are you sure you want to update admission details for{" "}
            <strong>
              {application?.first_name} {application?.last_name}
            </strong>
            <br />
            <br />
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
          <CustomButton onClick={handleConfirmAdmit} text={isLoading ? "Updating..." : "Confirm Update"} />
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
