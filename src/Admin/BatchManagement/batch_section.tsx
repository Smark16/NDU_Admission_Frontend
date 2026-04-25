import React, { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  Chip,
} from "@mui/material"
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import SemesterSection from "./semester_section"
import AddSemesterForm from "./add_semester_form"
import EditBatchDialog from "./edit_batch_dialog"
import CustomButton from "../../ReUsables/custombutton"
import useAxios from "../../AxiosInstance/UseAxios"

interface Batch {
  id: number
  name: string
  academic_year?: string
  start_date: string
  end_date?: string
  semesters?: Semester[]
  total_semesters?: number
  total_course_units?: number
}

interface Semester {
  id: number
  name: string
  order?: number
  start_date: string
  end_date: string
  year_of_study?: number | null
  term_number?: number | null
  course_units?: CourseUnit[]
}

interface CourseUnit {
  id: number
  name: string
  code: string
  credit_units: number | null
  is_active?: boolean
  lecturers?: Array<{ id: number; name: string; email: string }>
  lecturers_names?: string[]
}

interface BatchSectionProps {
  batch: Batch
  programId: number
  onRefresh: () => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

const BatchSection: React.FC<BatchSectionProps> = ({
  batch,
  programId: _programId,
  onRefresh,
  onError,
  onSuccess,
}) => {
  const AxiosInstance = useAxios()
  const [expanded, setExpanded] = useState(false)
  const [showAddSemester, setShowAddSemester] = useState(false)
  const [editBatchOpen, setEditBatchOpen] = useState(false)

  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete batch "${batch.name}"?`)) return
    try {
      const response = await AxiosInstance.delete(`/api/program/batch/${batch.id}/delete`)
      onSuccess(response.data?.message || "Batch deleted successfully")
      onRefresh()
    } catch (e: any) {
      const errorMessage = e.response?.data?.detail || e.response?.data?.message || "Failed to delete batch"
      onError(errorMessage)
    }
  }

  return (
    <Card sx={{ mb: 2, border: "1px solid #e0e0e0" }}>
      <CardContent>
        {/* Batch Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <IconButton size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {batch.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 0.5, flexWrap: "wrap" }}>
                {batch.academic_year ? (
                  <Chip label={batch.academic_year} size="small" color="primary" variant="outlined" />
                ) : null}
                <Typography variant="body2" color="textSecondary">
                  {formatDate(batch.start_date)} - {formatDate(batch.end_date ?? "")}
                </Typography>
                <Chip
                  label={`${batch.total_semesters || 0} semesters`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${batch.total_course_units || 0} course units`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                setEditBatchOpen(true)
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Expanded Content */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, pl: 6 }}>
            {/* Semesters List */}
            {batch.semesters && batch.semesters.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                {batch.semesters.map((semester, index) => (
                  <SemesterSection
                    key={semester.id}
                    semester={semester}
                    nextSemester={batch.semesters![index + 1] ?? null}
                    batchId={batch.id}
                    onRefresh={onRefresh}
                    onError={onError}
                    onSuccess={onSuccess}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                No semesters found
              </Typography>
            )}

            {/* Add Semester Form */}
            <Card
              sx={{
                border: "2px dashed #ffc107",
                backgroundColor: "#fffbf0",
                p: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: showAddSemester ? 2 : 0,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#f57c00" }}
                >
                  Add New Semester
                </Typography>
                <CustomButton
                  text={showAddSemester ? "Cancel" : "+ Add Semester"}
                  onClick={() => setShowAddSemester(!showAddSemester)}
                  variant={showAddSemester ? "outlined" : "contained"}
                  sx={
                    showAddSemester
                      ? { borderColor: "#f57c00", color: "#f57c00" }
                      : { backgroundColor: "#ffc107", color: "#000" }
                  }
                />
              </Box>
              <Collapse in={showAddSemester}>
                <AddSemesterForm
                  batchId={batch.id}
                  suggestedOrder={
                    Math.max(0, ...(batch.semesters ?? []).map((s) => s.order ?? 0)) + 1
                  }
                  onSuccess={() => {
                    setShowAddSemester(false)
                    onRefresh()
                    onSuccess("Semester created successfully")
                  }}
                  onCancel={() => setShowAddSemester(false)}
                  onError={onError}
                />
              </Collapse>
            </Card>
          </Box>
        </Collapse>
      </CardContent>
      <EditBatchDialog
        open={editBatchOpen}
        batch={batch}
        onClose={() => setEditBatchOpen(false)}
        onSaved={() => {
          onRefresh()
          onSuccess("Batch updated")
        }}
        onError={onError}
      />
    </Card>
  )
}

export default BatchSection

