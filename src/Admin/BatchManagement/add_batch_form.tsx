import React, { useState } from "react"
import { Box, TextField, Grid } from "@mui/material"
import CustomButton from "../../ReUsables/custombutton"
import useAxios from "../../AxiosInstance/UseAxios"

interface AddBatchFormProps {
  programId: number
  onSuccess: () => void
  onCancel: () => void
  onError: (message: string) => void
}

/** Matches admissions `get_current_academic_year` (Aug → new year). */
function defaultAcademicYearLabel(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  if (m >= 8) return `${y}/${y + 1}`
  return `${y - 1}/${y}`
}

const AddBatchForm: React.FC<AddBatchFormProps> = ({
  programId,
  onSuccess,
  onCancel,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    academic_year: defaultAcademicYearLabel(),
    start_date: "",
    end_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.academic_year.trim() || !formData.start_date) {
      onError("Please fill in batch name, academic year, and start date")
      return
    }

    // Validate date format and ensure end_date is after start_date if provided
    if (formData.end_date && formData.start_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      if (end < start) {
        onError("End date must be after start date")
        return
      }
    }

    setIsSubmitting(true)
    try {
      const payload: Record<string, string> = {
        name: formData.name.trim(),
        academic_year: formData.academic_year.trim(),
        start_date: formData.start_date,
      }
      
      // Only include end_date if provided
      if (formData.end_date) {
        payload.end_date = formData.end_date
      }
      
      console.log("Creating batch with payload:", payload)
      console.log("Program ID:", programId)
      console.log("Request URL:", `/api/program/program/${programId}/batch/create`)
      
      const response = await AxiosInstance.post(`/api/program/program/${programId}/batch/create`, payload)
      
      console.log("Response status:", response.status)
      console.log("Response data:", response.data)
      
      if (response.status === 201 || response.status === 200) {
        console.log("Batch created successfully:", response.data)
        console.log("Calling onSuccess callback")
        setFormData({
          name: "",
          academic_year: defaultAcademicYearLabel(),
          start_date: "",
          end_date: "",
        })
        // Small delay to ensure state updates
        setTimeout(() => {
          onSuccess()
        }, 100)
      } else {
        console.warn("Unexpected response status:", response.status)
        onError("Batch creation completed but with unexpected status")
      }
    } catch (e: any) {
      const errorData = e.response?.data || {}
      const errorMessage = errorData.detail || errorData.message || e.message || "Failed to create batch"
      
      console.error("Batch creation error:", {
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: errorData,
        requestUrl: `/api/program/program/${programId}/batch/create`,
        requestPayload: {
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
        },
        fullError: e
      })
      
      // Show detailed error if available
      let displayMessage = errorMessage
      
      // Handle different error formats
      if (typeof errorData === 'string') {
        displayMessage = errorData
      } else if (errorData.detail) {
        displayMessage = errorData.detail
      } else if (errorData.message) {
        displayMessage = errorData.message
      } else if (Array.isArray(errorData)) {
        displayMessage = errorData.join(', ')
      } else if (typeof errorData === 'object') {
        // Try to extract error from nested fields
        const errorFields = Object.keys(errorData)
        if (errorFields.length > 0) {
          const firstError = errorData[errorFields[0]]
          displayMessage = Array.isArray(firstError) ? firstError[0] : firstError
        }
      }
      
      if (errorData.traceback && import.meta.env.DEV) {
        console.error("Backend traceback:", errorData.traceback)
        displayMessage = `${displayMessage} (Check console for details)`
      }
      
      onError(displayMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box 
      component="form" 
      onSubmit={(e) => {
        e.preventDefault()
        console.log("Form submit event triggered")
        handleSubmit(e)
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Batch Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            size="small"
            placeholder="e.g., CLASS OF 2026-2029 AUG IN TAKE"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Academic year"
            value={formData.academic_year}
            onChange={(e) =>
              setFormData({ ...formData, academic_year: e.target.value })
            }
            required
            size="small"
            placeholder="e.g., 2024/2025"
            helperText="Used for examinations and reporting (same idea as Exam Group year)"
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
            label="End Date (Optional)"
            type="date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
            size="small"
            InputLabelProps={{ shrink: true }}
            helperText="Leave empty if batch has no end date"
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
          text={isSubmitting ? "Adding..." : "Add Batch"}
          type="submit"
          disabled={isSubmitting}
          sx={{ backgroundColor: "#ffc107", color: "#000" }}
        />
      </Box>
    </Box>
  )
}

export default AddBatchForm

