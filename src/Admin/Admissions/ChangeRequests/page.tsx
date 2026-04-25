"use client"

import { useEffect, useState } from "react"
import {
  Box, Container, Typography, Paper, Chip, Button, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
  TextField, Alert,
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Tab, Tooltip, IconButton,
} from "@mui/material"
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material"
import useAxios from "../../../AxiosInstance/UseAxios"

interface ChangeRequest {
  id: number
  change_type: string
  change_type_display: string
  status: string
  status_display: string
  student_name: string | null
  student_id: string
  current_program_name: string | null
  current_campus_name: string | null
  current_study_mode: string
  new_program_name: string | null
  new_campus_name: string | null
  new_study_mode: string
  reason: string
  review_notes: string
  reviewed_by_name: string | null
  reviewed_at: string | null
  created_at: string
}

const STUDY_MODES: Record<string, string> = {
  D: "Day", W: "Weekend", DL: "Distance Learning", DJ: "Day January", WJ: "Weekend January",
}

const statusColor = (s: string): "warning" | "success" | "error" =>
  s === "pending" ? "warning" : s === "approved" ? "success" : "error"

export default function ChangeRequestsPage() {
  const axios = useAxios()

  const [requests, setRequests]   = useState<ChangeRequest[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<"pending" | "approved" | "rejected" | "">("pending")
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)

  // detail / review dialog
  const [selected, setSelected]   = useState<ChangeRequest | null>(null)
  const [reviewDialog, setReviewDialog] = useState<"approve" | "reject" | null>(null)
  const [reviewNotes, setReviewNotes]   = useState("")
  const [submitting, setSubmitting]     = useState(false)

  const load = async (statusFilter: string) => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const res = await axios.get("/api/admissions/change_requests/all", { params })
      setRequests(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError("Failed to load change requests.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(tab) }, [tab])

  const handleReview = async () => {
    if (!selected || !reviewDialog) return
    setSubmitting(true)
    setError(null)
    try {
      await axios.post(`/api/admissions/change_requests/${selected.id}/review`, {
        action: reviewDialog,
        review_notes: reviewNotes,
      })
      setSuccess(`Request ${reviewDialog === "approve" ? "approved" : "rejected"} successfully.`)
      setReviewDialog(null)
      setSelected(null)
      setReviewNotes("")
      load(tab)
    } catch (e: any) {
      setError(e.response?.data?.detail || "Action failed.")
    } finally {
      setSubmitting(false)
    }
  }

  const openReview = (req: ChangeRequest, action: "approve" | "reject") => {
    setSelected(req)
    setReviewNotes("")
    setReviewDialog(action)
  }

  const fromValue = (r: ChangeRequest) => {
    if (r.change_type === "program")    return r.current_program_name || "—"
    if (r.change_type === "campus")     return r.current_campus_name  || "—"
    if (r.change_type === "study_mode") return STUDY_MODES[r.current_study_mode] || r.current_study_mode || "—"
    return "—"
  }

  const toValue = (r: ChangeRequest) => {
    if (r.change_type === "program")    return r.new_program_name || "—"
    if (r.change_type === "campus")     return r.new_campus_name  || "—"
    if (r.change_type === "study_mode") return STUDY_MODES[r.new_study_mode] || r.new_study_mode || "—"
    return "—"
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Admission Change Requests</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review and act on student requests to change their admitted programme, campus, or study mode.
      </Typography>

      {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: "1px solid #e0e0e0" }}
      >
        <Tab label="Pending"  value="pending"  />
        <Tab label="Approved" value="approved" />
        <Tab label="Rejected" value="rejected" />
        <Tab label="All"      value=""         />
      </Tabs>

      <Paper sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 4, textAlign: "center" }}>
            No {tab || ""} change requests found.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Student ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Change Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>From</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reviewed By</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.student_name || "—"}</TableCell>
                    <TableCell>{r.student_id}</TableCell>
                    <TableCell>{r.change_type_display}</TableCell>
                    <TableCell>{fromValue(r)}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#3e397b" }}>{toValue(r)}</TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: "normal" }}>
                      <Tooltip title={r.reason}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{r.reason}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip label={r.status_display} color={statusColor(r.status)} size="small" />
                    </TableCell>
                    <TableCell>{r.reviewed_by_name || "—"}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {r.status === "pending" && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton size="small" color="success" onClick={() => openReview(r, "approve")}>
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" color="error" onClick={() => openReview(r, "reject")}>
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {r.status !== "pending" && r.review_notes && (
                          <Tooltip title={r.review_notes}>
                            <IconButton size="small">
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Approve / Reject Dialog */}
      <Dialog open={!!reviewDialog} onClose={() => setReviewDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: reviewDialog === "approve" ? "#2e7d32" : "#c62828" }}>
          {reviewDialog === "approve" ? "Approve Request" : "Reject Request"}
        </DialogTitle>
        <DialogContent>
          {selected && (
            <DialogContentText sx={{ mb: 2 }}>
              You are about to <strong>{reviewDialog}</strong> the{" "}
              <strong>{selected.change_type_display}</strong> request from{" "}
              <strong>{selected.student_name}</strong> ({selected.student_id}).
              {reviewDialog === "approve" && (
                <> This will immediately update their admission record from{" "}
                <strong>{fromValue(selected)}</strong> to{" "}
                <strong>{toValue(selected)}</strong>.</>
              )}
            </DialogContentText>
          )}
          <TextField
            fullWidth
            label={reviewDialog === "approve" ? "Approval Notes (optional)" : "Reason for Rejection *"}
            multiline
            rows={3}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder={reviewDialog === "approve"
              ? "Any notes for the student..."
              : "Explain why this request is being rejected..."}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setReviewDialog(null)} variant="outlined" color="inherit">Cancel</Button>
          <Button
            onClick={handleReview}
            variant="contained"
            color={reviewDialog === "approve" ? "success" : "error"}
            disabled={submitting || (reviewDialog === "reject" && !reviewNotes.trim())}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : reviewDialog === "approve" ? "Confirm Approval" : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
