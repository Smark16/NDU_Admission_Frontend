import React, { useState, type ChangeEvent } from "react"
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
  Collapse,
  alpha,
} from "@mui/material"
import {
  AutoFixHigh as AutoSemIcon,
  CloudDownload as DownloadIcon,
  Edit as EditIcon,
  InfoOutlined as InfoIcon,
  UploadFile as UploadIcon,
} from "@mui/icons-material"
import BatchSection from "./batch_section"
import AddBatchForm from "./add_batch_form"
import CustomButton from "../../ReUsables/custombutton"
import BulkUpload from "../Faculty/Program/bulk_upload"
import useAxios from "../../AxiosInstance/UseAxios"

interface Program {
  id: number
  name: string
  short_form: string
  code: string
  faculty?: string
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

interface ProgramBatchViewProps {
  program: Program
  onRefresh: () => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

const ProgramBatchView: React.FC<ProgramBatchViewProps> = ({
  program,
  onRefresh,
  onError,
  onSuccess,
}) => {
  const axios = useAxios()

  // Show add batch form by default if no batches exist
  const [showAddBatch, setShowAddBatch] = useState(
    !program.batches || program.batches.length === 0
  )

  // Bulk upload state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [updateMode, setUpdateMode] = useState(false)
  const [isAutoCreating, setIsAutoCreating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  const handleAutoCreateSemesters = async () => {
    setIsAutoCreating(true)
    try {
      const res = await axios.post("/api/program/batches/auto_create_semesters", {
        program_id: program.id,
      })
      const d = res.data
      const batches: number = d.batches_processed ?? 0
      const sems: number = d.semesters_created ?? 0
      const skipped: number = d.skipped_already_have_semesters ?? 0
      const errs: string[] = d.errors ?? []

      if (batches === 0 && skipped > 0) {
        onSuccess(`All ${skipped} batch${skipped !== 1 ? "es" : ""} already have semesters.`)
      } else if (batches > 0) {
        onRefresh()
        const parts = [`${sems} term${sems !== 1 ? "s" : ""} created across ${batches} batch${batches !== 1 ? "es" : ""}`]
        if (skipped > 0) parts.push(`${skipped} already had semesters`)
        onSuccess(parts.join(". ") + ".")
      } else {
        onError("No batches found to process.")
      }

      if (errs.length > 0) {
        onError(`Some batches failed: ${errs.join("; ")}`)
      }
    } catch (err: any) {
      onError(err.response?.data?.detail || "Failed to auto-create semesters.")
    } finally {
      setIsAutoCreating(false)
    }
  }

  const handleTemplateDownload = async () => {
    try {
      const response = await axios.get("/api/program/batches/template", {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "batch_upload_template.xlsx")
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      onError("Failed to download template. Please try again.")
    }
  }

  const handleBulkUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(20)

    const formData = new FormData()
    formData.append("file", file)
    if (updateMode) formData.append("update_existing", "true")

    try {
      setUploadProgress(60)
      const response = await axios.post("/api/program/batches/bulk_upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setUploadProgress(100)
      const data = response.data
      const created: number = data.created ?? 0
      const updated: number = data.updated ?? 0

      setUploadResult({
        success: created + updated,
        failed: data.failed ?? 0,
        errors: data.errors ?? [],
      })

      if (created + updated > 0) {
        onRefresh()
        const parts: string[] = []
        if (created > 0) parts.push(`${created} batch${created !== 1 ? "es" : ""} created`)
        if (updated > 0) parts.push(`${updated} batch${updated !== 1 ? "es" : ""} updated`)
        const semCount: number = data.semesters_created ?? 0
        if (semCount > 0)
          parts.push(`${semCount} term${semCount !== 1 ? "s" : ""} auto-created`)
        onSuccess(parts.join(", ") + ".")
      }
    } catch (err: any) {
      setUploadResult({
        success: 0,
        failed: 1,
        errors: [err.response?.data?.detail || "Upload failed. Please check the file and try again."],
      })
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  return (
    <Box>

      {/* ── Bulk Upload Section — top of page ── */}
      <Card
        sx={{
          border: "2px solid #3e397b",
          backgroundColor: alpha("#3e397b", 0.03),
          p: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#3e397b", mb: 0.5 }}>
              Batch Bulk Upload
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Upload multiple batches at once using the Excel template.
              The template includes all programs in the system on a reference sheet.
              Each row becomes one batch — semesters can be added after.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label="program_code" variant="outlined" />
              <Chip size="small" label="batch_name" variant="outlined" />
              <Chip size="small" label="academic_year" variant="outlined" />
              <Chip size="small" label="start_date (YYYY-MM-DD)" variant="outlined" />
              <Chip size="small" label="end_date" variant="outlined" />
              <Chip size="small" label="is_active" variant="outlined" />
            </Stack>
          </Box>
          <Stack direction="column" spacing={1.5} alignItems="flex-end">
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <CustomButton
                variant="outlined"
                icon={<DownloadIcon />}
                text="Download Template"
                onClick={handleTemplateDownload}
                sx={{ borderColor: "#3e397b", color: "#3e397b", whiteSpace: "nowrap" }}
              />
              <CustomButton
                variant="contained"
                icon={<UploadIcon />}
                text="Upload Batches"
                onClick={() => { setUpdateMode(false); setBulkDialogOpen(true) }}
                sx={{ backgroundColor: "#3e397b", whiteSpace: "nowrap" }}
              />
              <CustomButton
                variant="outlined"
                icon={<EditIcon />}
                text="Update Existing"
                onClick={() => { setUpdateMode(true); setBulkDialogOpen(true) }}
                sx={{ borderColor: "#f57c00", color: "#f57c00", whiteSpace: "nowrap" }}
              />
              <CustomButton
                variant="outlined"
                icon={<AutoSemIcon />}
                text={isAutoCreating ? "Creating…" : "Auto-Create Semesters"}
                onClick={handleAutoCreateSemesters}
                disabled={isAutoCreating}
                sx={{ borderColor: "#2e7d32", color: "#2e7d32", whiteSpace: "nowrap" }}
              />
            </Stack>
            <Tooltip title="Update Existing: re-upload the same file to patch start_date, end_date, academic_year and is_active on batches that already exist. Semesters are not touched.">
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: "default" }}>
                <InfoIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {updateMode
                    ? "Update mode ON — existing batches will be patched"
                    : "Upload mode — only new batches will be created"}
                </Typography>
              </Stack>
            </Tooltip>
          </Stack>
        </Stack>
      </Card>

      <BulkUpload
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        result={uploadResult}
        onUpload={handleBulkUpload}
        onResetResult={() => setUploadResult(null)}
      />

      <Divider sx={{ mb: 3 }} />

      {/* Program Header */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #3e397b 0%, #5a4f9f 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {program.name}
                {program.short_form && ` - ${program.short_form}`}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {program.faculty || "NDEJJE UNIVERSITY"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {program.total_batches || 0}
                </Typography>
                <Typography variant="caption">batches</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {program.total_semesters || 0}
                </Typography>
                <Typography variant="caption">semesters</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {program.total_course_units || 0}
                </Typography>
                <Typography variant="caption">course units</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Batches List */}
      {program.batches && program.batches.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          {program.batches.map((batch) => (
            <BatchSection
              key={batch.id}
              batch={batch}
              programId={program.id}
              onRefresh={onRefresh}
              onError={onError}
              onSuccess={onSuccess}
            />
          ))}
        </Box>
      ) : (
        <Card sx={{ p: 3, mb: 3, textAlign: "center" }}>
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            No batches found for this program
          </Typography>
        </Card>
      )}

      {/* Add Batch Form - Always Visible */}
      <Card
        sx={{
          border: "2px solid #ffc107",
          backgroundColor: showAddBatch ? "#fffbf0" : "#fff9e6",
          p: 2,
          boxShadow: showAddBatch ? 3 : 1,
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: showAddBatch ? 2 : 0,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#f57c00", mb: 0.5 }}>
              Create New Batch
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Add a new student intake batch for this program
            </Typography>
          </Box>
          <CustomButton
            text={showAddBatch ? "Cancel" : "+ Create Batch"}
            onClick={() => setShowAddBatch(!showAddBatch)}
            variant={showAddBatch ? "outlined" : "contained"}
            sx={
              showAddBatch
                ? { borderColor: "#f57c00", color: "#f57c00" }
                : { backgroundColor: "#ffc107", color: "#000", fontWeight: 600 }
            }
          />
        </Box>
        <Collapse in={showAddBatch}>
          <Box sx={{ pt: 2, borderTop: "1px solid #ffc107" }}>
            <AddBatchForm
              programId={program.id}
              onSuccess={() => {
                console.log("AddBatchForm onSuccess called")
                setShowAddBatch(false)
                console.log("Calling onRefresh")
                onRefresh()
                console.log("Calling onSuccess with message")
                onSuccess("Batch created successfully")
              }}
              onCancel={() => setShowAddBatch(false)}
              onError={(message) => {
                console.error("AddBatchForm onError called:", message)
                onError(message)
              }}
            />
          </Box>
        </Collapse>
      </Card>
    </Box>
  )
}

export default ProgramBatchView

