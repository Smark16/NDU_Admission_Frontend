import React, { useEffect, useState } from "react"
import { Box, TextField, Grid } from "@mui/material"
import CustomButton from "../../ReUsables/custombutton"
import useAxios from "../../AxiosInstance/UseAxios"

interface AddSemesterFormProps {
  batchId: number
  /** Next free order number (avoids duplicate order when adding semester 2, 3, …) */
  suggestedOrder?: number
  /** Program max years — used to cap the year_of_study field */
  programMaxYears?: number
  /** 'semester' (2 terms/year) | 'trimester' (3 terms/year) */
  programCalendarType?: "semester" | "trimester"
  onSuccess: () => void
  onCancel: () => void
  onError: (message: string) => void
}

const AddSemesterForm: React.FC<AddSemesterFormProps> = ({
  batchId,
  suggestedOrder = 1,
  programMaxYears = 6,
  programCalendarType = "semester",
  onSuccess,
  onCancel,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const maxTerms = programCalendarType === "trimester" ? 3 : 2
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    order: suggestedOrder,
    year_of_study: "" as number | "",
    term_number: "" as number | "",
  })

  useEffect(() => {
    setFormData((prev) => ({ ...prev, order: suggestedOrder }))
  }, [batchId, suggestedOrder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.start_date || !formData.end_date) {
      onError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: Record<string, string | number> = {
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        order: formData.order,
        batch: batchId,
      }
      if (formData.year_of_study !== "") payload.year_of_study_raw = formData.year_of_study
      if (formData.term_number !== "") payload.term_number_raw = formData.term_number

      await AxiosInstance.post(`/api/program/batch/${batchId}/semester/create`, payload)
      setFormData({ name: "", start_date: "", end_date: "", order: suggestedOrder, year_of_study: "", term_number: "" })
      onSuccess()
    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || e.response?.data?.message || e.message || "Failed to create semester"
      console.error("Semester creation error:", {
        status: e.response?.status,
        data: e.response?.data,
        message: errorMessage
      })
      onError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Semester Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            size="small"
            placeholder="e.g., Year 1 Semester 1"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
            required
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
            required
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: Number(e.target.value) })
            }
            size="small"
            inputProps={{ min: 1 }}
            helperText={`Sequence in batch (must be unique). Suggested: ${suggestedOrder}`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Year of Study"
            type="number"
            value={formData.year_of_study}
            onChange={(e) =>
              setFormData({ ...formData, year_of_study: e.target.value === "" ? "" : Number(e.target.value) })
            }
            size="small"
            inputProps={{ min: 1, max: programMaxYears }}
            helperText={`Curriculum position (1–${programMaxYears}). Optional.`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label={`Term Number (1–${maxTerms})`}
            type="number"
            value={formData.term_number}
            onChange={(e) =>
              setFormData({ ...formData, term_number: e.target.value === "" ? "" : Number(e.target.value) })
            }
            size="small"
            inputProps={{ min: 1, max: maxTerms }}
            helperText={`${programCalendarType === "trimester" ? "Trimester" : "Semester"} number within the year.`}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "flex-end" }}>
        <CustomButton
          text="Cancel"
          onClick={onCancel}
          variant="outlined"
          sx={{ borderColor: "#f57c00", color: "#f57c00" }}
        />
        <CustomButton
          text={isSubmitting ? "Adding..." : "Add Semester"}
          type="submit"
          disabled={isSubmitting}
          sx={{ backgroundColor: "#ffc107", color: "#000" }}
        />
      </Box>
    </Box>
  )
}

export default AddSemesterForm

