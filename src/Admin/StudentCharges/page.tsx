/**
 * Admin: Student Ad-Hoc Charge Management
 *
 * Staff can:
 * - View all ad-hoc charges for a specific student
 * - Create new charges (retake fee, late registration penalty, etc.)
 * - Edit pending charges
 * - Waive a charge (soft-cancel with audit trail)
 * - Delete pending charges
 *
 * Route: /admin/student/:studentId/charges
 */

import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  type SelectChangeEvent,
} from "@mui/material"
import {
  AccountBalance as AccountBalanceIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ReceiptLong as ReceiptIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import CustomButton from "../../ReUsables/custombutton"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeeHead {
  id: number
  code: string
  name: string
  category: string
  category_display: string
}

interface AdHocCharge {
  id: number
  source: string
  fee_head_id: number | null
  fee_head_name: string | null
  fee_head_category: string | null
  label: string
  amount: number
  currency: string
  status: string
  payment_method: string
  receipt_number: string
  paid_at: string | null
  is_waived: boolean
  waived_by: string | null
  waived_at: string | null
  notes: string
  charged_by: string | null
  created_at: string
}

interface StudentChargesData {
  student_id: string
  reg_no: string
  student_name: string
  charges: AdHocCharge[]
  total_count: number
}

const CATEGORY_COLORS: Record<string, string> = {
  retake: "#e53935",
  registration: "#1565c0",
  service: "#6a1b9a",
  exam: "#00695c",
  application: "#e65100",
  tuition: "#283593",
  other: "#37474f",
}

const STATUS_COLOR: Record<string, "default" | "warning" | "success" | "error"> = {
  pending: "warning",
  completed: "success",
  failed: "error",
  cancelled: "default",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StudentChargesPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const axios = useAxios()

  const [data, setData] = useState<StudentChargesData | null>(null)
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdHocCharge | null>(null)
  const [waiveDialogOpen, setWaiveDialogOpen] = useState(false)
  const [waiveTarget, setWaiveTarget] = useState<AdHocCharge | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [fFeeHeadId, setFFeeHeadId] = useState("")
  const [fLabel, setFLabel] = useState("")
  const [fAmount, setFAmount] = useState("")
  const [fCurrency, setFFCurrency] = useState("UGX")
  const [fNotes, setFNotes] = useState("")
  const [fWaiveNotes, setFWaiveNotes] = useState("")

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false, msg: "", sev: "success",
  })

  const showSnack = (msg: string, sev: "success" | "error" = "success") =>
    setSnack({ open: true, msg, sev })

  // ---------------------------------------------------------------------------
  // Load data
  // ---------------------------------------------------------------------------
  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const [chargesRes, headsRes] = await Promise.all([
        axios.get(`/api/payments/admin/student/${studentId}/charges`),
        axios.get("/api/payments/fee_heads"),
      ])
      setData(chargesRes.data)
      setFeeHeads(headsRes.data)
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to load charges.")
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  // ---------------------------------------------------------------------------
  // Open dialogs
  // ---------------------------------------------------------------------------
  const openCreate = () => {
    setEditTarget(null)
    setFFeeHeadId("")
    setFLabel("")
    setFAmount("")
    setFFCurrency("UGX")
    setFNotes("")
    setDialogOpen(true)
  }

  const openEdit = (charge: AdHocCharge) => {
    setEditTarget(charge)
    setFFeeHeadId(charge.fee_head_id?.toString() || "")
    setFLabel(charge.label)
    setFAmount(charge.amount.toString())
    setFFCurrency(charge.currency)
    setFNotes(charge.notes)
    setDialogOpen(true)
  }

  const openWaive = (charge: AdHocCharge) => {
    setWaiveTarget(charge)
    setFWaiveNotes("")
    setWaiveDialogOpen(true)
  }

  // ---------------------------------------------------------------------------
  // Save charge (create / update)
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (!fFeeHeadId || !fLabel.trim() || !fAmount) {
      showSnack("Fee head, label and amount are required.", "error")
      return
    }
    setSaving(true)
    try {
      if (editTarget) {
        await axios.patch(`/api/payments/admin/charge/${editTarget.id}`, {
          fee_head_id: parseInt(fFeeHeadId),
          label: fLabel.trim(),
          amount: parseFloat(fAmount),
          currency: fCurrency,
          notes: fNotes,
        })
        showSnack("Charge updated.")
      } else {
        await axios.post(`/api/payments/admin/student/${studentId}/charges`, {
          fee_head_id: parseInt(fFeeHeadId),
          label: fLabel.trim(),
          amount: parseFloat(fAmount),
          currency: fCurrency,
          notes: fNotes,
        })
        showSnack("Charge created.")
      }
      setDialogOpen(false)
      load()
    } catch (e: any) {
      showSnack(e.response?.data?.detail || "Failed to save charge.", "error")
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Waive charge
  // ---------------------------------------------------------------------------
  const handleWaive = async () => {
    if (!waiveTarget) return
    setSaving(true)
    try {
      await axios.post(`/api/payments/admin/charge/${waiveTarget.id}/waive`, {
        notes: fWaiveNotes,
      })
      showSnack(`Charge '${waiveTarget.label}' waived.`)
      setWaiveDialogOpen(false)
      load()
    } catch (e: any) {
      showSnack(e.response?.data?.detail || "Failed to waive charge.", "error")
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Delete charge
  // ---------------------------------------------------------------------------
  const handleDelete = async (charge: AdHocCharge) => {
    if (!window.confirm(`Delete charge "${charge.label}"? This cannot be undone.`)) return
    try {
      await axios.delete(`/api/payments/admin/charge/${charge.id}`)
      showSnack("Charge deleted.")
      load()
    } catch (e: any) {
      showSnack(e.response?.data?.detail || "Failed to delete charge.", "error")
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress sx={{ color: "#3e397b" }} />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  const pendingTotal = data?.charges
    .filter(c => !c.is_waived && c.status === "pending")
    .reduce((s, c) => s + c.amount, 0) ?? 0

  const paidTotal = data?.charges
    .filter(c => !c.is_waived && c.status === "completed")
    .reduce((s, c) => s + c.amount, 0) ?? 0

  const currency = data?.charges[0]?.currency || "UGX"

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(n)

  // Group fee heads by category for dialog
  const headsByCategory: Record<string, FeeHead[]> = {}
  feeHeads.forEach(h => {
    if (!headsByCategory[h.category]) headsByCategory[h.category] = []
    headsByCategory[h.category].push(h)
  })

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <CustomButton
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          text="Back"
        />
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 2,
            background: "linear-gradient(135deg, #3e397b 0%, #5a4fa3 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ReceiptIcon sx={{ color: "white" }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#2d2960" }}>
            Student Charges
          </Typography>
          {data && (
            <Typography variant="body2" color="text.secondary">
              {data.student_name} &nbsp;·&nbsp; {data.reg_no}
            </Typography>
          )}
        </Box>
        <Box sx={{ flex: 1 }} />
        <CustomButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          text="Add Charge"
        />
      </Stack>

      {/* Summary cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
        <Card sx={{ minWidth: 180, background: "linear-gradient(135deg, #3e397b, #5a4fa3)", color: "white" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Total Charges</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{data?.charges.length ?? 0}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, background: "linear-gradient(135deg, #ff9800, #ffb74d)", color: "white" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Outstanding</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{fmt(pendingTotal)}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, background: "linear-gradient(135deg, #4caf50, #66bb6a)", color: "white" }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Settled</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{fmt(paidTotal)}</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Charges table */}
      <Card sx={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: 2 }}>
        <Box sx={{ p: 3, bgcolor: "#3e397b", color: "white", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Ad-Hoc Charges</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Individual charges billed to this student outside the standard fee schedule
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          {!data || data.charges.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <AccountBalanceIcon sx={{ fontSize: 48, color: "#bbb", mb: 1 }} />
              <Typography color="text.secondary">No ad-hoc charges for this student.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Label</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Charged By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.charges.map((c, idx) => (
                    <TableRow
                      key={c.id}
                      sx={{
                        bgcolor: c.is_waived
                          ? alpha("#f44336", 0.04)
                          : idx % 2 === 0 ? "transparent" : "#fafafa",
                        opacity: c.is_waived ? 0.65 : 1,
                        "&:hover": { bgcolor: alpha("#3e397b", 0.04) },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.label}
                        </Typography>
                        {c.is_waived && (
                          <Chip label="WAIVED" size="small" color="error" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.fee_head_name || "–"}
                          size="small"
                          sx={{
                            bgcolor: alpha(CATEGORY_COLORS[c.fee_head_category || "other"] || "#37474f", 0.12),
                            color: CATEGORY_COLORS[c.fee_head_category || "other"] || "#37474f",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {fmt(c.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          color={STATUS_COLOR[c.status] || "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {c.charged_by || "–"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(c.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 160, whiteSpace: "pre-wrap" }}>
                          {c.notes || "–"}
                        </Typography>
                        {c.is_waived && c.waived_by && (
                          <Typography variant="caption" color="error">
                            Waived by {c.waived_by}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {!c.is_waived && c.status === "pending" && (
                            <>
                              <CustomButton
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => openEdit(c)}
                                text="Edit"
                              />
                              <CustomButton
                                variant="outlined"
                                size="small"
                                startIcon={<BlockIcon />}
                                onClick={() => openWaive(c)}
                                text="Waive"
                              />
                              <CustomButton
                                variant="outlined"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDelete(c)}
                                text="Delete"
                              />
                            </>
                          )}
                          {!c.is_waived && c.status === "completed" && (
                            <CustomButton
                              variant="outlined"
                              size="small"
                              startIcon={<BlockIcon />}
                              onClick={() => openWaive(c)}
                              text="Waive"
                            />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#3e397b", color: "white", fontWeight: 700 }}>
          {editTarget ? "Edit Charge" : "Add Ad-Hoc Charge"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Fee Category *</InputLabel>
              <Select
                value={fFeeHeadId}
                label="Fee Category *"
                onChange={(e: SelectChangeEvent) => setFFeeHeadId(e.target.value)}
              >
                {Object.entries(headsByCategory).map(([cat, heads]) => [
                  <MenuItem key={`cat-${cat}`} disabled sx={{ fontWeight: 700, fontSize: 12, color: "#888", opacity: 1 }}>
                    — {cat.toUpperCase()} —
                  </MenuItem>,
                  ...heads.map(h => (
                    <MenuItem key={h.id} value={h.id.toString()}>
                      {h.name}
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>

            <TextField
              label="Label / Description *"
              fullWidth
              value={fLabel}
              onChange={e => setFLabel(e.target.value)}
              placeholder="e.g. Late registration penalty – Sem 1 2025/26"
              helperText="Appears on the student's finance page"
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Amount *"
                type="number"
                value={fAmount}
                onChange={e => setFAmount(e.target.value)}
                inputProps={{ min: 0, step: "any" }}
                sx={{ flex: 2 }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={fCurrency}
                  label="Currency"
                  onChange={(e: SelectChangeEvent) => setFFCurrency(e.target.value)}
                >
                  <MenuItem value="UGX">UGX</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Notes (optional)"
              fullWidth
              multiline
              rows={2}
              value={fNotes}
              onChange={e => setFNotes(e.target.value)}
              placeholder="Internal notes or reason for this charge"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CustomButton variant="outlined" onClick={() => setDialogOpen(false)} text="Cancel" />
          <CustomButton variant="contained" onClick={handleSave} disabled={saving}
            text={saving ? "Saving…" : editTarget ? "Save Changes" : "Create Charge"} />
        </DialogActions>
      </Dialog>

      {/* Waive Dialog */}
      <Dialog open={waiveDialogOpen} onClose={() => setWaiveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#c62828", color: "white", fontWeight: 700 }}>
          Waive Charge
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Waiving removes this charge from the student's outstanding balance. The record is kept for audit purposes.
          </Alert>
          {waiveTarget && (
            <Typography sx={{ mb: 2 }}>
              <strong>{waiveTarget.label}</strong> — {fmt(waiveTarget.amount)}
            </Typography>
          )}
          <TextField
            label="Reason for waiver (optional)"
            fullWidth
            multiline
            rows={2}
            value={fWaiveNotes}
            onChange={e => setFWaiveNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CustomButton variant="outlined" onClick={() => setWaiveDialogOpen(false)} text="Cancel" />
          <CustomButton variant="contained" onClick={handleWaive} disabled={saving}
            text={saving ? "Waiving…" : "Confirm Waive"} />
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  )
}
