import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Autocomplete,
  TextField,
  Button,
  Stack,
} from "@mui/material"
import {
  People as PeopleIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import CustomButton from "../../ReUsables/custombutton"

interface Student {
  id: number
  student_id: string
  reg_no: string
  name: string
}

interface Enrollment {
  id: number
  student_id: string
  reg_no: string
  name: string
  enrollment_date: string
  status: string
  grade: string | null
}

interface EnrollStudentsDialogProps {
  open: boolean
  onClose: () => void
  courseUnitId: number
  courseUnitName: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const EnrollStudentsDialog: React.FC<EnrollStudentsDialogProps> = ({
  open,
  onClose,
  courseUnitId,
  courseUnitName,
  onSuccess,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([])
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch enrolled students
  const fetchEnrolledStudents = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(
        `/api/program/course_unit/${courseUnitId}/enrollments`
      )
      setEnrolledStudents(response.data || [])
    } catch (err: any) {
      onError(err.response?.data?.detail || "Failed to load enrolled students")
    } finally {
      setLoading(false)
    }
  }

  // Fetch available students
  const fetchAvailableStudents = async () => {
    setLoadingAvailable(true)
    try {
      const response = await AxiosInstance.get(
        `/api/program/course_unit/${courseUnitId}/available_students`
      )
      setAvailableStudents(response.data || [])
    } catch (err: any) {
      onError(err.response?.data?.detail || "Failed to load available students")
    } finally {
      setLoadingAvailable(false)
    }
  }

  useEffect(() => {
    if (open && courseUnitId) {
      fetchEnrolledStudents()
      fetchAvailableStudents()
    }
  }, [open, courseUnitId])

  // Filter available students by search term
  const filteredAvailableStudents = availableStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.reg_no.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Enroll selected students
  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) {
      onError("Please select at least one student")
      return
    }

    setEnrolling(true)
    try {
      const response = await AxiosInstance.post(
        `/api/program/course_unit/${courseUnitId}/enroll_students`,
        {
          student_ids: selectedStudents.map((s) => s.id),
        }
      )

      if (response.data.errors && response.data.errors.length > 0) {
        onError(response.data.errors.join(", "))
      } else {
        onSuccess(response.data.message || "Students enrolled successfully")
      }

      // Refresh lists
      fetchEnrolledStudents()
      fetchAvailableStudents()
      setSelectedStudents([])
    } catch (err: any) {
      onError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to enroll students"
      )
    } finally {
      setEnrolling(false)
    }
  }

  // Remove student from course unit
  const handleRemoveStudent = async (enrollmentId: number, studentName: string) => {
    if (!window.confirm(`Remove ${studentName} from this course unit?`)) return

    try {
      await AxiosInstance.delete(`/api/program/enrollment/${enrollmentId}/remove`)
      onSuccess("Student removed successfully")
      fetchEnrolledStudents()
      fetchAvailableStudents()
    } catch (err: any) {
      onError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to remove student"
      )
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PeopleIcon sx={{ color: "#3e397b" }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Enroll Students in Course Unit
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {courseUnitName}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Enrolled Students Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Enrolled Students ({enrolledStudents.length})
            </Typography>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : enrolledStudents.length === 0 ? (
              <Alert severity="info">No students enrolled yet</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell>
                        <strong>#</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Student ID</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Reg No</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Enrollment Date</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Status</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrolledStudents.map((enrollment, index) => (
                      <TableRow key={enrollment.id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Chip
                            label={enrollment.student_id}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{enrollment.reg_no}</TableCell>
                        <TableCell>{enrollment.name}</TableCell>
                        <TableCell>
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={enrollment.status}
                            size="small"
                            color={
                              enrollment.status === "enrolled"
                                ? "primary"
                                : enrollment.status === "completed"
                                ? "success"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleRemoveStudent(enrollment.id, enrollment.name)
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Add Students Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Add Students
            </Typography>
            {loadingAvailable ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : availableStudents.length === 0 ? (
              <Alert severity="info">
                All eligible students are already enrolled
              </Alert>
            ) : (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search students by name, ID, or reg no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                  sx={{ mb: 2 }}
                />
                <Autocomplete
                  multiple
                  options={filteredAvailableStudents}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.reg_no})`
                  }
                  value={selectedStudents}
                  onChange={(_, newValue) => setSelectedStudents(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Students to Enroll"
                      placeholder="Search and select students..."
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={`${option.name} (${option.reg_no})`}
                        size="small"
                      />
                    ))
                  }
                />
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    startIcon={enrolling ? <CircularProgress size={16} /> : <AddIcon />}
                    onClick={handleEnrollStudents}
                    disabled={enrolling || selectedStudents.length === 0}
                    sx={{ backgroundColor: "#3e397b", "&:hover": { backgroundColor: "#2d2960" } }}
                  >
                    {enrolling
                      ? "Enrolling..."
                      : `Enroll ${selectedStudents.length} Student(s)`}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <CustomButton
          onClick={onClose}
          text="Close"
          variant="outlined"
          sx={{ borderColor: "#7c1519", color: "#7c1519" }}
        />
      </DialogActions>
    </Dialog>
  )
}

export default EnrollStudentsDialog

