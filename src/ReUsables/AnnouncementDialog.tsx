import { useState } from "react"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Typography, CircularProgress, Snackbar, Alert, Chip, Box,
  ToggleButtonGroup, ToggleButton, Divider,
} from "@mui/material"
import {
  Campaign as CampaignIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Science as TestIcon,
} from "@mui/icons-material"
import useAxios from "../AxiosInstance/UseAxios"

interface Props {
  open: boolean
  onClose: () => void
  selectedIds?: number[]
  context?: string
  batches?: string[]
  academicLevels?: string[]
  endpoint?: string
  extraFilters?: React.ReactNode
  extraPayload?: Record<string, any>
}

export default function AnnouncementDialog({ open, onClose, selectedIds, context, batches = [], academicLevels = [], endpoint = "/api/admissions/send_announcement", extraFilters, extraPayload = {} }: Props) {
  const AxiosInstance = useAxios()

  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [messageType, setMessageType] = useState<"email" | "sms" | "both">("email")
  const [annStatus, setAnnStatus] = useState("all")
  const [annBatch, setAnnBatch] = useState("all")
  const [annLevel, setAnnLevel] = useState("all")
  const [sending, setSending] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [sendingTest, setSendingTest] = useState(false)
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" })

  const useExplicitIds = selectedIds && selectedIds.length > 0

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return
    setSending(true)
    try {
      const payload: any = { subject, body, message_type: messageType, ...extraPayload }
      if (useExplicitIds) {
        payload.application_ids = selectedIds
      } else {
        payload.status = annStatus
        payload.batch = annBatch
        payload.academic_level = annLevel
      }
      const res = await AxiosInstance.post(endpoint, payload)
      setSnack({ open: true, msg: res.data.detail, severity: "success" })
      handleClose()
    } catch (err: any) {
      setSnack({ open: true, msg: err.response?.data?.detail || "Failed to send", severity: "error" })
    } finally {
      setSending(false)
    }
  }

  const handleSendTest = async () => {
    if (!subject.trim() || !body.trim() || !testEmail.trim()) return
    setSendingTest(true)
    try {
      const res = await AxiosInstance.post("/api/admissions/test_announcement", {
        subject, body, test_email: testEmail,
      })
      setSnack({ open: true, msg: res.data.detail, severity: "success" })
    } catch (err: any) {
      setSnack({ open: true, msg: err.response?.data?.detail || "Failed to send test", severity: "error" })
    } finally {
      setSendingTest(false)
    }
  }

  const handleClose = () => {
    setSubject(""); setBody(""); setTestEmail("")
    setAnnStatus("all"); setAnnBatch("all"); setAnnLevel("all")
    setMessageType("email")
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0D0060", display: "flex", alignItems: "center", gap: 1 }}>
          <CampaignIcon /> Send Communication
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>

          {/* Message type selector */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Send via
            </Typography>
            <ToggleButtonGroup
              value={messageType}
              exclusive
              onChange={(_, val) => { if (val) setMessageType(val) }}
              size="small"
            >
              <ToggleButton value="email" sx={{ textTransform: "none", gap: 0.5 }}>
                <EmailIcon fontSize="small" /> Email
              </ToggleButton>
              <ToggleButton value="sms" disabled sx={{ textTransform: "none", gap: 0.5 }}>
                <SmsIcon fontSize="small" /> SMS <Chip label="Coming Soon" size="small" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} />
              </ToggleButton>
              <ToggleButton value="both" disabled sx={{ textTransform: "none", gap: 0.5 }}>
                Both <Chip label="Coming Soon" size="small" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider />

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
            Use <strong>{"{first_name}"}</strong> and <strong>{"{last_name}"}</strong> to personalise each message.
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

          {extraFilters && <>{extraFilters}</>}

          <Divider />

          {/* Test email section */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              <TestIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
              Send a test to your email before broadcasting
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                label="Your email address"
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="admin@example.com"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleSendTest}
                disabled={sendingTest || !subject.trim() || !body.trim() || !testEmail.trim()}
                sx={{ textTransform: "none", whiteSpace: "nowrap", minWidth: 100 }}
              >
                {sendingTest ? <CircularProgress size={16} /> : "Send Test"}
              </Button>
            </Box>
          </Box>

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={sending}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            sx={{ bgcolor: "#0D0060", "&:hover": { bgcolor: "#0a004a" }, textTransform: "none" }}
          >
            {sending ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Send to All"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </>
  )
}
