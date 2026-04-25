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

interface Semester {
  id: number
  name: string
  order?: number
  start_date: string
  end_date?: string | null
  year_of_study?: number | null
  term_number?: number | null
}

interface EditSemesterDialogProps {
  open: boolean
  batchId: number
  semester: Semester | null
  onClose: () => void
  onSaved: () => void
  onError: (msg: string) => void
}

const toDateInput = (s: string | null | undefined) =>
  s ? (s.length >= 10 ? s.slice(0, 10) : s) : ""

const EditSemesterDialog: React.FC<EditSemesterDialogProps> = ({
  open,
  batchId,
  semester,
  onClose,
  onSaved,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [order, setOrder] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [yearOfStudy, setYearOfStudy] = useState<number | "">("")
  const [termNumber, setTermNumber] = useState<number | "">("")

  useEffect(() => {
    if (open && semester) {
      setName(semester.name)
      setOrder(semester.order ?? 1)
      setStartDate(toDateInput(semester.start_date))
      setEndDate(toDateInput(semester.end_date))
      setYearOfStudy(semester.year_of_study ?? "")
      setTermNumber(semester.term_number ?? "")
    }
  }, [open, semester])

  const handleSave = async () => {
    if (!semester) return
    if (!name.trim() || !startDate) {
      onError("Name and start date are required")
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, string | number | null> = {
        name: name.trim(),
        order,
        start_date: startDate,
      }
      if (endDate) payload.end_date = endDate
      payload.year_of_study = yearOfStudy !== "" ? yearOfStudy : null
      payload.term_number = termNumber !== "" ? termNumber : null
      await AxiosInstance.put(
        `/api/program/batch/${batchId}/semester/${semester.id}/update`,
        payload
      )
      onSaved()
      onClose()
    } catch (e: any) {
      onError(e.response?.data?.detail || "Failed to update semester")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit semester</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Semester name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
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
          <TextField
            label="Year of Study"
            type="number"
            value={yearOfStudy}
            onChange={(e) => setYearOfStudy(e.target.value === "" ? "" : Number(e.target.value))}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
            helperText="Curriculum position — which academic year this semester belongs to (optional)."
          />
          <TextField
            label="Term Number"
            type="number"
            value={termNumber}
            onChange={(e) => setTermNumber(e.target.value === "" ? "" : Number(e.target.value))}
            fullWidth
            size="small"
            inputProps={{ min: 1, max: 3 }}
            helperText="Term within the year: 1 or 2 for semester-based; 1, 2, or 3 for trimester (optional)."
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

export default EditSemesterDialog
