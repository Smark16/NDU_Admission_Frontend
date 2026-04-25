/**
 * Student: My Academic Enrollment
 *
 * Shows the student's programme enrollment record and the expected courses
 * for their current term.  When the programme has specialization tracks,
 * the student can see and change their selected specialization here.
 */

import React, { useEffect, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  alpha,
} from "@mui/material"
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Book as BookIcon,
  AccountTree as SpecIcon,
  Edit as EditIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnrollmentRecord {
  id: number
  program_name: string
  program_short: string
  batch_name: string
  calendar_type: string
  current_year_of_study: number
  current_term_number: number
  specialization: string | null
  status: "pending" | "enrolled" | "suspended" | "completed" | "withdrawn"
  status_display: string
  enrolled_at: string | null
}

interface SpecializationInfo {
  available_specializations: string[]
  selected_specialization: string | null
  requires_specialization: boolean
  program_has_specialization: boolean
  specialization_entry_year: number | null
  specialization_entry_term: number | null
}

interface ExpectedCourse {
  curriculum_line_id: number
  code: string
  title: string
  credit_units: string
  course_type: "mandatory" | "elective"
  elective_group: string | null
  specialization: string | null
  sort_order: number
  course_unit_id?: number | null
  course_unit_name?: string | null
  is_available_in_portal?: boolean
  is_deferred?: boolean
}

interface ExpectedCoursesResponse {
  enrollment_id: number
  program: string
  program_short: string
  program_batch: string
  year_of_study: number
  term_number: number
  calendar_type: string
  selected_specialization: string | null
  available_specializations: string[]
  requires_specialization: boolean
  total_courses: number
  mandatory_count: number
  elective_count: number
  courses: ExpectedCourse[]
  semester_id?: number | null
  semester_name?: string | null
  semester_found?: boolean
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  enrolled: "success",
  pending: "warning",
  suspended: "error",
  completed: "info",
  withdrawn: "default",
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  enrolled: <CheckCircleIcon fontSize="small" />,
  pending: <PendingIcon fontSize="small" />,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const StudentEnrollmentPage: React.FC = () => {
  const AxiosInstance = useAxios()

  const [enrollment, setEnrollment] = useState<EnrollmentRecord | null>(null)
  const [loadingEnrollment, setLoadingEnrollment] = useState(true)
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null)

  const [specInfo, setSpecInfo] = useState<SpecializationInfo | null>(null)
  const [loadingSpec, setLoadingSpec] = useState(false)

  const [courses, setCourses] = useState<ExpectedCoursesResponse | null>(null)
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Specialization change dialog
  const [specDialog, setSpecDialog] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null)
  const [savingSpec, setSavingSpec] = useState(false)
  const [specSaveError, setSpecSaveError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false, message: "", type: "success",
  })

  // Fetch enrollment record
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await AxiosInstance.get<EnrollmentRecord>("/api/program/my_enrollment")
        setEnrollment(data)
      } catch (e: any) {
        setEnrollmentError(e.response?.data?.detail || "Could not load your enrollment record.")
      } finally {
        setLoadingEnrollment(false)
      }
    }
    load()
  }, [])

  // Fetch specialization info and expected courses when enrolled
  useEffect(() => {
    if (!enrollment || enrollment.status !== "enrolled") return

    // Fetch specialization options
    const loadSpec = async () => {
      setLoadingSpec(true)
      try {
        const { data } = await AxiosInstance.get<SpecializationInfo>(
          "/api/program/my_enrollment/specializations"
        )
        setSpecInfo(data)
      } catch {
        // non-fatal
      } finally {
        setLoadingSpec(false)
      }
    }

    // Fetch expected courses
    const loadCourses = async () => {
      setLoadingCourses(true)
      try {
        const { data } = await AxiosInstance.get<ExpectedCoursesResponse>(
          "/api/program/my_enrollment/expected_courses",
          { params: { include_operational: "true" } }
        )
        setCourses(data)
      } catch {
        // backend may return 400 if specialization not yet selected — handled by specInfo
      } finally {
        setLoadingCourses(false)
      }
    }

    loadSpec()
    loadCourses()
  }, [enrollment])

  const handleOpenSpecDialog = () => {
    setSelectedSpec(enrollment?.specialization ?? null)
    setSpecSaveError(null)
    setSpecDialog(true)
  }

  const handleSaveSpecialization = async () => {
    if (!selectedSpec) return
    setSavingSpec(true)
    setSpecSaveError(null)
    try {
      const { data } = await AxiosInstance.post("/api/program/my_enrollment/select_specialization", {
        specialization: selectedSpec,
      })
      // Update local enrollment record
      if (enrollment) {
        setEnrollment({ ...enrollment, specialization: data.specialization })
      }
      // Re-fetch courses for the new specialization
      setLoadingCourses(true)
      const { data: coursesData } = await AxiosInstance.get<ExpectedCoursesResponse>(
        "/api/program/my_enrollment/expected_courses",
        { params: { include_operational: "true" } }
      )
      setCourses(coursesData)
      setSpecDialog(false)
      setSnackbar({ open: true, message: `Specialization set to ${data.specialization}`, type: "success" })
    } catch (e: any) {
      const d = e.response?.data
      setSpecSaveError(d?.detail || "Failed to save specialization.")
    } finally {
      setSavingSpec(false)
      setLoadingCourses(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loadingEnrollment) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (enrollmentError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>{enrollmentError}</Alert>
        <Typography variant="body2" color="text.secondary">
          If you have paid your commitment fee and your admission has been confirmed, please
          contact the Admissions Office to activate your academic enrollment.
        </Typography>
      </Container>
    )
  }

  if (!enrollment) return null

  const termLabel = enrollment.calendar_type === "trimester" ? "Trimester" : "Semester"
  const hasSpecializationSetup = specInfo?.program_has_specialization ?? false
  const currentSpec = enrollment.specialization
  const specOptions = specInfo?.available_specializations ?? []
  const requiresSpec = specInfo?.requires_specialization ?? false

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <SchoolIcon sx={{ fontSize: 32, color: "#3e397b" }} />
        <Typography variant="h4" fontWeight={600}>
          My Academic Enrollment
        </Typography>
      </Box>

      {/* Enrollment summary card */}
      <Card
        sx={{
          mb: 4,
          background: enrollment.status === "enrolled"
            ? "linear-gradient(135deg, #3e397b 0%, #5a4f9f 100%)"
            : "linear-gradient(135deg, #757575 0%, #424242 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {enrollment.program_name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {enrollment.batch_name}
              </Typography>
              {enrollment.enrolled_at && (
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
              <Chip
                icon={STATUS_ICON[enrollment.status] as React.ReactElement}
                label={enrollment.status_display}
                color={STATUS_COLOR[enrollment.status]}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>Year of Study</Typography>
              <Typography variant="h6" fontWeight={600}>Year {enrollment.current_year_of_study}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>Current {termLabel}</Typography>
              <Typography variant="h6" fontWeight={600}>{termLabel} {enrollment.current_term_number}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>Calendar</Typography>
              <Typography variant="h6" fontWeight={600} sx={{ textTransform: "capitalize" }}>
                {enrollment.calendar_type}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>Programme</Typography>
              <Typography variant="h6" fontWeight={600}>{enrollment.program_short}</Typography>
            </Grid>
          </Grid>

          {/* Specialization row — only shown when programme has tracks */}
          {hasSpecializationSetup && (
            <>
              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <SpecIcon sx={{ opacity: 0.8 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>Specialization Track</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {currentSpec ?? (
                      <span style={{ opacity: 0.7, fontStyle: "italic", fontSize: "1rem" }}>
                        Not yet chosen
                      </span>
                    )}
                  </Typography>
                </Box>
                {enrollment.status === "enrolled" && specOptions.length > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleOpenSpecDialog}
                    sx={{
                      borderColor: "rgba(255,255,255,0.6)",
                      color: "white",
                      "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    {currentSpec ? "Change" : "Choose"}
                  </Button>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Specialization selection prompt — when required but not yet chosen */}
      {enrollment.status === "enrolled" && requiresSpec && !currentSpec && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            specOptions.length > 0 ? (
              <Button color="inherit" size="small" startIcon={<SpecIcon />} onClick={handleOpenSpecDialog}>
                Choose Now
              </Button>
            ) : undefined
          }
        >
          <Typography variant="body2" fontWeight={600}>
            Specialization choice required
          </Typography>
          <Typography variant="body2">
            Your programme has specialization tracks. You must choose one before you can register for courses.
            {specInfo?.specialization_entry_year && (
              <> Required from Year {specInfo.specialization_entry_year} Term {specInfo.specialization_entry_term ?? 1}.</>
            )}
          </Typography>
        </Alert>
      )}

      {/* Pending / not enrolled state */}
      {enrollment.status !== "enrolled" && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your enrollment status is <strong>{enrollment.status_display}</strong>. Course access
          is only available once your enrollment is activated (status: <em>Enrolled</em>).
          Please contact the Admissions Office if you believe this is an error.
        </Alert>
      )}

      {/* Expected courses */}
      {enrollment.status === "enrolled" && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <BookIcon sx={{ color: "#3e397b" }} />
            <Typography variant="h5" fontWeight={600}>
              Expected Courses — Year {enrollment.current_year_of_study}, {termLabel} {enrollment.current_term_number}
            </Typography>
          </Box>

          {loadingCourses || loadingSpec ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : courses ? (
            <>
              {/* Summary chips */}
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip label={`${courses.total_courses} courses`} variant="outlined" />
                <Chip label={`${courses.mandatory_count} mandatory`} color="primary" variant="outlined" />
                <Chip label={`${courses.elective_count} elective`} color="secondary" variant="outlined" />
                {courses.semester_name && (
                  <Chip label={courses.semester_name} variant="outlined" color="info" />
                )}
                {courses.selected_specialization && (
                  <Chip
                    icon={<SpecIcon style={{ fontSize: 14 }} />}
                    label={courses.selected_specialization}
                    size="small"
                    sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 600 }}
                  />
                )}
              </Box>

              <TableContainer component={Paper} elevation={2}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Course Title</TableCell>
                      <TableCell align="center">Credits</TableCell>
                      <TableCell align="center">Type</TableCell>
                      {hasSpecializationSetup && <TableCell align="center">Track</TableCell>}
                      <TableCell align="center">Portal Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.courses.map((c) => (
                      <TableRow key={c.curriculum_line_id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{c.code}</Typography>
                        </TableCell>
                        <TableCell>{c.title}</TableCell>
                        <TableCell align="center">{c.credit_units}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={c.course_type}
                            size="small"
                            color={c.course_type === "mandatory" ? "primary" : "secondary"}
                            variant="outlined"
                          />
                          {c.elective_group && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Group: {c.elective_group}
                            </Typography>
                          )}
                        </TableCell>
                        {hasSpecializationSetup && (
                          <TableCell align="center">
                            {c.specialization ? (
                              <Chip
                                label={c.specialization}
                                size="small"
                                sx={{ bgcolor: alpha("#1565c0", 0.1), color: "#1565c0", fontWeight: 600, fontSize: "0.7rem" }}
                              />
                            ) : (
                              <Chip
                                label="Shared"
                                size="small"
                                sx={{ bgcolor: alpha("#2e7d32", 0.1), color: "#2e7d32", fontWeight: 600, fontSize: "0.7rem" }}
                              />
                            )}
                          </TableCell>
                        )}
                        <TableCell align="center">
                          {c.is_deferred ? (
                            <Chip label="Deferred" size="small" color="warning" />
                          ) : c.is_available_in_portal === undefined ? (
                            <Chip label="N/A" size="small" variant="outlined" />
                          ) : c.is_available_in_portal ? (
                            <Chip label="Available" size="small" color="success" />
                          ) : (
                            <Chip label="Not yet open" size="small" color="default" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {courses.semester_found === false && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  The operational semester for your current term has not been set up yet. Course
                  availability will be shown once the academic office opens registrations.
                </Alert>
              )}
            </>
          ) : (
            !requiresSpec && (
              <Alert severity="info">
                No curriculum data found for your current term. Please contact the academic office.
              </Alert>
            )
          )}
        </Box>
      )}

      {/* ── Specialization choose/change dialog ──────────────────────────── */}
      <Dialog open={specDialog} onClose={() => setSpecDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: "#3e397b", color: "white", display: "flex", alignItems: "center", gap: 1 }}>
          <SpecIcon />
          {currentSpec ? "Change Specialization Track" : "Choose Specialization Track"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {currentSpec && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You currently have <strong>{currentSpec}</strong> selected. Changing your specialization
              may affect your course registration. Contact the academic office if you are unsure.
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the specialization track you want to follow:
          </Typography>

          <Stack spacing={1.5}>
            {specOptions.map((spec) => (
              <Box
                key={spec}
                onClick={() => setSelectedSpec(spec)}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 2,
                  border: "2px solid",
                  borderColor: selectedSpec === spec ? "#3e397b" : "#e0e0e0",
                  bgcolor: selectedSpec === spec ? alpha("#3e397b", 0.07) : "white",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "#3e397b", bgcolor: alpha("#3e397b", 0.04) },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
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
                  <Typography fontWeight={selectedSpec === spec ? 700 : 500}>{spec}</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>

          {specSaveError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setSpecSaveError(null)}>
              {specSaveError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSpecDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedSpec || savingSpec}
            onClick={handleSaveSpecialization}
            sx={{ bgcolor: "#3e397b", "&:hover": { bgcolor: "#2d2960" } }}
          >
            {savingSpec ? <CircularProgress size={18} color="inherit" /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.type} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default StudentEnrollmentPage
