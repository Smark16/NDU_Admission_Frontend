"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
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
} from "@mui/material"
import {
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import { useParams, useNavigate } from "react-router-dom"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

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
  students: Student[]
}

export default function LecturerStudents() {
  const AxiosInstance = useAxios()
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await AxiosInstance.get("/api/program/lecturer/my_courses")
      setCourses(response.data.assigned_courses || [])
    } catch (err: any) {
      console.error("Error fetching students:", err)
      setError(err.response?.data?.detail || "Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  // Flatten all students from all courses
  const allStudents = courses.flatMap((course) =>
    course.students.map((student) => ({
      ...student,
      course_unit_id: course.course_unit_id,
      course_code: course.course_code,
      course_name: course.course_name,
    }))
  )

  // When accessed via /lecturer/courses/:courseId, restrict to that course
  const courseFiltered = courseId
    ? allStudents.filter((s) => String(s.course_unit_id) === courseId)
    : allStudents

  const activeCourse = courseId
    ? courses.find((c) => String(c.course_unit_id) === courseId)
    : null

  // Filter students based on search term
  const q = searchTerm.toLowerCase()
  const filteredStudents = courseFiltered.filter(
    (student) =>
      (student.name ?? "").toLowerCase().includes(q) ||
      (student.student_id ?? "").toLowerCase().includes(q) ||
      (student.reg_no ?? "").toLowerCase().includes(q) ||
      (student.course_code ?? "").toLowerCase().includes(q)
  )

  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    const d = new Date(dateString)
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", {
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
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        {courseId && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/lecturer/courses")}
            sx={{ mb: 2, color: "#3e397b" }}
          >
            Back to Courses
          </Button>
        )}
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#2d2960", mb: 1 }}>
          {activeCourse
            ? `${activeCourse.course_code} — Students`
            : "My Students"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {activeCourse
            ? activeCourse.course_name
            : "View all students enrolled in your courses"}
        </Typography>

        <TextField
          fullWidth
          placeholder="Search by name, student ID, registration number, or course code..."
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

      {allStudents.length === 0 ? (
        <Alert severity="info">You have no students enrolled in your courses yet.</Alert>
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
                    <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Enrollment Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No students found matching your search.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <TableRow key={`${student.student_id}-${student.course_code}-${index}`} hover>
                        <TableCell>{student.student_id}</TableCell>
                        <TableCell>{student.reg_no}</TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Typography>{student.name || "—"}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <SchoolIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {student.course_code}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.course_name}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>{formatDate(student.enrollment_date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={student.status}
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

