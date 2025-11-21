// components/program/Manage.tsx
import React from "react"
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  type SelectChangeEvent,
} from "@mui/material"

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

interface FormData {
  name: string
  short_form: string
  code: string
  academic_level: number | null
  campuses: number[]
  faculty: number | null
  min_years: number | undefined
  max_years: number | undefined
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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
            onChange={(e) =>
              onFormChange({
                academic_level: Number(e.target.value),
              })
            }
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
            onChange={(e) => {
              const value = e.target.value
              onFormChange({ faculty: value })
            }}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={isLoading}>
          {isLoading
            ? editingId
              ? "Updating..."
              : "Adding..."
            : editingId
            ? "Update"
            : "Add"}{" "}
          Program
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Manage