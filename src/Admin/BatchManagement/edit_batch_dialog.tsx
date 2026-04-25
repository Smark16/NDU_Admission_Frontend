import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material"
import useAxios from "../../AxiosInstance/UseAxios"
import CustomButton from "../../ReUsables/custombutton"

interface Batch {
  id: number
  name: string
  academic_year?: string
  start_date: string
  end_date?: string | null
}

interface EditBatchDialogProps {
  open: boolean
  batch: Batch | null
  onClose: () => void
  onSaved: () => void
  onError: (msg: string) => void
}

const toDateInput = (s: string | null | undefined) =>
  s ? (s.length >= 10 ? s.slice(0, 10) : s) : ""

const EditBatchDialog: React.FC<EditBatchDialogProps> = ({
  open,
  batch,
  onClose,
  onSaved,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [academicYear, setAcademicYear] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (open && batch) {
      setName(batch.name)
      setAcademicYear(batch.academic_year ?? "")
      setStartDate(toDateInput(batch.start_date))
      setEndDate(toDateInput(batch.end_date))
    }
  }, [open, batch])

  const handleSave = async () => {
    if (!batch) return
    if (!name.trim() || !startDate) {
      onError("Name and start date are required")
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, string> = {
        name: name.trim(),
        academic_year: academicYear.trim(),
        start_date: startDate,
      }
      if (endDate) payload.end_date = endDate
      await AxiosInstance.put(`/api/program/batch/${batch.id}/update`, payload)
      onSaved()
      onClose()
    } catch (e: any) {
      onError(e.response?.data?.detail || "Failed to update batch")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit batch</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Batch name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Academic year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            fullWidth
            size="small"
            placeholder="e.g., 2024/2025"
            helperText="Used for examinations (Exam Group) and aligns with this cohort"
          />
          <TextField
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="End date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <CustomButton text="Cancel" variant="outlined" onClick={onClose} />
        <CustomButton
          text={saving ? "Saving…" : "Save"}
          onClick={handleSave}
          disabled={saving}
        />
      </DialogActions>
    </Dialog>
  )
}

export default EditBatchDialog
