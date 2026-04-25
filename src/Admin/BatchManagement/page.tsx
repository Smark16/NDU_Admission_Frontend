"use client"

import React, { useEffect, useState } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material"
import { School as SchoolIcon } from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import ProgramBatchView from "./program_batch_view"
import SemesterTuitionMatrixCard from "./SemesterTuitionMatrixCard"

interface Program {
  id: number
  name: string
  short_form: string
  code: string
  faculty?: string
}

interface ProgramWithStructure extends Program {
  batches?: Batch[]
  total_batches?: number
  total_semesters?: number
  total_course_units?: number
}

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
  start_date: string
  end_date: string
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

const BatchManagement: React.FC = () => {
  const AxiosInstance = useAxios()
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithStructure | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    type: "success" | "error" | "info"
  }>({ open: false, message: "", type: "success" })

  // Fetch Programs
  const fetchPrograms = async () => {
    try {
      const response = await AxiosInstance.get("/api/program/list_programs")
      console.log("Programs response:", response.data)
      
      // Handle both array and paginated response
      const programsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || response.data.data || []
      
      setPrograms(programsData)
    } catch (e: any) {
      console.error("Failed to fetch programs", e)
      const errorMessage = e.response?.data?.detail || e.response?.data?.message || e.message || "Failed to load programs"
      console.error("Error details:", {
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
        url: "/api/program/list_programs"
      })
      setSnackbar({
        open: true,
        message: errorMessage,
        type: "error",
      })
    }
  }

  // Fetch Program with Structure
  const fetchProgramStructure = async (programId: number) => {
    setIsLoading(true)
    try {
      // Try the structure endpoint first
      try {
        const response = await AxiosInstance.get(
          `/api/program/program/${programId}/structure`
        )
        setSelectedProgram(response.data)
        return
      } catch (structureError: any) {
        // Log the actual error for debugging
        console.error("Structure endpoint error:", structureError)
        console.error("Error details:", {
          status: structureError.response?.status,
          data: structureError.response?.data,
          message: structureError.message,
          url: `/api/program/program/${programId}/structure`
        })
        
        // If structure endpoint doesn't exist or fails, create a basic structure
        const selectedProgram = programs.find(p => p.id === programId)
        if (!selectedProgram) {
          throw new Error("Program not found")
        }

        // Create a basic structure with empty batches
        // This allows users to still create batches even if the endpoint doesn't exist
        setSelectedProgram({
          ...selectedProgram,
          batches: [],
          total_batches: 0,
          total_semesters: 0,
          total_course_units: 0,
        })

        // Show appropriate message based on error type
        const errorStatus = structureError.response?.status
        const errorData = structureError.response?.data
        let errorMessage = "Note: Backend structure endpoint not available. You can still create batches, but existing batches won't be displayed until the endpoint is implemented."
        
        if (errorStatus === 404) {
          errorMessage = "Structure endpoint not found. The backend may need to be updated. You can still create new batches."
        } else if (errorStatus === 401 || errorStatus === 403) {
          errorMessage = "Authentication required. Please log in again."
        } else if (errorStatus === 500) {
          // Show detailed error from backend if available
          const backendDetail = errorData?.detail || errorData?.message || errorData?.error
          if (backendDetail) {
            errorMessage = `${backendDetail}. You can still create new batches.`
          } else {
            errorMessage = "Backend error occurred. Check server logs. You can still create new batches."
          }
          // Log full error details for debugging
          console.error("Full error response:", {
            status: errorStatus,
            data: errorData,
            errorType: errorData?.error_type,
            traceback: errorData?.traceback,
            errors: errorData?.errors
          })
          if (errorData?.traceback) {
            console.error("Backend traceback:", errorData.traceback)
          }
          if (errorData?.errors) {
            console.error("Import errors:", errorData.errors)
          }
        } else if (structureError.code === 'ERR_NETWORK') {
          errorMessage = "Cannot connect to backend. Make sure the server is running on port 8001."
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          type: errorStatus === 500 ? "error" : "info",
        })
      }
    } catch (e: any) {
      console.error("Failed to fetch program structure", e)
      setSnackbar({
        open: true,
        message: e.response?.data?.detail || "Failed to load program. You can still create new batches.",
        type: "error",
      })
      // Set a basic program structure so user can still create batches
      const selectedProgram = programs.find(p => p.id === programId)
      if (selectedProgram) {
        setSelectedProgram({
          ...selectedProgram,
          batches: [],
          total_batches: 0,
          total_semesters: 0,
          total_course_units: 0,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrograms()
  }, [])

  useEffect(() => {
    if (selectedProgramId) {
      fetchProgramStructure(selectedProgramId)
    } else {
      setSelectedProgram(null)
    }
  }, [selectedProgramId])

  const handleProgramChange = (programId: number) => {
    setSelectedProgramId(programId)
  }

  const handleRefresh = () => {
    if (selectedProgramId) {
      fetchProgramStructure(selectedProgramId)
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 32, color: "#3e397b" }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Batches, courses &amp; registration
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Program batches and semesters, link course units from the catalog, enroll students, assign lecturers, promote
          or detain cohorts, and set per-semester tuition for the selected batch. For a full-screen fee matrix use{" "}
          <strong>Fees &amp; tuition → Semester tuition</strong>.
        </Typography>
      </Box>

      {/* Program Selector */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl fullWidth>
            <InputLabel>Select Program to Manage Batches</InputLabel>
            <Select
              value={selectedProgramId || ""}
              label="Select Program to Manage Batches"
              onChange={(e) => handleProgramChange(Number(e.target.value))}
            >
              {programs.map((program) => (
                <MenuItem key={program.id} value={program.id}>
                  {program.name} ({program.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {!selectedProgramId && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              💡 <strong>Tip:</strong> Select a program above to view and manage its batches, semesters, and course units. 
              You can create new batches, semesters, and course units once a program is selected.
            </Typography>
          </Box>
        )}
      </Card>

      {/* Program Structure View */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : selectedProgram ? (
        <>
          <ProgramBatchView
            program={selectedProgram}
            onRefresh={handleRefresh}
            onError={(message) =>
              setSnackbar({ open: true, message, type: "error" })
            }
            onSuccess={(message) =>
              setSnackbar({ open: true, message, type: "success" })
            }
          />
          <SemesterTuitionMatrixCard
            programId={selectedProgramId}
            batches={(selectedProgram.batches ?? []).map((b) => ({
              id: b.id,
              name: b.name,
              academic_year: b.academic_year,
            }))}
            onMessage={(message, severity) =>
              setSnackbar({ open: true, message, type: severity })
            }
          />
        </>
      ) : (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="textSecondary">
            Please select a program to view its batch structure
          </Typography>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default BatchManagement

