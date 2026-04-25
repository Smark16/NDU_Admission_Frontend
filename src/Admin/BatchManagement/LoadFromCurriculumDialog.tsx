/**
 * LoadFromCurriculumDialog
 * Fetches curriculum suggestions for a semester (courses that belong here per
 * the programme blueprint but aren't yet added as CourseUnits) and lets the
 * admin load them in one click.
 *
 * API:
 *   GET  /api/program/semester/<id>/curriculum_suggestions
 *   POST /api/program/batch/<batchId>/subject/create   (one call per course)
 */
import React, { useEffect, useState } from "react"
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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import {
  CheckCircle as CheckCircleIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material"
import CustomButton from "../../ReUsables/custombutton"
import useAxios from "../../AxiosInstance/UseAxios"

interface Suggestion {
  curriculum_line_id: number
  catalog_course_id: number
  code: string
  title: string
  credit_units: string
  course_type: "mandatory" | "elective"
  elective_group: string | null
  already_present: boolean
}

interface SuggestionsResponse {
  semester_name: string
  year_of_study: number
  term_number: number
  program_name: string
  total_curriculum_lines: number
  total_already_present: number
  total_missing: number
  suggestions: Suggestion[]
}

interface LoadFromCurriculumDialogProps {
  open: boolean
  semesterId: number
  semesterName: string
  batchId: number
  /** semester must have year_of_study + term_number set */
  yearOfStudy: number | null | undefined
  termNumber: number | null | undefined
  onClose: () => void
  onLoaded: () => void
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
}

const LoadFromCurriculumDialog: React.FC<LoadFromCurriculumDialogProps> = ({
  open,
  semesterId,
  semesterName,
  batchId,
  yearOfStudy,
  termNumber,
  onClose,
  onLoaded,
  onError,
  onSuccess,
}) => {
  const AxiosInstance = useAxios()

  const [fetching, setFetching] = useState(false)
  const [data, setData] = useState<SuggestionsResponse | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  // Fetch suggestions whenever dialog opens
  useEffect(() => {
    if (!open) return
    setData(null)
    setFetchError(null)
    setDone(false)
    setProgress(0)

    if (!yearOfStudy || !termNumber) {
      setFetchError(
        "This semester has no curriculum position (Year / Term) set. " +
        "Edit the semester and set the Year of Study and Term Number first, " +
        "then try again."
      )
      return
    }

    setFetching(true)
    AxiosInstance.get(`/api/program/semester/${semesterId}/curriculum_suggestions`)
      .then(({ data: d }) => setData(d))
      .catch((e) => {
        const msg = e.response?.data?.detail || "Failed to load curriculum suggestions"
        setFetchError(msg)
      })
      .finally(() => setFetching(false))
  }, [open, semesterId, yearOfStudy, termNumber])

  const missing = data?.suggestions.filter((s) => !s.already_present) ?? []
  const alreadyPresent = data?.suggestions.filter((s) => s.already_present) ?? []
  const blueprintTotal = data?.total_curriculum_lines ?? 0

  const handleLoad = async () => {
    if (missing.length === 0) return
    setLoading(true)
    setProgress(0)

    let added = 0
    let failed = 0

    for (let i = 0; i < missing.length; i++) {
      const s = missing[i]
      try {
        await AxiosInstance.post(`/api/program/batch/${batchId}/subject/create`, {
          course_unit_id: s.catalog_course_id,
          batch: batchId,
          semester: semesterId,
        })
        added++
      } catch {
        failed++
      }
      setProgress(Math.round(((i + 1) / missing.length) * 100))
    }

    setLoading(false)
    setDone(true)

    if (failed === 0) {
      onSuccess(`${added} course unit${added !== 1 ? "s" : ""} loaded from curriculum`)
    } else {
      onError(`${added} added, ${failed} failed — check for duplicates`)
    }
    onLoaded()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "#3e397b",
          color: "white",
        }}
      >
        <MenuBookIcon />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Load from Curriculum
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {semesterName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Loading spinner */}
        {fetching && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 3 }}>
            <CircularProgress size={24} />
            <Typography>Loading curriculum blueprint…</Typography>
          </Box>
        )}

        {/* Error */}
        {fetchError && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {fetchError}
          </Alert>
        )}

        {/* Results */}
        {data && !fetching && (
          <>
            {/* Summary */}
            <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="caption" color="textSecondary">Programme</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{data.program_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Blueprint total</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{data.total_curriculum_lines} courses</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Already in semester</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#2e7d32" }}>
                  {data.total_already_present}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">To be added</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: data.total_missing > 0 ? "#c62828" : "#2e7d32" }}>
                  {data.total_missing}
                </Typography>
              </Box>
            </Box>

            {/* Done state */}
            {done && (
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                Courses loaded successfully. Close this dialog and refresh to see them.
              </Alert>
            )}

            {/* Progress bar while loading */}
            {loading && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Adding courses… {progress}%
                </Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}

            {/* Nothing to add */}
            {missing.length === 0 && !loading && (
              blueprintTotal === 0 ? (
                <Alert severity="warning">
                  No curriculum blueprint lines exist for this semester position (Year/Term).
                  Update the programme curriculum mapping, then set the semester’s Year of Study and Term Number, and try again.
                </Alert>
              ) : (
                <Alert severity="info">
                  All curriculum courses for this semester are already added.
                </Alert>
              )
            )}

            {/* Courses to be added */}
            {missing.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#3e397b" }}>
                  Courses that will be added ({missing.length})
                </Typography>
                <Table size="small" sx={{ mb: 3 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Credits</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Group</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {missing.map((s) => (
                      <TableRow key={s.curriculum_line_id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                            {s.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{s.title}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{s.credit_units}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={s.course_type}
                            size="small"
                            sx={{
                              bgcolor: s.course_type === "mandatory" ? "#3e397b" : "#e3f2fd",
                              color: s.course_type === "mandatory" ? "white" : "#1565c0",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {s.elective_group ?? "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            {/* Already present (collapsed summary) */}
            {alreadyPresent.length > 0 && (
              <>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  Already in semester: {alreadyPresent.map((s) => s.code).join(", ")}
                </Typography>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <CustomButton
          variant="outlined"
          text="Close"
          onClick={onClose}
          sx={{ borderColor: "#7c1519", color: "#7c1519" }}
        />
        {missing.length > 0 && !done && (
          <CustomButton
            text={loading ? `Adding… ${progress}%` : `Load ${missing.length} Course${missing.length !== 1 ? "s" : ""}`}
            disabled={loading || fetching}
            onClick={handleLoad}
          />
        )}
      </DialogActions>
    </Dialog>
  )
}

export default LoadFromCurriculumDialog
