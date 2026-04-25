import React, { useState } from "react"
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  People as PeopleIcon,
  Group as GroupIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import EnrollStudentsDialog from "./enroll_students_dialog"
import AssignLecturersDialog from "./assign_lecturers_dialog"
import EditCourseUnitDialog from "./edit_course_unit_dialog"

interface CourseUnit {
  id: number
  name: string
  code: string
  credit_units: number | null
  is_active?: boolean
  lecturers?: Array<{ id: number; name: string; email: string }>
  lecturers_names?: string[]
}

interface CourseUnitListProps {
  courseUnits: CourseUnit[]
  semesterId: number
  batchId: number
  onRefresh: () => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

const CourseUnitList: React.FC<CourseUnitListProps> = ({
  courseUnits,
  semesterId: _semesterId,
  batchId: _batchId,
  onRefresh,
  onError,
  onSuccess,
}) => {
  const AxiosInstance = useAxios()
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false)
  const [lecturersDialogOpen, setLecturersDialogOpen] = useState(false)
  const [selectedCourseUnit, setSelectedCourseUnit] = useState<{ id: number; name: string } | null>(null)
  const [editCourseUnit, setEditCourseUnit] = useState<CourseUnit | null>(null)

  const handleDelete = async (courseUnitId: number, name: string) => {
    if (!window.confirm(`Delete course unit "${name}"?`)) return
    try {
      await AxiosInstance.delete(
        `/api/courses/course_unit/${courseUnitId}/delete`
      )
      onSuccess("Course unit deleted successfully")
      onRefresh()
    } catch (e: any) {
      onError(e.response?.data?.detail || "Failed to delete course unit")
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      {courseUnits.map((courseUnit) => (
        <Box
          key={courseUnit.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2.5,
            mb: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#fafafa",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flex: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "linear-gradient(135deg, #3e397b 0%, #5a4fa3 100%)",
                background: "linear-gradient(135deg, #3e397b 0%, #5a4fa3 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(62, 57, 123, 0.2)",
              }}
            >
              <BookIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#2d2960" }}>
                  {courseUnit.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                  ({courseUnit.code})
                </Typography>
                {courseUnit.credit_units && (
                  <Chip
                    label={`${courseUnit.credit_units} CU`}
                    size="small"
                    sx={{
                      ml: 0.5,
                      height: 22,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      bgcolor: "rgba(62, 57, 123, 0.1)",
                      color: "#3e397b",
                    }}
                  />
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <PeopleIcon sx={{ fontSize: 14, color: "#999" }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {courseUnit.lecturers_names && courseUnit.lecturers_names.length > 0
                    ? `${courseUnit.lecturers_names.length} lecturer${courseUnit.lecturers_names.length !== 1 ? "s" : ""}: ${courseUnit.lecturers_names.slice(0, 2).join(", ")}${courseUnit.lecturers_names.length > 2 ? ` +${courseUnit.lecturers_names.length - 2} more` : ""}`
                    : courseUnit.lecturers && courseUnit.lecturers.length > 0
                    ? `${courseUnit.lecturers.length} lecturer${courseUnit.lecturers.length !== 1 ? "s" : ""}: ${courseUnit.lecturers.slice(0, 2).map(l => l.name).join(", ")}${courseUnit.lecturers.length > 2 ? ` +${courseUnit.lecturers.length - 2} more` : ""}`
                    : "No lecturers assigned"}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              size="small"
              startIcon={<PeopleIcon />}
              onClick={() => {
                setSelectedCourseUnit({
                  id: courseUnit.id,
                  name: `${courseUnit.name} (${courseUnit.code})`,
                })
                setLecturersDialogOpen(true)
              }}
              sx={{
                color: "#3e397b",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 1.5,
                px: 2,
                "&:hover": {
                  bgcolor: "rgba(62, 57, 123, 0.08)",
                },
              }}
            >
              Lecturers
            </Button>
            <Button
              size="small"
              startIcon={<GroupIcon />}
              onClick={() => {
                setSelectedCourseUnit({
                  id: courseUnit.id,
                  name: `${courseUnit.name} (${courseUnit.code})`,
                })
                setEnrollDialogOpen(true)
              }}
              sx={{
                color: "#4caf50",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 1.5,
                px: 2,
                "&:hover": {
                  bgcolor: "rgba(76, 175, 80, 0.08)",
                },
              }}
            >
              Students
            </Button>
            <IconButton
              size="small"
              onClick={() => setEditCourseUnit(courseUnit)}
              sx={{
                color: "#666",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                  color: "#3e397b",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(courseUnit.id, courseUnit.name)}
              sx={{
                color: "#d32f2f",
                "&:hover": {
                  bgcolor: "rgba(211, 47, 47, 0.08)",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ))}
      
      {/* Enroll Students Dialog */}
      <EditCourseUnitDialog
        open={editCourseUnit !== null}
        courseUnit={editCourseUnit}
        onClose={() => setEditCourseUnit(null)}
        onSaved={() => {
          onRefresh()
          onSuccess("Course unit updated")
        }}
        onError={onError}
      />

      {selectedCourseUnit && (
        <>
          <EnrollStudentsDialog
            open={enrollDialogOpen}
            onClose={() => {
              setEnrollDialogOpen(false)
              setSelectedCourseUnit(null)
            }}
            courseUnitId={selectedCourseUnit.id}
            courseUnitName={selectedCourseUnit.name}
            onSuccess={(message) => {
              onSuccess(message)
              onRefresh()
            }}
            onError={onError}
          />
          <AssignLecturersDialog
            open={lecturersDialogOpen}
            onClose={() => {
              setLecturersDialogOpen(false)
              setSelectedCourseUnit(null)
            }}
            courseUnitId={selectedCourseUnit.id}
            courseUnitName={selectedCourseUnit.name}
            onSuccess={(message) => {
              onSuccess(message)
              onRefresh()
            }}
            onError={onError}
          />
        </>
      )}
    </Box>
  )
}

export default CourseUnitList