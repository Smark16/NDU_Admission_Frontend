// components/program/BulkUpload.tsx
import React, { type ChangeEvent } from 'react'
import {
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material"
import CustomButton from '../../../ReUsables/custombutton'

interface BulkUploadResult {
  success: number
  failed: number
  errors: string[]
}

interface BulkUploadProps {
  open: boolean
  onClose: () => void
  isUploading: boolean
  // controls disabled state
  uploadProgress?: number  
  result: BulkUploadResult | null
  onUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void> | void
  onResetResult: () => void
}

const BulkUpload: React.FC<BulkUploadProps> = ({
  open,
  onClose,
  isUploading,
  uploadProgress = 0,
  result,
  onUpload,
  onResetResult,
}) => {
  const inputId = "bulk-upload-input"

  const handleClose = () => {
    if (!isUploading) {
      onResetResult()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
        Bulk Upload Programs
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        {!result ? (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              CSV columns:{" "}
              <strong>
                name, short_form, code, academic_level, campuses (comma-separated), min_years, max_years
              </strong>
            </Typography>

            <Card
              variant="outlined"
              sx={{
                border: "2px dashed",
                borderColor: isUploading ? "action.disabled" : "primary.main",
                borderRadius: 2,
                p: 5,
                textAlign: "center",
                backgroundColor: "action.hover",
                cursor: isUploading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: isUploading ? 0.7 : 1,
                "&:hover": {
                  borderColor: isUploading ? undefined : "primary.dark",
                },
              }}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={onUpload}
                disabled={isUploading}
                id={inputId}
                style={{ display: "none" }}
              />

              <label htmlFor={inputId}>
                <CloudUploadIcon
                  sx={{
                    fontSize: 56,
                    color: isUploading ? "action.disabled" : "#3e397b",
                    mb: 2,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {isUploading ? "Uploading..." : "Click to upload"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  or drag and drop
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Supports .csv, .xlsx, .xls
                </Typography>
              </label>
            </Card>

            {isUploading && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 1 }}>
                  {uploadProgress}% uploaded
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <>
            {/* Success Message */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <CheckCircleIcon sx={{ color: "success.main", fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {result.success} program{result.success !== 1 ? "s" : ""} imported successfully
              </Typography>
            </Box>

            {/* Failed Rows */}
            {result.failed > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <ErrorIcon sx={{ color: "error.main", fontSize: 32 }} />
                <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                  {result.failed} row{result.failed !== 1 ? "s" : ""} failed
                </Typography>
              </Box>
            )}

            {/* Error List */}
            {result.errors.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Errors:
                </Typography>
                <List
                  dense
                  sx={{
                    bgcolor: "error.light",
                    borderRadius: 1,
                    maxHeight: 250,
                    overflow: "auto",
                    p: 1,
                  }}
                >
                  {result.errors.map((err, i) => (
                    <ListItem key={i} sx={{ py: 0.3, alignItems: "flex-start" }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <ErrorIcon sx={{ fontSize: 16, color: "error.main" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={err}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "error.contrastText",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <CustomButton onClick={handleClose} disabled={isUploading} text={result ? "Done" : "Cancel"}/>
      </DialogActions>
    </Dialog>
  )
}

export default BulkUpload