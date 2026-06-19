"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  TextField,
  Autocomplete,
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

function extractUpdateError(err: any): string {
  const data = err?.response?.data
  if (!data) return "Update failed!"
  if (typeof data.detail === "string") return data.detail
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors[0]
  }
  for (const key of [
    "admitted_program",
    "admitted_campus",
    "intended_program_batch",
    "student_id",
    "reg_no",
  ]) {
    const val = data[key]
    if (Array.isArray(val) && val.length) return String(val[0])
    if (typeof val === "string") return val
  }
  return "Update failed!"
}

export default function EditAdmittedStudentPage() {
  const { id } = useParams()
  const { admissionBatch } = useHook()
  const navigate = useNavigate()
  const AxiosInstance = useAxios()

  const [application, setApplication] = useState<Application | null>(null)
  const [admittedData, setAdmittedData] = useState<AdmittedData | null>(null)
  const [campuses, setCampuses] = useState<Campus[]>([])
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

  const fetchCampuses = async () => {
    try {
      const response = await AxiosInstance.get("/api/accounts/list_campus")
      setCampuses(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.log(err)
    }
  }

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
      setApplication(response.data)
    } catch (err) {
      console.log("Failed to fetch application:", err)
    } finally {
      setLoadApplication(false)
    }
  }

  useEffect(() => {
    fetchCampuses()
    getAdmittedData()
  }, [id])

  useEffect(() => {
    getApplication()
  }, [admittedData?.application])

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
          const batchIds = new Set(batches.map((b) => String(b.id)))
          if (prev.intended_program_batch && !batchIds.has(prev.intended_program_batch)) {
            return {
              ...prev,
              intended_program_batch: defaultId != null ? String(defaultId) : "",
            }
          }
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

  const handleSelectChange = (event: SelectChangeEvent<string | number>) => {
    const { name, value } = event.target
    if (!name) return
    const strVal = value === "" || value === undefined ? "" : String(value)
    setFormData((prev) => ({
      ...prev,
      [name]: name === "campus" || name === "study_mode" || name === "intended_program_batch" ? strVal : value,
    }))
  }

  const handleProgramChange = (_event: React.SyntheticEvent, value: Program | null) => {
    setFormData((prev) => ({
      ...prev,
      program: value ? String(value.id) : "",
      intended_program_batch: "",
    }))
  }

  const programOptions = useMemo(() => {
    const batchPrograms = admissionBatch?.programs || []
    const admitted = admittedData?.admitted_program
    if (!admitted?.id) return batchPrograms
    if (batchPrograms.some((p: Program) => p.id === admitted.id)) return batchPrograms
    return [admitted, ...batchPrograms]
  }, [admissionBatch?.programs, admittedData?.admitted_program])

  const selectedProgram = useMemo(() => {
    if (!formData.program) return null
    return programOptions.find((p: Program) => p.id === Number(formData.program)) ?? null
  }, [formData.program, programOptions])

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
        admitted_campus: Number(formData.campus),
        admitted_program: Number(formData.program),
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
      setSnackbar({
        open: true,
        message: extractUpdateError(err),
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

          <Box sx={{ mb: 3 }}>
            <Autocomplete
              options={programOptions}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={selectedProgram}
              onChange={handleProgramChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assigned Program"
                  placeholder="Search and select program from active batch"
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.code} • Faculty:{" "}
                      {typeof option.faculty === "string"
                        ? option.faculty
                        : option.faculty?.name || "N/A"}
                    </Typography>
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              noOptionsText="No programs available in this batch"
              fullWidth
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Search for any program available in the current active batch/intake
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
              {campuses.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {admittedData?.admitted_campus?.id === c.id ? `Current: ${c.name}` : c.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Select campus for this student.
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
            <CustomButton
              onClick={handleGenerateRegNo}
              text={isGeneratingRegNo ? "Generating..." : "Generate reg_no"}
            />
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
