"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Button,
} from "@mui/material"
import {
  School as SchoolIcon,
  Book as BookIcon,
  Groups as GroupsIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import { useNavigate } from "react-router-dom"

interface Student {
  student_id: string
  reg_no: string
  name: string
  enrollment_date: string
  status: string
}

interface Course {
  course_unit_id: number
  course_code: string
  course_name: string
  credit_units: number | null
  semester: {
    id: number | null
    name: string | null
    order: number | null
  } | null
  program_batch: {
    id: number | null
    name: string | null
  } | null
  program: {
    id: number | null
    name: string | null
    short_form: string | null
  } | null
  students_count: number
  students: Student[]
}

interface LecturerData {
  lecturer_name: string
  email: string
  total_courses: number
  total_students: number
  assigned_courses: Course[]
}

export default function LecturerPortal() {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lecturerData, setLecturerData] = useState<LecturerData | null>(null)

  useEffect(() => {
    fetchLecturerCourses()
  }, [])

  const fetchLecturerCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await AxiosInstance.get("/api/program/lecturer/my_courses")
      setLecturerData(response.data)
    } catch (err: any) {
      console.error("Error fetching lecturer courses:", err)
      setError(err.response?.data?.detail || "Failed to load your courses")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress size={50} sx={{ color: "#3e397b" }} />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!lecturerData)
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">
          No lecturer data found. Please contact the administration if you believe this is an error.
        </Alert>
      </Container>
    )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
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
            <SchoolIcon sx={{ color: "white", fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#2d2960" }}>
              Lecturer Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome, {lecturerData.lecturer_name}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              height: "100%",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {lecturerData.total_courses}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Assigned Courses
                  </Typography>
                </Box>
                <BookIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              height: "100%",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {lecturerData.total_students}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Students
                  </Typography>
                </Box>
                <GroupsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              height: "100%",
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {lecturerData.assigned_courses.filter(c => c.students_count > 0).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Courses
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assigned Courses Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "#2d2960" }}>
          My Assigned Courses
        </Typography>

        {lecturerData.assigned_courses.length === 0 ? (
          <Alert severity="info">You have no assigned courses yet.</Alert>
        ) : (
          <Grid container spacing={3}>
            {lecturerData.assigned_courses.map((course) => (
              <Grid size={{ xs: 12, md: 6 }} key={course.course_unit_id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "#2d2960" }}>
                          {course.course_code}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>
                          {course.course_name}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${course.students_count} students`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1.5}>
                      {course.program && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <SchoolIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {course.program.name} ({course.program.short_form})
                          </Typography>
                        </Stack>
                      )}

                      {course.program_batch && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            Batch: {course.program_batch.name}
                          </Typography>
                        </Stack>
                      )}

                      {course.semester && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ScheduleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {course.semester.name}
                          </Typography>
                        </Stack>
                      )}

                      {course.credit_units && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <BookIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {course.credit_units} Credit Units
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/lecturer/courses/${course.course_unit_id}`)}
                        sx={{ width: "100%" }}
                      >
                        View Students
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  )
}

