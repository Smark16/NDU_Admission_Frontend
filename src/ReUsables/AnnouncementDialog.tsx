import { useState } from "react"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Typography, CircularProgress, Snackbar, Alert, Chip, Box,
} from "@mui/material"
import { Campaign as CampaignIcon } from "@mui/icons-material"
import useAxios from "../AxiosInstance/UseAxios"

interface Props {
  open: boolean
  onClose: () => void
  // When provided, emails go to exactly these application IDs (no filter UI shown)
  selectedIds?: number[]
  // Extra label shown in the dialog subtitle
  context?: string
  // Dropdown options — only shown when selectedIds is empty/undefined
  batches?: string[]
  academicLevels?: string[]
}

export default function AnnouncementDialog({ open, onClose, selectedIds, context, batches = [], academicLevels = [] }: Props) {
  const AxiosInstance = useAxios()

  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [annStatus, setAnnStatus] = useState("all")
  const [annBatch, setAnnBatch] = useState("all")
  const [annLevel, setAnnLevel] = useState("all")
  const [sending, setSending] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" })

  const useExplicitIds = selectedIds && selectedIds.length > 0

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return
    setSending(true)
    try {
      const payload: any = { subject, body }
      if (useExplicitIds) {
        payload.application_ids = selectedIds
      } else {
        payload.status = annStatus
        payload.batch = annBatch
        payload.academic_level = annLevel
      }
      const res = await AxiosInstance.post("/api/admissions/send_announcement", payload)
      setSnack({ open: true, msg: res.data.detail, severity: "success" })
      handleClose()
    } catch (err: any) {
      setSnack({ open: true, msg: err.response?.data?.detail || "Failed to send", severity: "error" })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setSubject(""); setBody("")
    setAnnStatus("all"); setAnnBatch("all"); setAnnLevel("all")
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0D0060", display: "flex", alignItems: "center", gap: 1 }}>
          <CampaignIcon /> Send Communication
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {useExplicitIds ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary">Sending to</Typography>
              <Chip label={`${selectedIds!.length} selected ${context || "applicant"}${selectedIds!.length !== 1 ? "s" : ""}`} color="primary" size="small" />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {context ? `Sending to all ${context}` : "Use filters below to target recipients, or leave all to send to everyone."}
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary">
            Use <strong>{"{first_name}"}</strong> and <strong>{"{last_name}"}</strong> in the body to personalise each email.
          </Typography>

          <TextField fullWidth label="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
          <TextField fullWidth label="Message Body" value={body} onChange={e => setBody(e.target.value)} multiline rows={5} required />

          {!useExplicitIds && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={annStatus} label="Status" onChange={e => setAnnStatus(e.target.value)}>
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Intake</InputLabel>
                  <Select value={annBatch} label="Intake" onChange={e => setAnnBatch(e.target.value)}>
                    <MenuItem value="all">All Intakes</MenuItem>
                    {batches.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Academic Level</InputLabel>
                  <Select value={annLevel} label="Academic Level" onChange={e => setAnnLevel(e.target.value)}>
                    <MenuItem value="all">All Levels</MenuItem>
                    {academicLevels.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={sending}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            sx={{ bgcolor: "#0D0060", "&:hover": { bgcolor: "#0a004a" }, textTransform: "none" }}
          >
            {sending ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Send"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </>
  )
}
