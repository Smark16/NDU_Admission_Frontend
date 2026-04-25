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
  Checkbox,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material"
import {
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon,
  Block as BlockIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import CustomButton from "../../ReUsables/custombutton"

interface StudentProgression {
  id: number | null
  student_id: string
  reg_no: string
  name: string
  status: string
  enrollment_date: string
  completion_date: string | null
  notes: string
  student_db_id?: number  // Internal student ID from database
}

interface StudentPromotionDialogProps {
  open: boolean
  onClose: () => void
  semesterId: number
  semesterName: string
  nextSemesterName?: string
  /** False when this semester is last in the batch — API cannot promote further */
  canPromote?: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const StudentPromotionDialog: React.FC<StudentPromotionDialogProps> = ({
  open,
  onClose,
  semesterId,
  semesterName,
  nextSemesterName,
  canPromote = true,
  onSuccess,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [students, setStudents] = useState<StudentProgression[]>([])
  const [selectedIds, setSelectedIds] = useState<(number | null)[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const [detaining, setDetaining] = useState(false)
  const [detentionNotes, setDetentionNotes] = useState("")

  // Fetch students in semester
  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get(
        `/api/program/semester/${semesterId}/students`
      )
      setStudents(response.data || [])
    } catch (err: any) {
      onError(err.response?.data?.detail || "Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && semesterId) {
      fetchStudents()
      setSelectedIds([])
      setSelectedStudentIds([])
      setDetentionNotes("")
    }
  }, [open, semesterId])

  // Handle checkbox selection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(students.map((s) => s.id))
      setSelectedStudentIds(students.filter((s) => s.id === null && s.student_db_id).map((s) => s.student_db_id!))
    } else {
      setSelectedIds([])
      setSelectedStudentIds([])
    }
  }

  const handleSelectOne = (student: StudentProgression) => {
    if (student.id !== null) {
      setSelectedIds((prev) =>
        prev.includes(student.id) ? prev.filter((i) => i !== student.id) : [...prev, student.id]
      )
    } else if (student.student_db_id) {
      setSelectedStudentIds((prev) =>
        prev.includes(student.student_db_id!) 
          ? prev.filter((i) => i !== student.student_db_id) 
          : [...prev, student.student_db_id!]
      )
    }
  }

  const isSelected = (student: StudentProgression) => {
    if (student.id !== null) {
      return selectedIds.includes(student.id)
    } else if (student.student_db_id) {
      return selectedStudentIds.includes(student.student_db_id)
    }
    return false
  }

  const totalSelected = selectedIds.filter((id) => id !== null).length + selectedStudentIds.length

  // Promote students
  const handlePromote = async () => {
    if (!canPromote) {
      onError("Add a next semester to this batch before promoting.")
      return
    }
    if (totalSelected === 0) {
      onError("Please select at least one student to promote")
      return
    }

    setPromoting(true)
    try {
      const response = await AxiosInstance.post(
        `/api/program/semester/${semesterId}/promote_students`,
        {
          progression_ids: selectedIds.filter((id) => id !== null),
          student_ids: selectedStudentIds,
        }
      )

      const errs = response.data.errors || []
      if (errs.length > 0 && !(response.data.promoted && response.data.promoted.length > 0)) {
        onError(errs.join(", "))
      } else {
        const msg =
          errs.length > 0
            ? `${response.data.message || "Done"} (${errs.length} issue(s): ${errs.join("; ")})`
            : response.data.message || "Students promoted successfully"
        onSuccess(msg)
        fetchStudents()
        setSelectedIds([])
        setSelectedStudentIds([])
      }
    } catch (err: any) {
      const d = err.response?.data
      let msg =
        d?.detail || d?.message || err.message || "Failed to promote students"
      if (d?.semesters_in_batch?.length) {
        const seq = d.semesters_in_batch
          .map((s: { name: string; order: number }) => `${s.name} (order ${s.order})`)
          .join(" → ")
        msg = `${msg} Current sequence: ${seq}.`
      }
      onError(msg)
    } finally {
      setPromoting(false)
    }
  }

  // Detain students
  const handleDetain = async () => {
    if (totalSelected === 0) {
      onError("Please select at least one student to detain")
      return
    }

    setDetaining(true)
    try {
      const response = await AxiosInstance.post(
        `/api/program/semester/${semesterId}/detain_students`,
        {
          progression_ids: selectedIds.filter((id) => id !== null),
          student_ids: selectedStudentIds,
          notes: detentionNotes,
        }
      )

      const errs = response.data.errors || []
      if (errs.length > 0 && !(response.data.detained && response.data.detained.length > 0)) {
        onError(errs.join(", "))
      } else {
        const msg =
          errs.length > 0
            ? `${response.data.message || "Done"} (${errs.length} issue(s): ${errs.join("; ")})`
            : response.data.message || "Students detained successfully"
        onSuccess(msg)
        fetchStudents()
        setSelectedIds([])
        setSelectedStudentIds([])
        setDetentionNotes("")
      }
    } catch (err: any) {
      onError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to detain students"
      )
    } finally {
      setDetaining(false)
    }
  }

  // Filter students by status
  const activeStudents = students.filter((s) => s.status === "active")
  const detainedStudents = students.filter((s) => s.status === "detained")
  const promotedStudents = students.filter((s) => s.status === "promoted")

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <SchoolIcon sx={{ color: "#3e397b" }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Student Promotion Management
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {semesterName}
            {nextSemesterName && ` → ${nextSemesterName}`}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {!canPromote && (
            <Alert severity="warning">
              There is no next semester after &quot;{semesterName}&quot; in this batch. Add a new
              semester with the next order number (see Add Semester — Order), save, then refresh this
              page before promoting.
            </Alert>
          )}
          {/* Statistics */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              label={`${activeStudents.length} Active`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${detainedStudents.length} Detained`}
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`${promotedStudents.length} Promoted`}
              color="success"
              variant="outlined"
            />
          </Box>

          {/* Students Table */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : students.length === 0 ? (
            <Alert severity="info">No students found in this semester</Alert>
          ) : (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Select students to promote or detain:
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    checked={(selectedIds.length + selectedStudentIds.length) === students.length && students.length > 0}
                    indeterminate={(selectedIds.length + selectedStudentIds.length) > 0 && (selectedIds.length + selectedStudentIds.length) < students.length}
                    onChange={handleSelectAll}
                  />
                  <Typography variant="caption">
                    Select All ({selectedIds.length + selectedStudentIds.length} selected)
                  </Typography>
                </Box>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={(selectedIds.length + selectedStudentIds.length) === students.length && students.length > 0}
                      indeterminate={(selectedIds.length + selectedStudentIds.length) > 0 && (selectedIds.length + selectedStudentIds.length) < students.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
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
                        <strong>Status</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Enrollment Date</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow
                        key={student.id || `student-${student.student_db_id}`}
                        hover
                        selected={isSelected(student)}
                        sx={{
                          backgroundColor:
                            student.status === "detained"
                              ? "#fff3cd"
                              : student.status === "promoted"
                              ? "#d4edda"
                              : "inherit",
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected(student)}
                            onChange={() => handleSelectOne(student)}
                            disabled={student.status === "promoted"}
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Chip
                            label={student.student_id}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{student.reg_no}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={student.status}
                            size="small"
                            color={
                              student.status === "active"
                                ? "primary"
                                : student.status === "detained"
                                ? "warning"
                                : student.status === "promoted"
                                ? "success"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(student.enrollment_date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Detention Notes */}
              {selectedIds.length > 0 && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Detention Notes (Optional):
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={detentionNotes}
                    onChange={(e) => setDetentionNotes(e.target.value)}
                    placeholder="Enter reason for detention (optional)..."
                    variant="outlined"
                    size="small"
                  />
                </Box>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {selectedIds.length + selectedStudentIds.length} student(s) selected
          </Typography>
        </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton
              onClick={onClose}
              text="Close"
              variant="outlined"
              sx={{ borderColor: "#7c1519", color: "#7c1519" }}
            />
            <Button
              variant="contained"
              startIcon={detaining ? <CircularProgress size={16} /> : <BlockIcon />}
              onClick={handleDetain}
              disabled={detaining || promoting || (selectedIds.length === 0 && selectedStudentIds.length === 0)}
            sx={{
              backgroundColor: "#ff9800",
              "&:hover": { backgroundColor: "#f57c00" },
            }}
          >
            {detaining ? "Detaining..." : "Detain Selected"}
          </Button>
            <Button
              variant="contained"
              startIcon={promoting ? <CircularProgress size={16} /> : <ArrowForwardIcon />}
              onClick={handlePromote}
              disabled={
                !canPromote ||
                promoting ||
                detaining ||
                (selectedIds.length === 0 && selectedStudentIds.length === 0)
              }
            sx={{
              backgroundColor: "#4caf50",
              "&:hover": { backgroundColor: "#388e3c" },
            }}
          >
            {promoting ? "Promoting..." : "Promote Selected"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default StudentPromotionDialog

