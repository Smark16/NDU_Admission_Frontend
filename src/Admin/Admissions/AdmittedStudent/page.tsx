"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  TablePagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Container,
  Grid,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import SchoolIcon from "@mui/icons-material/School"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import useAxios from "../../../AxiosInstance/UseAxios"
import { Link } from "react-router-dom"
import {
  Visibility,
  Campaign as CampaignIcon,
  PictureAsPdf as PdfIcon,
  AutoAwesome as GenerateIcon,
  Send as SendIcon,
} from "@mui/icons-material"
import { Checkbox } from "@mui/material"
import AnnouncementDialog from "../../../ReUsables/AnnouncementDialog"
import { useContext } from "react"
import { AuthContext } from "../../../Context/AuthContext"

interface Admitted {
  id: number
  batch: string
  application: number
  campus: string
  program: string
  name: string
  student_id: string
  reg_no: string
  faculty: string
  admission_date: string
  status: string
  is_admitted: boolean
  is_registered: boolean
  is_approved: boolean
  approved_by_name: string | null
  approved_at: string | null
  admission_letter_pdf: string | null
}

export default function AdmittedStudents() {
  const theme = useTheme()
  const AxiosInstance = useAxios()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { loggeduser } = useContext(AuthContext) || {}
  const isRegistrar = loggeduser?.role === "Academic Registrar"

  const [searchTerm, setSearchTerm] = useState("")
  const [registrationFilter, setRegistrationFilter] = useState("all")
  const [approvalFilter, setApprovalFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [admittedStudents, setAdmittedStudents] = useState<Admitted[]>([])
  const [loading, setLoading] = useState(true)

  // Column visibility navigation per row
  const [columnViewIndex, setColumnViewIndex] = useState<{ [key: number]: number }>({})

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Admitted | null>(null)
  const [letterActionLoading, setLetterActionLoading] = useState<Record<number, boolean>>({})
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "info",
  })

  // Communication selection (use application IDs for emailing)
  const [selectedAppIds, setSelectedAppIds] = useState<number[]>([])
  const [commDialogOpen, setCommDialogOpen] = useState(false)

  // Fetch admitted students
  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        setLoading(true)
        const { data } = await AxiosInstance.get("/api/admissions/list_admitted_students")
        setAdmittedStudents(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAdmissions()
  }, [AxiosInstance])

  const handleApproveClick = (student: Admitted) => {
    setSelectedStudent(student)
    setApproveDialogOpen(true)
  }

  const handleDeclineClick = (student: Admitted) => {
    setSelectedStudent(student)
    setDeclineReason("")
    setDeclineDialogOpen(true)
  }

  const confirmApprove = async () => {
    if (!selectedStudent) return
    setActionLoading(true)
    try {
      await AxiosInstance.post(`/api/admissions/approve_admission/${selectedStudent.id}/`)
      setAdmittedStudents(prev =>
        prev.map(s => s.id === selectedStudent.id ? { ...s, is_approved: true } : s)
      )
      setApproveDialogOpen(false)
    } catch (err) {
      console.error("Approve failed:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const confirmDecline = async () => {
    if (!selectedStudent) return
    setActionLoading(true)
    try {
      await AxiosInstance.post(`/api/admissions/decline_admission/${selectedStudent.id}/`, {
        decline_reason: declineReason,
      })
      setAdmittedStudents(prev => prev.filter(s => s.id !== selectedStudent.id))
      setDeclineDialogOpen(false)
    } catch (err) {
      console.error("Decline failed:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Filter logic
  const filteredStudents = useMemo(() => {
    return admittedStudents.filter((student) => {
      const matchesSearch =
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        registrationFilter === "all" ||
        (registrationFilter === "registered" && student.is_registered) ||
        (registrationFilter === "not-registered" && !student.is_registered)

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "pending" && !student.is_approved) ||
        (approvalFilter === "approved" && student.is_approved)

      return matchesSearch && matchesFilter && matchesApproval
    })
  }, [admittedStudents, searchTerm, registrationFilter, approvalFilter])

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Column groups (adjust based on your needs)
  const columnGroups = isMobile
    ? [
      ["student_id", "reg_no", "name", "status", "admission"],
      ["program", "faculty", "campus", "batch", "admission_date"],
    ]
    : [
      ["student_id", "reg_no", "name", "program", "faculty", "status", "admission"],
      ["campus", "batch", "admission_date"],
    ]

  const getVisibleColumns = (studentId: number) => {
    const viewIndex = columnViewIndex[studentId] || 0
    return columnGroups[viewIndex] || columnGroups[0]
  }

  const handleNextColumns = (studentId: number) => {
    setColumnViewIndex((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || 0) + 1 >= columnGroups.length ? 0 : (prev[studentId] || 0) + 1,
    }))
  }

  const handlePrevColumns = (studentId: number) => {
    setColumnViewIndex((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || 0) === 0 ? columnGroups.length - 1 : (prev[studentId] || 0) - 1,
    }))
  }

  const handleDeleteClick = (student: Admitted) => {
    setSelectedStudent(student)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedStudent) return

    try {
      await AxiosInstance.delete(`/api/admissions/admitted_students/${selectedStudent.id}/`)
      setAdmittedStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id))
      setDeleteDialogOpen(false)
      setSelectedStudent(null)
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const showToast = (message: string, severity: "success" | "error" | "info" = "info") => {
    setSnackbar({ open: true, message, severity })
  }

  const setStudentActionLoading = (studentId: number, loadingState: boolean) => {
    setLetterActionLoading((prev) => ({ ...prev, [studentId]: loadingState }))
  }

  const apiBaseUrl = ((import.meta.env.VITE_API_BASE_URL as string) || "").trim().replace(/\/+$/, "")

  const toAbsoluteUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    const normalizedPath = url.startsWith("/") ? url : `/${url}`
    return `${apiBaseUrl || window.location.origin}${normalizedPath}`
  }

  const handleGenerateOfferLetter = async (student: Admitted) => {
    setStudentActionLoading(student.id, true)
    try {
      const { data } = await AxiosInstance.post(`/api/offer_letter/send_letter/${student.application}`)
      const updatedPdf = data?.pdf_url ? toAbsoluteUrl(data.pdf_url) : student.admission_letter_pdf

      setAdmittedStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, admission_letter_pdf: updatedPdf } : s))
      )
      showToast(data?.detail || "Offer letter generation started.", "success")
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to generate offer letter.", "error")
    } finally {
      setStudentActionLoading(student.id, false)
    }
  }

  const handleSendOfferLetter = async (student: Admitted) => {
    setStudentActionLoading(student.id, true)
    try {
      if (student.admission_letter_pdf) {
        const { data } = await AxiosInstance.post(`/api/offer_letter/resend_letter/${student.application}`)
        showToast(data?.detail || "Offer letter email sent.", "success")
      } else {
        const { data } = await AxiosInstance.post(`/api/offer_letter/send_letter/${student.application}`)
        const updatedPdf = data?.pdf_url ? toAbsoluteUrl(data.pdf_url) : student.admission_letter_pdf
        setAdmittedStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, admission_letter_pdf: updatedPdf } : s))
        )
        showToast(data?.detail || "Offer letter generated and sent.", "success")
      }
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to send offer letter.", "error")
    } finally {
      setStudentActionLoading(student.id, false)
    }
  }

  const handlePrintOfferLetter = (student: Admitted) => {
    if (!student.admission_letter_pdf) {
      showToast("No offer letter PDF yet. Generate it first.", "info")
      return
    }
    const target = toAbsoluteUrl(student.admission_letter_pdf)
    if (target) window.open(target, "_blank", "noopener,noreferrer")
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SchoolIcon sx={{ fontSize: 32, color: "#0D0060" }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Admitted Students</Typography>
          </Stack>
          <Button
            variant="contained" startIcon={<CampaignIcon />}
            onClick={() => setCommDialogOpen(true)}
            sx={{ bgcolor: "#0D0060", "&:hover": { bgcolor: "#0a004a" }, textTransform: "none", fontWeight: 700 }}
          >
            {selectedAppIds.length > 0 ? `Send to ${selectedAppIds.length} selected` : "Send Communication"}
          </Button>
        </Stack>

        {/* Search + Filter */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by Student ID, Name, or Program..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(0)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Registration Status</InputLabel>
              <Select
                value={registrationFilter}
                label="Registration Status"
                onChange={(e) => {
                  setRegistrationFilter(e.target.value as string)
                  setPage(0)
                }}
              >
                <MenuItem value="all">All Students</MenuItem>
                <MenuItem value="registered">Registered Only</MenuItem>
                <MenuItem value="not-registered">Not Registered</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Approval Status</InputLabel>
              <Select
                value={approvalFilter}
                label="Approval Status"
                onChange={(e) => {
                  setApprovalFilter(e.target.value as string)
                  setPage(0)
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending Registrar Approval</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Table */}
      <Card sx={{ boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }}>
        {loading ? (<>
          <Box sx={{ p: 8, textAlign: "center", py: 12 }}>
            <CircularProgress sx={{ color: "#7c1519" }} />
            <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: "auto" }}>
              loading admitted candidates please wait.
            </Typography>
          </Box>
        </>) : filteredStudents.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#0D0060",
                      "& th": {
                        color: "white",
                        fontWeight: 700,
                        fontSize: isMobile ? "0.85rem" : "0.95rem",
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        sx={{ color: "white", "&.Mui-checked": { color: "white" } }}
                        indeterminate={paginatedStudents.some(s => selectedAppIds.includes(s.application)) && !paginatedStudents.every(s => selectedAppIds.includes(s.application))}
                        checked={paginatedStudents.length > 0 && paginatedStudents.every(s => selectedAppIds.includes(s.application))}
                        onChange={() => {
                          const ids = paginatedStudents.map(s => s.application)
                          const allSel = ids.every(id => selectedAppIds.includes(id))
                          allSel ? setSelectedAppIds(p => p.filter(id => !ids.includes(id))) : setSelectedAppIds(p => [...new Set([...p, ...ids])])
                        }}
                      />
                    </TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Reg No</TableCell>
                    <TableCell>Name</TableCell>

                    {getVisibleColumns(0).includes("program") && <TableCell>Program</TableCell>}
                    {getVisibleColumns(0).includes("faculty") && <TableCell>Faculty</TableCell>}
                    {getVisibleColumns(0).includes("campus") && <TableCell>Campus</TableCell>}
                    {getVisibleColumns(0).includes("batch") && <TableCell>Batch</TableCell>}
                    {getVisibleColumns(0).includes("admission_date") && (
                      <TableCell>Admission Date</TableCell>
                    )}
                    {getVisibleColumns(0).includes("status") && <TableCell>Reg. Status</TableCell>}
                    {getVisibleColumns(0).includes("admission") && <TableCell>Approval</TableCell>}

                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedStudents.map((student) => {
                    const visibleColumns = getVisibleColumns(student.id)
                    const viewIndex = columnViewIndex[student.id] || 0

                    return (
                      <TableRow
                        key={student.id}
                        hover
                        sx={{
                          "&:hover": { backgroundColor: "action.hover" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedAppIds.includes(student.application)}
                            onChange={() => setSelectedAppIds(p => p.includes(student.application) ? p.filter(x => x !== student.application) : [...p, student.application])}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{student.student_id}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{student.reg_no}</TableCell>
                        <TableCell>{student.name}</TableCell>

                        {visibleColumns.includes("program") && <TableCell>{student.program}</TableCell>}
                        {visibleColumns.includes("faculty") && <TableCell>{student.faculty}</TableCell>}
                        {visibleColumns.includes("campus") && <TableCell>{student.campus}</TableCell>}
                        {visibleColumns.includes("batch") && <TableCell>{student.batch}</TableCell>}
                        {visibleColumns.includes("admission_date") && (
                          <TableCell>{formatDate(student.admission_date)}</TableCell>
                        )}
                        {visibleColumns.includes("status") && (
                          <TableCell>
                            <Chip
                              label={student.is_registered ? "Registered" : "Not Registered"}
                              color={student.is_registered ? "success" : "warning"}
                              variant="filled"
                              size="small"
                            />
                          </TableCell>
                        )}
                        {visibleColumns.includes("admission") && (
                          <TableCell>
                            <Chip
                              label={student.is_approved ? "Approved" : "Awaiting Registrar"}
                              color={student.is_approved ? "success" : "warning"}
                              variant="filled"
                              size="small"
                            />
                          </TableCell>
                        )}

                        {/* Navigation + Actions */}
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            {/* Column Navigation Arrows */}
                            {columnGroups.length > 1 && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handlePrevColumns(student.id)}
                                  disabled={viewIndex === 0}
                                >
                                  <ChevronLeftIcon fontSize="small" />
                                </IconButton>

                                <IconButton
                                  size="small"
                                  onClick={() => handleNextColumns(student.id)}
                                  disabled={viewIndex === columnGroups.length - 1}
                                >
                                  <ChevronRightIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}

                            {/* Registrar-only: Approve / Decline */}
                            {isRegistrar && !student.is_approved && (
                              <>
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleApproveClick(student)}
                                  title="Approve Admission"
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeclineClick(student)}
                                  title="Decline Admission"
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}

                            {/* View */}
                            <IconButton
                              size="small"
                              color="primary"
                              component={Link}
                              to={`/admin/admitted_student_review/${student.application}`}
                              title="View Student"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleGenerateOfferLetter(student)}
                              disabled={!!letterActionLoading[student.id]}
                              title="Generate Offer Letter"
                            >
                              <GenerateIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handlePrintOfferLetter(student)}
                              disabled={!!letterActionLoading[student.id]}
                              title="Print Offer Letter"
                            >
                              <PdfIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleSendOfferLetter(student)}
                              disabled={!!letterActionLoading[student.id]}
                              title="Send Offer Letter"
                            >
                              <SendIcon fontSize="small" />
                            </IconButton>
                        
                            <IconButton
                              size="small"
                              color="primary"
                              component={Link}
                              to={`/admin/edit_admitted_student/${student.id}`}
                              title="Edit Student"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(student)}
                              title="Delete Student"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: "1px solid", borderTopColor: "divider" }}
            />
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <SchoolIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
              No Admitted Students Yet
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Students will appear here after admission.
            </Typography>
          </Box>
        )}
      </Card>

      {/* Edit Dialog (placeholder) */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                defaultValue={selectedStudent.name}
                disabled // make editable when you implement real edit
              />
              <TextField
                fullWidth
                label="Student ID"
                defaultValue={selectedStudent.student_id}
                disabled
              />
              <TextField
                fullWidth
                label="Reg No"
                defaultValue={selectedStudent.reg_no}
              />
              {/* Add more fields as needed */}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setEditDialogOpen(false)}>
            Save (Not implemented yet)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the record for{" "}
            <strong>{selectedStudent?.name}</strong> (ID: {selectedStudent?.student_id})?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600, color: "#0D0060" }}>Approve Admission</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 1 }}>
            You are about to <strong>approve</strong> the admission of{" "}
            <strong>{selectedStudent?.name}</strong> (ID: {selectedStudent?.student_id}).
            <br /><br />
            This will finalise their admission and send them a confirmation email.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setApproveDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmApprove}
            disabled={actionLoading}
            startIcon={<CheckCircleIcon />}
          >
            {actionLoading ? "Approving..." : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={declineDialogOpen} onClose={() => setDeclineDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: "#c0001a" }}>Decline Admission</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 1, mb: 2 }}>
            You are about to <strong>decline</strong> the admission of{" "}
            <strong>{selectedStudent?.name}</strong>. The application will be sent back for re-review.
          </DialogContentText>
          <TextField
            fullWidth
            label="Reason for declining"
            multiline
            minRows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Provide a reason (optional)..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeclineDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDecline}
            disabled={actionLoading}
            startIcon={<CancelIcon />}
          >
            {actionLoading ? "Declining..." : "Decline"}
          </Button>
        </DialogActions>
      </Dialog>

      <AnnouncementDialog
        open={commDialogOpen}
        onClose={() => setCommDialogOpen(false)}
        selectedIds={selectedAppIds.length > 0 ? selectedAppIds : undefined}
        context="admitted student"
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}