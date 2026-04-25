/**
 * Admin: Fee Head / Fee Category Management
 *
 * Staff can create, edit, and deactivate fee categories (FeeHeads).
 * These are the types used when billing ad-hoc charges to individual students
 * e.g. "Retake Fee", "Late Registration", "Accommodation Adjustment".
 *
 * Route: /admin/fees-payments/fee-heads
 */

import { useEffect, useState, useCallback } from "react"
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
  FormHelperText,
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
  Add as AddIcon,
  Edit as EditIcon,
  Block as DeactivateIcon,
  CheckCircle as ActivateIcon,
  Category as CategoryIcon,
} from "@mui/icons-material"
import useAxios from "../../../AxiosInstance/UseAxios"
import CustomButton from "../../../ReUsables/custombutton"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FeeHead {
  id: number
  code: string
  name: string
  category: string
  category_display: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { value: "tuition",      label: "Tuition" },
  { value: "registration", label: "Registration" },
  { value: "retake",       label: "Retake / Resit" },
  { value: "exam",         label: "Examination" },
  { value: "service",      label: "Service / Administrative" },
  { value: "application",  label: "Application" },
  { value: "other",        label: "Other" },
]

const CATEGORY_COLORS: Record<string, string> = {
  tuition:      "#283593",
  registration: "#1565c0",
  retake:       "#b71c1c",
  exam:         "#00695c",
  service:      "#6a1b9a",
  application:  "#e65100",
  other:        "#37474f",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeeHeadsPage() {
  const axios = useAxios()
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<FeeHead | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [fCode, setFCode] = useState("")
  const [fName, setFName] = useState("")
  const [fCategory, setFCategory] = useState("other")
  const [fDescription, setFDescription] = useState("")

  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false, msg: "", sev: "success",
  })
  const showSnack = (msg: string, sev: "success" | "error" = "success") =>
    setSnack({ open: true, msg, sev })

  // ---------------------------------------------------------------------------
  // Load
  // ---------------------------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get("/api/payments/fee_heads?all=true")
      setFeeHeads(res.data)
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to load fee categories.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ---------------------------------------------------------------------------
  // Dialog helpers
  // ---------------------------------------------------------------------------
  const openCreate = () => {
    setEditTarget(null)
    setFCode("")
    setFName("")
    setFCategory("other")
    setFDescription("")
    setDialogOpen(true)
  }

  const openEdit = (h: FeeHead) => {
    setEditTarget(h)
    setFCode(h.code)
    setFName(h.name)
    setFCategory(h.category)
    setFDescription(h.description)
    setDialogOpen(true)
  }

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (!fCode.trim() || !fName.trim()) {
      showSnack("Code and name are required.", "error")
      return
    }
    setSaving(true)
    try {
      if (editTarget) {
        await axios.patch(`/api/payments/fee_heads/${editTarget.id}`, {
          code: fCode.trim().toUpperCase(),
          name: fName.trim(),
          category: fCategory,
          description: fDescription.trim(),
        })
        showSnack("Fee category updated.")
      } else {
        await axios.post("/api/payments/fee_heads", {
          code: fCode.trim().toUpperCase(),
          name: fName.trim(),
          category: fCategory,
          description: fDescription.trim(),
        })
        showSnack("Fee category created.")
      }
      setDialogOpen(false)
      load()
    } catch (e: any) {
      showSnack(e.response?.data?.detail || "Failed to save.", "error")
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Toggle active
  // ---------------------------------------------------------------------------
  const handleToggleActive = async (h: FeeHead) => {
    try {
      if (h.is_active) {
        await axios.delete(`/api/payments/fee_heads/${h.id}`)
        showSnack(`"${h.name}" deactivated.`)
      } else {
        await axios.patch(`/api/payments/fee_heads/${h.id}`, { is_active: true })
        showSnack(`"${h.name}" reactivated.`)
      }
      load()
    } catch (e: any) {
      showSnack(e.response?.data?.detail || "Action failed.", "error")
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

  const active = feeHeads.filter(h => h.is_active)
  const inactive = feeHeads.filter(h => !h.is_active)

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 2,
            background: "linear-gradient(135deg, #3e397b 0%, #5a4fa3 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <CategoryIcon sx={{ color: "white" }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#2d2960" }}>
            Fee Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the charge types available when billing individual students
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <CustomButton
          variant="contained"
          icon={<AddIcon />}
          onClick={openCreate}
          text="New Category"
        />
      </Stack>

      {/* Summary */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ minWidth: 150, background: "linear-gradient(135deg, #3e397b, #5a4fa3)", color: "white" }}>
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Active</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{active.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150, background: "linear-gradient(135deg, #757575, #9e9e9e)", color: "white" }}>
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>Inactive</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{inactive.length}</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Table */}
      <Card sx={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: 2 }}>
        <Box sx={{ p: 3, bgcolor: "#3e397b", color: "white", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>All Fee Categories</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            These categories appear in the dropdown when billing a student
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          {feeHeads.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CategoryIcon sx={{ fontSize: 48, color: "#bbb", mb: 1 }} />
              <Typography color="text.secondary">No fee categories yet. Create one to start billing students.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeHeads.map((h, idx) => (
                    <TableRow
                      key={h.id}
                      sx={{
                        opacity: h.is_active ? 1 : 0.5,
                        bgcolor: idx % 2 === 0 ? "transparent" : "#fafafa",
                        "&:hover": { bgcolor: alpha("#3e397b", 0.04) },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            bgcolor: alpha("#3e397b", 0.08),
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            display: "inline-block",
                          }}
                        >
                          {h.code}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{h.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={h.category_display}
                          size="small"
                          sx={{
                            bgcolor: alpha(CATEGORY_COLORS[h.category] || "#37474f", 0.12),
                            color: CATEGORY_COLORS[h.category] || "#37474f",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {h.description || "–"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={h.is_active ? "Active" : "Inactive"}
                          color={h.is_active ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <CustomButton
                            variant="outlined"
                            size="small"
                            icon={<EditIcon fontSize="small" />}
                            text="Edit"
                            onClick={() => openEdit(h)}
                            sx={{ fontSize: "0.75rem" }}
                          />
                          <CustomButton
                            variant="outlined"
                            size="small"
                            icon={h.is_active ? <DeactivateIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
                            text={h.is_active ? "Deactivate" : "Reactivate"}
                            onClick={() => handleToggleActive(h)}
                            sx={{
                              fontSize: "0.75rem",
                              borderColor: h.is_active ? "#b71c1c" : "#2e7d32",
                              color: h.is_active ? "#b71c1c" : "#2e7d32",
                            }}
                          />
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
          {editTarget ? "Edit Fee Category" : "New Fee Category"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Code *"
                value={fCode}
                onChange={e => setFCode(e.target.value.toUpperCase())}
                helperText="Unique short code e.g. LATE_REG, RETAKE_FEE"
                sx={{ flex: 1 }}
                inputProps={{ style: { fontFamily: "monospace", fontWeight: 700 } }}
              />
              <FormControl sx={{ flex: 2 }}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={fCategory}
                  label="Category *"
                  onChange={(e: SelectChangeEvent) => setFCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 10, height: 10, borderRadius: "50%",
                            bgcolor: CATEGORY_COLORS[c.value] || "#37474f",
                          }}
                        />
                        <span>{c.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Groups similar charge types together</FormHelperText>
              </FormControl>
            </Stack>

            <TextField
              label="Name *"
              fullWidth
              value={fName}
              onChange={e => setFName(e.target.value)}
              placeholder="e.g. Late Registration Penalty"
            />

            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              value={fDescription}
              onChange={e => setFDescription(e.target.value)}
              placeholder="When this charge applies, any relevant policy details"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CustomButton variant="outlined" onClick={() => setDialogOpen(false)} text="Cancel" />
          <CustomButton
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            text={saving ? "Saving…" : editTarget ? "Save Changes" : "Create Category"}
          />
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
