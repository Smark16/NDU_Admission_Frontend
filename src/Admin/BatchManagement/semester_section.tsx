import React, { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Alert,
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
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
} from "@mui/icons-material"
import CourseUnitList from "./course_unit_list"
import AddCourseUnitForm from "./add_course_unit_form"
import LoadFromCurriculumDialog from "./LoadFromCurriculumDialog"
import StudentPromotionDialog from "./student_promotion_dialog"
import EditSemesterDialog from "./edit_semester_dialog"
import CustomButton from "../../ReUsables/custombutton"
import useAxios from "../../AxiosInstance/UseAxios"

interface CourseUnit {
  id: number
  name: string
  code: string
  credit_units: number | null
  is_active?: boolean
  lecturers?: Array<{ id: number; name: string; email: string }>
  lecturers_names?: string[]
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

interface SemesterSectionProps {
  semester: Semester
  /** Next semester in batch sequence (same order as API). Null if this is the last semester. */
  nextSemester: Semester | null
  batchId: number
  onRefresh: () => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

const SemesterSection: React.FC<SemesterSectionProps> = ({
  semester,
  nextSemester,
  batchId,
  onRefresh,
  onError,
  onSuccess,
}) => {
  const AxiosInstance = useAxios()
  const [expanded, setExpanded] = useState(false)
  const [showAddCourseUnit, setShowAddCourseUnit] = useState(false)
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false)
  const [editSemesterOpen, setEditSemesterOpen] = useState(false)
  const [loadCurriculumOpen, setLoadCurriculumOpen] = useState(false)

  const hasCurriculumPosition =
    typeof semester.year_of_study === "number" &&
    typeof semester.term_number === "number"

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
    if (!window.confirm(`Delete semester "${semester.name}"?`)) return
    try {
      await AxiosInstance.delete(
        `/api/courses/batch/${batchId}/semester/${semester.id}/delete`
      )
      onSuccess("Semester deleted successfully")
      onRefresh()
    } catch (e: any) {
      onError(e.response?.data?.detail || "Failed to delete semester")
    }
  }

  return (
    <Card sx={{ mb: 2, border: "1px solid #e0e0e0", backgroundColor: "#fafafa" }}>
      <CardContent>
        {/* Semester Header */}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {semester.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                <Typography variant="body2" color="textSecondary">
                  {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
                </Typography>
                <Chip
                  label={`${semester.course_units?.length || 0} course units`}
                  size="small"
                  variant="outlined"
                />
                {semester.year_of_study && semester.term_number && (
                  <Chip
                    label={`Y${semester.year_of_study} T${semester.term_number}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    title="Curriculum position (Year / Term)"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton
              text="Load from Curriculum"
              startIcon={<MenuBookIcon />}
              onClick={(e) => {
                e.stopPropagation()
                setLoadCurriculumOpen(true)
              }}
              variant="outlined"
              sx={{ borderColor: "#1565c0", color: "#1565c0", fontSize: "0.75rem", px: 1, py: 0.5 }}
            />
            <CustomButton
              text="Promote Students"
              startIcon={<SchoolIcon />}
              onClick={(e) => {
                e.stopPropagation()
                setPromotionDialogOpen(true)
              }}
              variant="outlined"
              sx={{ borderColor: "#4caf50", color: "#4caf50", fontSize: "0.75rem", px: 1, py: 0.5 }}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                setEditSemesterOpen(true)
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
          <Box sx={{ mt: 2, pl: 4 }}>
            {/* Course Units List */}
            {semester.course_units && semester.course_units.length > 0 ? (
              <CourseUnitList
                courseUnits={semester.course_units}
                semesterId={semester.id}
                batchId={batchId}
                onRefresh={onRefresh}
                onError={onError}
                onSuccess={onSuccess}
              />
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                No course units found
              </Typography>
            )}

            {/* Add Course Unit Form */}
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 2,
                backgroundColor: "#fff",
                mt: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: showAddCourseUnit ? 2 : 0,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Add Course Unit
                </Typography>
                <CustomButton
                  text={showAddCourseUnit ? "Cancel" : "+ Add"}
                  onClick={() => setShowAddCourseUnit(!showAddCourseUnit)}
                  variant={showAddCourseUnit ? "outlined" : "contained"}
                  sx={
                    showAddCourseUnit
                      ? { borderColor: "#3e397b", color: "#3e397b" }
                      : { backgroundColor: "#3e397b", color: "#fff" }
                  }
                  disabled={!hasCurriculumPosition && !showAddCourseUnit}
                />
              </Box>
              {!hasCurriculumPosition ? (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Set <b>Year of Study</b> and <b>Term Number</b> in Edit Semester first.
                  This unlocks the curriculum-based course options.
                </Alert>
              ) : (
                <Collapse in={showAddCourseUnit}>
                  <AddCourseUnitForm
                    semesterId={semester.id}
                    batchId={batchId}
                    existingCodes={(semester.course_units || []).map((u) => u.code)}
                    onSuccess={() => {
                      setShowAddCourseUnit(false)
                      onRefresh()
                      onSuccess("Course unit created successfully")
                    }}
                    onCancel={() => setShowAddCourseUnit(false)}
                    onError={onError}
                  />
                </Collapse>
              )}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
      
      {/* Student Promotion Dialog */}
      <StudentPromotionDialog
        open={promotionDialogOpen}
        onClose={() => setPromotionDialogOpen(false)}
        semesterId={semester.id}
        semesterName={semester.name}
        nextSemesterName={nextSemester?.name}
        canPromote={!!nextSemester}
        onSuccess={(message) => {
          onSuccess(message)
          onRefresh()
        }}
        onError={onError}
      />
      <EditSemesterDialog
        open={editSemesterOpen}
        batchId={batchId}
        semester={semester}
        onClose={() => setEditSemesterOpen(false)}
        onSaved={() => {
          onRefresh()
          onSuccess("Semester updated")
        }}
        onError={onError}
      />
      <LoadFromCurriculumDialog
        open={loadCurriculumOpen}
        semesterId={semester.id}
        semesterName={semester.name}
        batchId={batchId}
        yearOfStudy={semester.year_of_study}
        termNumber={semester.term_number}
        onClose={() => setLoadCurriculumOpen(false)}
        onLoaded={() => {
          setLoadCurriculumOpen(false)
          onRefresh()
        }}
        onError={onError}
        onSuccess={onSuccess}
      />
    </Card>
  )
}

export default SemesterSection

