"use client"

import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material"
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material"
import { useState } from "react"
import useAxios from "../../../AxiosInstance/UseAxios"
import CustomButton from "../../../ReUsables/custombutton"
import type { MatrixRow } from "./types"

interface Props {
  open: boolean
  onClose: () => void
  programId: number
  programBatchId: number
  rows: MatrixRow[]           // existing matrix rows — used to build template
  onSaved: () => Promise<void>
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}

interface UploadResult {
  saved: number
  error_count: number
  errors: { row: number; semester_name: string; reason: string }[]
}

export default function SemesterTuitionBulkUpload({
  open,
  onClose,
  programId,
  programBatchId,
  rows,
  onSaved,
  onSuccess,
  onError,
}: Props) {
  const AxiosInstance = useAxios()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)

  const handleClose = () => {
    setFile(null)
    setResult(null)
    onClose()
  }

  const downloadTemplate = () => {
    const header =
      "semester_name,tuition_amount,functional_amount,currency,tuition_amount_international,functional_amount_international,currency_international"

    // Pre-fill with the semesters already loaded in the matrix (one row per semester)
    const dataRows = rows.map((r) =>
      [
        r.semester_name,
        r.tuition_amount || "0",
        r.functional_amount || "0",
        r.currency || "UGX",
        r.tuition_amount_international || "",
        r.functional_amount_international || "",
        r.tuition_currency_international || r.functional_currency_international || "",
      ].join(",")
    )

    const csv = [header, ...dataRows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tuition_fees_batch_${programBatchId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)

    const form = new FormData()
    form.append("program_id", String(programId))
    form.append("program_batch_id", String(programBatchId))
    form.append("file", file)

    try {
      const { data } = await AxiosInstance.post(
        "/api/payments/batch_semester_fees/bulk_upload",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      setResult(data)
      if (data.saved > 0) {
        await onSaved()
        onSuccess(`Saved tuition fees for ${data.saved} semester${data.saved !== 1 ? "s" : ""}`)
      }
    } catch (e: any) {
      onError(e.response?.data?.detail ?? "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#1b5e20",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UploadFileIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Bulk Upload Tuition Fees
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Instructions */}
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            CSV format
          </Typography>
          <Typography variant="body2">
            Required: <strong>semester_name, tuition_amount</strong>
            <br />
            Optional: functional_amount, currency, tuition_amount_international,
            functional_amount_international, currency_international
            <br />
            <em>semester_name</em> must exactly match the semester names in this batch.
            Download the template below — it is pre-filled with all semesters.
          </Typography>
        </Alert>

        {/* Download template */}
        <Box sx={{ mb: 2 }}>
          <CustomButton
            icon={<DownloadIcon />}
            text="Download Pre-filled Template"
            variant="outlined"
            onClick={downloadTemplate}
            sx={{ borderColor: "#2e7d32", color: "#2e7d32" }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {rows.length} semester{rows.length !== 1 ? "s" : ""} in this batch
          </Typography>
        </Box>

        {/* File picker */}
        <Box
          sx={{
            border: "2px dashed",
            borderColor: file ? "#1b5e20" : "#bdbdbd",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            bgcolor: file ? "#f1f8e9" : "#fafafa",
            cursor: "pointer",
            mb: 2,
            transition: "all 0.2s",
          }}
          onClick={() => document.getElementById("tuition-bulk-csv")?.click()}
        >
          <input
            id="tuition-bulk-csv"
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setResult(null)
            }}
          />
          <UploadFileIcon
            sx={{ fontSize: 36, color: file ? "#1b5e20" : "#9e9e9e", mb: 1 }}
          />
          <Typography variant="body2" color={file ? "text.primary" : "text.secondary"}>
            {file ? file.name : "Click to choose a CSV file"}
          </Typography>
        </Box>

        {/* Results */}
        {result && (
          <Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`${result.saved} semester${result.saved !== 1 ? "s" : ""} saved`}
                color="success"
                variant="filled"
              />
              {result.error_count > 0 && (
                <Chip
                  icon={<ErrorIcon />}
                  label={`${result.error_count} row${result.error_count !== 1 ? "s" : ""} with errors`}
                  color="error"
                  variant="filled"
                />
              )}
            </Box>

            {result.errors.length > 0 && (
              <Alert severity="error">
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Rows not saved:
                </Typography>
                {result.errors.map((e, i) => (
                  <Typography key={i} variant="caption" display="block">
                    Row {e.row}: <strong>{e.semester_name || "(blank)"}</strong> — {e.reason}
                  </Typography>
                ))}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <CustomButton
          variant="outlined"
          text="Close"
          onClick={handleClose}
          sx={{ borderColor: "#7c1519", color: "#7c1519" }}
        />
        <CustomButton
          icon={<UploadFileIcon />}
          text={uploading ? "Uploading..." : "Upload"}
          disabled={!file || uploading}
          onClick={handleUpload}
          sx={{ bgcolor: "#1b5e20", "&:hover": { bgcolor: "#145a18" } }}
        />
      </DialogActions>
    </Dialog>
  )
}
