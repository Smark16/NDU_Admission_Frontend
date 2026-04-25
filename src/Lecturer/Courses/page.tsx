"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Divider,
  Button,
} from "@mui/material"
import {
  Book as BookIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import { useNavigate } from "react-router-dom"

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
}

export default function LecturerCourses() {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await AxiosInstance.get("/api/program/lecturer/my_courses")
      setCourses(response.data.assigned_courses || [])
    } catch (err: any) {
      console.error("Error fetching courses:", err)
      setError(err.response?.data?.detail || "Failed to load courses")
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#2d2960", mb: 1 }}>
          My Courses
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all your assigned courses
        </Typography>
      </Box>

      {courses.length === 0 ? (
        <Alert severity="info">You have no assigned courses yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={course.course_unit_id}>
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

                  <Stack spacing={1.5} sx={{ mb: 2 }}>
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

                  <Button
                    variant="contained"
                    startIcon={<GroupsIcon />}
                    onClick={() => navigate(`/lecturer/courses/${course.course_unit_id}`)}
                    sx={{ width: "100%", bgcolor: "#3e397b", "&:hover": { bgcolor: "#2d2960" } }}
                  >
                    View Students
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

