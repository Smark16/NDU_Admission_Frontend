import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material"
import useAxios from "../../AxiosInstance/UseAxios"
import CustomButton from "../../ReUsables/custombutton"

interface CourseUnit {
  id: number
  name: string
  code: string
  credit_units: number | null
  is_active?: boolean
}

interface EditCourseUnitDialogProps {
  open: boolean
  courseUnit: CourseUnit | null
  onClose: () => void
  onSaved: () => void
  onError: (msg: string) => void
}

const EditCourseUnitDialog: React.FC<EditCourseUnitDialogProps> = ({
  open,
  courseUnit,
  onClose,
  onSaved,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [creditUnits, setCreditUnits] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (open && courseUnit) {
      setName(courseUnit.name)
      setCode(courseUnit.code)
      setCreditUnits(courseUnit.credit_units)
      setIsActive(courseUnit.is_active !== false)
    }
  }, [open, courseUnit])

  const handleSave = async () => {
    if (!courseUnit) return
    if (!name.trim() || !code.trim()) {
      onError("Name and code are required")
      return
    }
    setSaving(true)
    try {
      await AxiosInstance.put(`/api/courses/update_course_unit/${courseUnit.id}`, {
        name: name.trim(),
        code: code.trim(),
        credit_units: creditUnits,
        is_active: isActive,
      })
      onSaved()
      onClose()
    } catch (e: any) {
      onError(e.response?.data?.detail || "Failed to update course unit")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit course unit</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            size="small"
            required
          />
          <TextField
            label="Credit units"
            type="number"
            value={creditUnits ?? ""}
            onChange={(e) =>
              setCreditUnits(e.target.value === "" ? null : Number(e.target.value))
            }
            fullWidth
            size="small"
            inputProps={{ min: 0, step: 0.5 }}
          />
          <FormControlLabel
            control={
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            }
            label="Active"
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

export default EditCourseUnitDialog
