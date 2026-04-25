"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Button,
  Divider,
} from "@mui/material"
import {
  Search as SearchIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import { useNavigate, useParams } from "react-router-dom"

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

export default function CourseStudents() {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (courseId) {
      fetchCourseStudents()
    }
  }, [courseId])

  const fetchCourseStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await AxiosInstance.get("/api/program/lecturer/my_courses")
      const courses = response.data.assigned_courses || []
      
      // Find the specific course
      const foundCourse = courses.find(
        (c: Course) => c.course_unit_id === parseInt(courseId || "0")
      )
      
      if (!foundCourse) {
        setError("Course not found or you don't have access to this course")
        return
      }
      
      setCourse(foundCourse)
    } catch (err: any) {
      console.error("Error fetching course students:", err)
      setError(err.response?.data?.detail || "Failed to load course students")
    } finally {
      setLoading(false)
    }
  }

  // Filter students based on search term
  const filteredStudents = course?.students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.reg_no.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/lecturer/portal")}
          variant="outlined"
        >
          Back to Portal
        </Button>
      </Container>
    )
  }

  if (!course) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Course not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/lecturer/portal")}
          variant="outlined"
        >
          Back to Portal
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/lecturer/portal")}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Back to Portal
        </Button>
        
        <Card sx={{ mb: 3, bgcolor: "#3e397b", color: "white" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <BookIcon sx={{ fontSize: 40 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {course.course_code}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {course.course_name}
                </Typography>
              </Box>
              <Chip
                label={`${course.students_count} Students`}
                sx={{
                  bgcolor: "white",
                  color: "#3e397b",
                  fontWeight: 600,
                  fontSize: "1rem",
                  height: "36px",
                }}
              />
            </Stack>
            
            <Divider sx={{ my: 2, bgcolor: "rgba(255,255,255,0.2)" }} />
            
            <Stack direction="row" spacing={3} flexWrap="wrap">
              {course.program && (
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Program
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {course.program.name} {course.program.short_form && `(${course.program.short_form})`}
                  </Typography>
                </Box>
              )}
              {course.program_batch && (
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Batch
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {course.program_batch.name}
                  </Typography>
                </Box>
              )}
              {course.semester && (
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Semester
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {course.semester.name}
                  </Typography>
                </Box>
              )}
              {course.credit_units && (
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Credit Units
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {course.credit_units} CU
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        <TextField
          fullWidth
          placeholder="Search students by name, student ID, or registration number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {/* Students Table */}
      {course.students.length === 0 ? (
        <Alert severity="info">
          No students enrolled in this course yet.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f7fa" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Student ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Registration No.</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Enrollment Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No students found matching your search.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <TableRow key={`${student.student_id}-${index}`} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>{student.student_id}</Typography>
                        </TableCell>
                        <TableCell>{student.reg_no}</TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Typography>{student.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="body2">{formatDate(student.enrollment_date)}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            color={
                              student.status === "enrolled"
                                ? "primary"
                                : student.status === "completed"
                                ? "success"
                                : student.status === "withdrawn"
                                ? "error"
                                : "warning"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}












