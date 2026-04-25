// components/program/Manage.tsx
import React, { useCallback, useEffect, useState } from "react"
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  type SelectChangeEvent,
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AccountTree as SpecIcon,
} from "@mui/icons-material"
import CustomButton from "../../../ReUsables/custombutton"
import useAxios from "../../../AxiosInstance/UseAxios"

interface Campus {
  id: number
  name: string
}

interface Faculty {
  id: number
  name: string
}

interface AcademicLevel {
  id: number
  name: string
}

export interface FormData {
  name: string
  short_form: string
  code: string
  academic_level: number | null
  campuses: number[]
  faculty: number | null
  min_years: number | undefined
  max_years: number | undefined
  calendar_type: "semester" | "trimester"
  minimum_graduation_load: number | undefined
  has_specialization: boolean
  specialization_entry_year: number | undefined
  specialization_entry_term: number | undefined
  is_active: boolean
}

interface SpecializationRecord {
  id: number
  name: string
  is_active: boolean
}

interface ManageProps {
  open: boolean
  editingId: number | null
  formData: FormData
  campuses: Campus[]
  faculties: Faculty[]
  academicLevels: AcademicLevel[]
  isLoading: boolean
  onClose: () => void
  onSave: () => void
  onFormChange: (updates: Partial<FormData>) => void
  onCampusChange: (event: SelectChangeEvent<number[]>) => void
}

const Manage: React.FC<ManageProps> = ({
  open,
  editingId,
  formData,
  campuses,
  faculties,
  academicLevels,
  isLoading,
  onClose,
  onSave,
  onFormChange,
  onCampusChange,
}) => {
  const AxiosInstance = useAxios()
  const maxTerms = formData.calendar_type === "trimester" ? 3 : 2

  // ── Specialization names (only for existing programs) ─────────────────────
  const [specializations, setSpecializations] = useState<SpecializationRecord[]>([])
  const [specLoading, setSpecLoading] = useState(false)
  const [newSpecName, setNewSpecName] = useState("")
  const [specSaving, setSpecSaving] = useState(false)
  const [specError, setSpecError] = useState<string | null>(null)

  const fetchSpecializations = useCallback(async () => {
    if (!editingId) return
    setSpecLoading(true)
    try {
      const { data } = await AxiosInstance.get(`/api/program/program/${editingId}/specializations`)
      setSpecializations(data.specializations ?? [])
    } catch {
      // non-fatal
    } finally {
      setSpecLoading(false)
    }
  }, [editingId])

  useEffect(() => {
    if (open && editingId && formData.has_specialization) {
      fetchSpecializations()
    } else {
      setSpecializations([])
    }
  }, [open, editingId, formData.has_specialization])

  const handleAddSpecialization = async () => {
    const name = newSpecName.trim()
    if (!name || !editingId) return
    setSpecSaving(true)
    setSpecError(null)
    try {
      const { data } = await AxiosInstance.post(`/api/program/program/${editingId}/specializations`, { name })
      setSpecializations((prev) => [...prev, data])
      setNewSpecName("")
    } catch (e: any) {
      const err = e.response?.data
      setSpecError(
        typeof err === "string"
          ? err
          : err?.name?.[0] ?? err?.detail ?? err?.non_field_errors?.[0] ?? "Failed to add specialization"
      )
    } finally {
      setSpecSaving(false)
    }
  }

  const handleDeleteSpecialization = async (id: number) => {
    try {
      await AxiosInstance.delete(`/api/program/program/specialization/${id}`)
      setSpecializations((prev) => prev.filter((s) => s.id !== id))
    } catch {
      // ignore
    }
  }

  const handleClose = () => {
    setNewSpecName("")
    setSpecError(null)
    setSpecializations([])
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {editingId ? "Edit Program" : "Add New Program"}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          label="Program Name"
          value={formData.name}
          onChange={(e) => onFormChange({ name: e.target.value })}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Short Form"
          value={formData.short_form}
          onChange={(e) => onFormChange({ short_form: e.target.value })}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Program Code"
          value={formData.code}
          onChange={(e) => onFormChange({ code: e.target.value })}
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Academic Level</InputLabel>
          <Select
            value={formData.academic_level ?? ""}
            label="Academic Level"
            onChange={(e) => onFormChange({ academic_level: Number(e.target.value) })}
          >
            <MenuItem value="">None</MenuItem>
            {academicLevels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {level.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="campuses-label">Campuses</InputLabel>
          <Select
            labelId="campuses-label"
            multiple
            value={formData.campuses}
            onChange={onCampusChange}
            label="Campuses"
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as number[]).map((id) => {
                  const campus = campuses.find((c) => c.id === id)
                  return campus ? <Chip key={id} label={campus.name} size="small" /> : null
                })}
              </Box>
            )}
          >
            {campuses.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                <Checkbox checked={formData.campuses.includes(c.id)} />
                <span>{c.name}</span>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Faculty</InputLabel>
          <Select
            value={formData.faculty ?? ""}
            label="Faculty"
            onChange={(e) => onFormChange({ faculty: e.target.value as number | null })}
          >
            <MenuItem value="">None</MenuItem>
            {faculties.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Minimum Years"
          type="number"
          value={formData.min_years ?? ""}
          onChange={(e) => onFormChange({ min_years: e.target.value === "" ? undefined : Number(e.target.value) })}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Maximum Years"
          type="number"
          value={formData.max_years ?? ""}
          onChange={(e) => onFormChange({ max_years: e.target.value === "" ? undefined : Number(e.target.value) })}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Calendar Type</InputLabel>
          <Select
            value={formData.calendar_type}
            label="Calendar Type"
            onChange={(e) => onFormChange({ calendar_type: e.target.value as "semester" | "trimester" })}
          >
            <MenuItem value="semester">Semester (2 terms per year)</MenuItem>
            <MenuItem value="trimester">Trimester (3 terms per year)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Minimum Graduation Load (credit units)"
          type="number"
          value={formData.minimum_graduation_load ?? ""}
          onChange={(e) => onFormChange({ minimum_graduation_load: e.target.value === "" ? undefined : Number(e.target.value) })}
          margin="normal"
          inputProps={{ min: 0, step: 0.5 }}
          helperText="Total credit units required for graduation. Leave 0 if not yet determined."
        />

        {/* ── Active toggle ──────────────────────────────────────────────── */}
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_active}
              onChange={(e) => onFormChange({ is_active: e.target.checked })}
            />
          }
          label="Active"
          sx={{ mt: 2 }}
        />

        {/* ══════════════════════════════════════════════════════════════════
            Specialization Setup Section
        ══════════════════════════════════════════════════════════════════ */}
        <Divider sx={{ mt: 3, mb: 2 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <SpecIcon sx={{ color: "#3e397b" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#3e397b" }}>
            Specialization Setup
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={formData.has_specialization}
              onChange={(e) => onFormChange({ has_specialization: e.target.checked })}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                This programme has specialization tracks
              </Typography>
              <Typography variant="caption" color="text.secondary">
                e.g. Accounting, Marketing, Management
              </Typography>
            </Box>
          }
          sx={{ mb: 1 }}
        />

        {formData.has_specialization && (
          <Box sx={{ pl: 1 }}>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                label="Specialization Entry Year"
                type="number"
                value={formData.specialization_entry_year ?? ""}
                onChange={(e) => onFormChange({ specialization_entry_year: e.target.value === "" ? undefined : Number(e.target.value) })}
                inputProps={{ min: 1, max: formData.max_years ?? 6 }}
                helperText="Year when students choose their track"
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Entry Term"
                type="number"
                value={formData.specialization_entry_term ?? ""}
                onChange={(e) => onFormChange({ specialization_entry_term: e.target.value === "" ? undefined : Number(e.target.value) })}
                inputProps={{ min: 1, max: maxTerms }}
                helperText={`1 – ${maxTerms}`}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Specialization names — only for existing (saved) programs */}
            {editingId ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Specialization Names
                </Typography>

                {specLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    {specializations.length > 0 ? (
                      <List dense sx={{ border: "1px solid #e0e0e0", borderRadius: 1, mb: 1 }}>
                        {specializations.map((s) => (
                          <ListItem key={s.id} divider>
                            <ListItemText
                              primary={s.name}
                              primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                            />
                            <ListItemSecondaryAction>
                              <Tooltip title="Remove">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteSpecialization(s.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: "italic" }}>
                        No specializations defined yet.
                      </Typography>
                    )}

                    {specError && (
                      <Alert severity="error" sx={{ mb: 1 }} onClose={() => setSpecError(null)}>
                        {specError}
                      </Alert>
                    )}

                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <TextField
                        label="Add Specialization"
                        value={newSpecName}
                        onChange={(e) => setNewSpecName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSpecialization() } }}
                        size="small"
                        placeholder="e.g. Accounting"
                        sx={{ flex: 1 }}
                      />
                      <CustomButton
                        icon={<AddIcon />}
                        text={specSaving ? "Adding..." : "Add"}
                        size="small"
                        disabled={specSaving || !newSpecName.trim()}
                        onClick={handleAddSpecialization}
                      />
                    </Box>
                  </>
                )}
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 1 }} icon={false}>
                <Typography variant="caption">
                  Save the program first, then edit it to add specialization names.
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <CustomButton
          onClick={handleClose}
          text="Cancel"
          sx={{ borderColor: "#7c1519", color: "#7c1519" }}
          variant="outlined"
        />
        <CustomButton
          onClick={onSave}
          disabled={isLoading}
          text={
            isLoading
              ? editingId ? "Updating..." : "Adding..."
              : editingId ? "Update" : "Add"
          }
        />
      </DialogActions>
    </Dialog>
  )
}

export default Manage
