"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Button,
  Checkbox,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  alpha,
  Divider,
} from "@mui/material"
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  HourglassEmpty as PendingIcon,
  AccountTree as SpecIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

interface AvailableCourse {
  id: number
  code: string
  name: string
  credit_units: number | null
  semester: {
    id: number | null
    name: string | null
  }
  program_batch: {
    id: number | null
    name: string | null
  }
  lecturers: Array<{ id: number; name: string }>
}

interface EligibilityStatus {
  is_eligible: boolean
  percentage_paid: number
  minimum_required: number
  total_required: number
  total_paid: number
  balance: number
  message: string
  display_currency?: string
  tuition_check_skipped?: boolean
  has_programme_enrollment?: boolean
  programme_enrollment_status?: string
  programme_enrollment_status_display?: string
  is_programme_enrolled?: boolean
  programme_name?: string | null
  programme_batch?: string | null
  current_year_of_study?: number | null
  current_term_number?: number | null
}

// Specialization state returned when the API blocks with requires_specialization
interface SpecializationRequired {
  available: string[]
}

export default function CourseRegistration() {
  const AxiosInstance = useAxios()
  const [loading, setLoading] = useState(true)
  const [eligibilityLoading, setEligibilityLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([])
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null)
  const [confirmDialog, setConfirmDialog] = useState(false)

  // Specialization selection state
  const [specializationRequired, setSpecializationRequired] = useState<SpecializationRequired | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null)
  const [savingSpec, setSavingSpec] = useState(false)
  const [specSaveError, setSpecSaveError] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableCourses()
    checkEligibility()
  }, [])

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      setSpecializationRequired(null)
      const response = await AxiosInstance.get("/api/program/student/available_courses")
      const courses = response.data.available_courses || []
      setAvailableCourses(courses)
    } catch (err: any) {
      const data = err.response?.data
      // Specialization gate — backend returns 400 with requires_specialization: true
      if (data?.requires_specialization && Array.isArray(data?.available_specializations)) {
        setSpecializationRequired({ available: data.available_specializations })
        setAvailableCourses([])
      } else {
        const msg = data?.detail || data?.message || "Failed to load available courses"
        setError(msg)
        setAvailableCourses([])
      }
    } finally {
      setLoading(false)
    }
  }

  const checkEligibility = async () => {
    try {
      setEligibilityLoading(true)
      const response = await AxiosInstance.get("/api/payments/student/check_registration_eligibility")
      setEligibility(response.data)
    } catch (err: any) {
      console.error("Error checking eligibility:", err)
    } finally {
      setEligibilityLoading(false)
    }
  }

  // Save specialization choice then re-fetch courses
  const handleConfirmSpecialization = async () => {
    if (!selectedSpec) return
    setSavingSpec(true)
    setSpecSaveError(null)
    try {
      await AxiosInstance.post("/api/program/my_enrollment/select_specialization", {
        specialization: selectedSpec,
      })
      setSpecializationRequired(null)
      setSelectedSpec(null)
      // Refresh — courses will now load correctly
      await fetchAvailableCourses()
    } catch (e: any) {
      const data = e.response?.data
      setSpecSaveError(data?.detail || "Failed to save specialization. Please try again.")
    } finally {
      setSavingSpec(false)
    }
  }

  const handleSelectCourse = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCourses.length === availableCourses.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(availableCourses.map((c) => c.id))
    }
  }

  const handleRegister = async () => {
    if (selectedCourses.length === 0) {
      setError("Please select at least one course")
      return
    }
    if (!eligibility?.is_eligible) {
      setError(eligibility?.message || "You are not eligible to register")
      return
    }
    setConfirmDialog(true)
  }

  const confirmRegistration = async () => {
    try {
      setRegistering(true)
      setError(null)
      const response = await AxiosInstance.post("/api/payments/student/register_for_courses", {
        course_unit_ids: selectedCourses,
      })
      setSuccess(response.data.message || "Successfully registered for courses!")
      setSelectedCourses([])
      setConfirmDialog(false)
      fetchAvailableCourses()
      checkEligibility()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to register for courses")
      setConfirmDialog(false)
    } finally {
      setRegistering(false)
    }
  }

  const isAllSelected = selectedCourses.length === availableCourses.length && availableCourses.length > 0
  const isIndeterminate = selectedCourses.length > 0 && selectedCourses.length < availableCourses.length

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: "linear-gradient(135deg, #3e397b 0%, #5a4fa3 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(62, 57, 123, 0.3)",
            }}
          >
            <AssignmentIcon sx={{ color: "white", fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#2d2960" }}>
              Course Registration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register for courses you have been enrolled in
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Programme Enrollment Status Banner */}
      {!eligibilityLoading && eligibility && eligibility.has_programme_enrollment !== undefined && (
        <Card
          sx={{
            mb: 2,
            border: `1px solid ${eligibility.is_programme_enrolled ? "#4caf50" : "#ff9800"}`,
            bgcolor: eligibility.is_programme_enrolled ? alpha("#4caf50", 0.04) : alpha("#ff9800", 0.06),
          }}
        >
          <CardContent sx={{ py: "12px !important" }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {eligibility.is_programme_enrolled ? (
                <CheckCircleIcon sx={{ color: "#4caf50" }} />
              ) : (
                <PendingIcon sx={{ color: "#ff9800" }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Academic Enrollment:{" "}
                  <span style={{ color: eligibility.is_programme_enrolled ? "#4caf50" : "#ff9800" }}>
                    {eligibility.programme_enrollment_status_display ?? "No record"}
                  </span>
                </Typography>
                {eligibility.programme_name && (
                  <Typography variant="caption" color="text.secondary">
                    {eligibility.programme_name}
                    {eligibility.programme_batch ? ` · ${eligibility.programme_batch}` : ""}
                    {eligibility.current_year_of_study
                      ? ` · Year ${eligibility.current_year_of_study}, Term ${eligibility.current_term_number}`
                      : ""}
                  </Typography>
                )}
              </Box>
              {!eligibility.has_programme_enrollment && (
                <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 220, textAlign: "right" }}>
                  Contact the Admissions Office to activate your academic enrollment (commitment fee).
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Tuition threshold skipped notice */}
      {!eligibilityLoading && eligibility?.tuition_check_skipped && (
        <Alert severity="info" sx={{ mb: 2 }}>
          The tuition payment threshold is currently <strong>disabled</strong> by the academic office.
          You may register without meeting a minimum payment percentage.
        </Alert>
      )}

      {/* Eligibility Status */}
      {eligibilityLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : eligibility && (
        <Card
          sx={{
            mb: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: `2px solid ${eligibility.is_eligible ? "#4caf50" : "#ff9800"}`,
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              {eligibility.is_eligible ? (
                <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 32 }} />
              ) : (
                <CancelIcon sx={{ color: "#ff9800", fontSize: 32 }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {eligibility.is_eligible ? "Eligible to Register" : "Not Eligible to Register"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {eligibility.message}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: eligibility.is_eligible ? "#4caf50" : "#ff9800" }}>
                  {eligibility.percentage_paid.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Paid ({eligibility.minimum_required}% required)
                </Typography>
              </Box>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(
                100,
                eligibility.minimum_required > 0
                  ? (eligibility.percentage_paid / eligibility.minimum_required) * 100
                  : eligibility.percentage_paid
              )}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: alpha("#e0e0e0", 0.3),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 1,
                  background: eligibility.is_eligible
                    ? "linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)"
                    : "linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)",
                },
              }}
            />
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Paid: {eligibility.total_paid.toLocaleString()} {eligibility.display_currency || "UGX"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Required (primary): {eligibility.total_required.toLocaleString()} {eligibility.display_currency || "UGX"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Balance: {eligibility.balance.toLocaleString()} {eligibility.display_currency || "UGX"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SPECIALIZATION SELECTION GATE
          Shown instead of the course table when a specialization choice is
          required before courses can be displayed.
      ══════════════════════════════════════════════════════════════════════ */}
      {specializationRequired && (
        <Card
          sx={{
            mb: 4,
            border: "2px solid #3e397b",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(62,57,123,0.15)",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: "#3e397b",
              color: "white",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <SpecIcon />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Choose Your Specialization Track
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Your programme has specialization tracks. You must select one before you can see your courses.
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the specialization track you want to follow. You will only see courses for your chosen track plus shared/common courses.
            </Typography>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
              {specializationRequired.available.map((spec) => (
                <Box
                  key={spec}
                  onClick={() => setSelectedSpec(spec)}
                  sx={{
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: selectedSpec === spec ? "#3e397b" : "#e0e0e0",
                    bgcolor: selectedSpec === spec ? alpha("#3e397b", 0.08) : "white",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    minWidth: 160,
                    "&:hover": {
                      borderColor: "#3e397b",
                      bgcolor: alpha("#3e397b", 0.04),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: selectedSpec === spec ? "#3e397b" : "#bdbdbd",
                        bgcolor: selectedSpec === spec ? "#3e397b" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {selectedSpec === spec && (
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "white" }} />
                      )}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: selectedSpec === spec ? 700 : 500 }}>
                      {spec}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>

            {specSaveError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSpecSaveError(null)}>
                {specSaveError}
              </Alert>
            )}

            <Divider sx={{ mb: 2 }} />

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                disabled={!selectedSpec || savingSpec}
                onClick={handleConfirmSpecialization}
                startIcon={savingSpec ? <CircularProgress size={16} color="inherit" /> : <SpecIcon />}
                sx={{
                  bgcolor: "#3e397b",
                  "&:hover": { bgcolor: "#2d2960" },
                  fontWeight: 600,
                  px: 4,
                }}
              >
                {savingSpec ? "Saving..." : `Confirm — ${selectedSpec ?? "Select a track"}`}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Available Courses — only shown when no specialization gate is active */}
      {!specializationRequired && (
        <Card sx={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: 2 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: "#3e397b",
              color: "white",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Available Courses
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Select courses to register for
              </Typography>
            </Box>
            {availableCourses.length > 0 && (
              <Button
                variant="contained"
                onClick={handleSelectAll}
                sx={{
                  bgcolor: "white",
                  color: "#3e397b",
                  "&:hover": { bgcolor: alpha("#ffffff", 0.9) },
                }}
              >
                {isAllSelected ? "Deselect All" : "Select All"}
              </Button>
            )}
          </Box>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 4 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : availableCourses.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <SchoolIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
                  No Courses Available
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  All available courses have been registered or no courses are configured yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell padding="checkbox" sx={{ fontWeight: 700 }}>
                        <Checkbox
                          indeterminate={isIndeterminate}
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Course Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Course Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Credit Units</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Semester</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Lecturers</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableCourses.map((course, index) => {
                      const isSelected = selectedCourses.includes(course.id)
                      return (
                        <TableRow
                          key={course.id}
                          onClick={() => handleSelectCourse(course.id)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { bgcolor: alpha("#3e397b", 0.04) },
                            bgcolor: isSelected
                              ? alpha("#3e397b", 0.08)
                              : index % 2 === 0
                              ? "transparent"
                              : "#fafafa",
                          }}
                        >
                          <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelectCourse(course.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={course.code}
                              size="small"
                              sx={{
                                bgcolor: alpha("#3e397b", 0.1),
                                color: "#3e397b",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{course.name}</TableCell>
                          <TableCell align="center">
                            {course.credit_units ? (
                              <Chip label={`${course.credit_units} CU`} size="small" variant="outlined" />
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {course.semester?.name || course.program_batch?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            {course.lecturers.length > 0 ? (
                              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {course.lecturers.slice(0, 2).map((lecturer) => (
                                  <Chip
                                    key={lecturer.id}
                                    label={lecturer.name}
                                    size="small"
                                    sx={{ bgcolor: alpha("#3e397b", 0.08), color: "#3e397b" }}
                                  />
                                ))}
                                {course.lecturers.length > 2 && (
                                  <Chip label={`+${course.lecturers.length - 2}`} size="small" variant="outlined" />
                                )}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary">Not assigned</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Register Button */}
      {availableCourses.length > 0 && selectedCourses.length > 0 && (
        <Box sx={{ position: "sticky", bottom: 16, mt: 3, display: "flex", justifyContent: "center" }}>
          <Card
            sx={{
              p: 2,
              bgcolor: alpha("#3e397b", 0.95),
              backdropFilter: "blur(8px)",
              borderRadius: 4,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3}>
              <Typography variant="body1" sx={{ color: "white", fontWeight: 600 }}>
                {selectedCourses.length} course(s) selected
              </Typography>
              <Button
                variant="contained"
                onClick={handleRegister}
                disabled={!eligibility?.is_eligible || registering}
                startIcon={<AssignmentIcon />}
                sx={{
                  bgcolor: eligibility?.is_eligible ? "#4caf50" : "#9e9e9e",
                  "&:hover": { bgcolor: eligibility?.is_eligible ? "#388e3c" : "#757575" },
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {registering ? "Registering..." : "Register for Selected Courses"}
              </Button>
            </Stack>
          </Card>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#3e397b", color: "white" }}>Confirm Registration</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to register for {selectedCourses.length} course(s). Are you sure?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Make sure you have met the payment requirements before proceeding.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmRegistration}
            variant="contained"
            disabled={registering}
            sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
          >
            {registering ? "Registering..." : "Confirm Registration"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={() => { setSuccess(null); setError(null) }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => { setSuccess(null); setError(null) }}
          severity={success ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Container>
  )
}
