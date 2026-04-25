import React, { useEffect, useMemo, useState } from "react"
import { Alert, Autocomplete, Box, CircularProgress, Grid, TextField, Typography } from "@mui/material"
import CustomButton from "../../ReUsables/custombutton"
import useAxios from "../../AxiosInstance/UseAxios"
import type { CatalogCourseUnit } from "./useCourseCatalog"

interface AddCourseUnitFormProps {
  semesterId: number
  batchId: number
  existingCodes: string[]
  onSuccess: () => void
  onCancel: () => void
  onError: (message: string) => void
}

const norm = (s: string) => s.trim().toUpperCase()

const AddCourseUnitForm: React.FC<AddCourseUnitFormProps> = ({
  semesterId,
  batchId,
  existingCodes,
  onSuccess,
  onCancel,
  onError,
}) => {
  const AxiosInstance = useAxios()
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [options, setOptions] = useState<CatalogCourseUnit[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState<CatalogCourseUnit | null>(null)

  const optionsFiltered = useMemo(() => {
    const taken = new Set(existingCodes.map(norm))
    return options.filter((c) => c.is_active && !taken.has(norm(c.code)))
  }, [options, existingCodes])

  useEffect(() => {
    let cancelled = false

    const loadSuggestions = async () => {
      setLoading(true)
      setLoadError(null)
      setSelected(null)
      setOptions([])

      try {
        const res = await AxiosInstance.get(
          `/api/program/semester/${semesterId}/curriculum_suggestions`,
        )
        const suggestions = res.data?.suggestions ?? []
        const taken = new Set(existingCodes.map(norm))

        const mapped: CatalogCourseUnit[] = suggestions
          .filter((s: any) => !s.already_present)
          .map((s: any) => ({
            id: s.catalog_course_id,
            name: s.title,
            code: s.code,
            credit_units: s.credit_units != null ? Number(s.credit_units) : null,
            is_active: true,
          }))
          .filter((c: CatalogCourseUnit) => !taken.has(norm(c.code)))

        if (!cancelled) setOptions(mapped)
      } catch (e: any) {
        const detail = e.response?.data?.detail || e.response?.data?.message
        const msg = typeof detail === "string" ? detail : "Failed to load curriculum courses"
        if (!cancelled) setLoadError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadSuggestions()
    return () => {
      cancelled = true
    }
  }, [AxiosInstance, semesterId, batchId, existingCodes.join(",")])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) {
      onError("Select a course unit from the catalog")
      return
    }
    setIsSubmitting(true)
    try {
      await AxiosInstance.post(`/api/program/batch/${batchId}/subject/create`, {
        course_unit_id: selected.id,
        batch: batchId,
        semester: semesterId,
      })
      setSelected(null)
      onSuccess()
    } catch (e: any) {
      onError(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          "Failed to add course unit"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Choose curriculum courses for this semester position only.
      </Typography>
      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
          <CircularProgress size={22} />
          <Typography variant="body2">Loading curriculum blueprint…</Typography>
        </Box>
      ) : !loadError && optionsFiltered.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No curriculum courses found for this semester position (or they are already added).
        </Alert>
      ) : null}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Autocomplete
            options={optionsFiltered}
            loading={loading}
            value={selected}
            onChange={(_, v) => setSelected(v)}
            getOptionLabel={(o) => `${o.code} — ${o.name}`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} label="Course unit" placeholder="Search" size="small" required />
            )}
            filterOptions={(opts, state) => {
              const q = state.inputValue.trim().toLowerCase()
              if (!q) return opts
              return opts.filter(
                (o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q)
              )
            }}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "flex-end" }}>
        <CustomButton
          text="Cancel"
          onClick={onCancel}
          variant="outlined"
          sx={{ borderColor: "#3e397b", color: "#3e397b" }}
        />
        <CustomButton
          text={isSubmitting ? "Adding…" : "Add to semester"}
          type="submit"
          disabled={isSubmitting || loading || !!loadError || optionsFiltered.length === 0}
          sx={{ backgroundColor: "#3e397b", color: "#fff" }}
        />
      </Box>
    </Box>
  )
}

export default AddCourseUnitForm
