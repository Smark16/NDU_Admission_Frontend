import { useState, useRef, useEffect } from "react"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Chip, Select, MenuItem,
  FormControl, InputLabel, TextField, CircularProgress,
  Alert, Tooltip, IconButton, Divider,
} from "@mui/material"
import { Delete as DeleteIcon, Save as SaveIcon, MyLocation as PinIcon } from "@mui/icons-material"
import useAxios from "../../../AxiosInstance/UseAxios"

const AVAILABLE_FIELDS: { key: string; label: string }[] = [
  { key: "full_name", label: "Full Name" },
  { key: "student_no", label: "Student Number" },
  { key: "reg_no", label: "Registration Number" },
  { key: "program_name", label: "Programme Name" },
  { key: "min_years", label: "Min Duration (years)" },
  { key: "max_years", label: "Max Duration (years)" },
  { key: "campus", label: "Campus" },
  { key: "study_mode", label: "Study Mode" },
  { key: "start_date", label: "Start Date" },
  { key: "hall_of_residence", label: "Hall of Residence" },
]

interface FieldPosition {
  x: number
  y: number
  page: number
  font_size: number
  bold: boolean
}

interface Props {
  open: boolean
  templateId: number
  templateName: string
  onClose: () => void
  onSaved: () => void
}

export default function PDFFieldMapper({ open, templateId, templateName, onClose, onSaved }: Props) {
  const AxiosInstance = useAxios()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [image, setImage] = useState<string | null>(null)
  const [pdfWidth, setPdfWidth] = useState(595)
  const [pdfHeight, setPdfHeight] = useState(842)
  const [positions, setPositions] = useState<Record<string, FieldPosition>>({})

  const [activeField, setActiveField] = useState<string>("")
  const [fontSize, setFontSize] = useState(11)
  const [bold, setBold] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    setImgLoaded(false)
    AxiosInstance.get(`/api/offer_letter/pdf_preview/${templateId}`)
      .then(({ data }) => {
        setImage(data.image)
        setPdfWidth(data.pdf_width)
        setPdfHeight(data.pdf_height)
        setPositions(data.field_positions || {})
      })
      .catch(() => setError("Failed to load PDF preview."))
      .finally(() => setLoading(false))
  }, [open, templateId])

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!activeField || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const displayW = rect.width
    const displayH = rect.height

    // Scale from display pixels to PDF points
    const pdfX = (clickX / displayW) * pdfWidth
    const pdfY = (clickY / displayH) * pdfHeight

    setPositions((prev) => ({
      ...prev,
      [activeField]: { x: Math.round(pdfX), y: Math.round(pdfY), page: 0, font_size: fontSize, bold },
    }))
  }

  const handleRemoveField = (key: string) => {
    setPositions((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await AxiosInstance.post(`/api/offer_letter/save_field_positions/${templateId}`, {
        field_positions: positions,
      })
      onSaved()
      onClose()
    } catch {
      setError("Failed to save field positions.")
    } finally {
      setSaving(false)
    }
  }

  const getFieldLabel = (key: string) => AVAILABLE_FIELDS.find((f) => f.key === key)?.label ?? key
  const placedKeys = Object.keys(positions)
  const unplacedFields = AVAILABLE_FIELDS.filter((f) => !placedKeys.includes(f.key))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#1a3a52" }}>
        Map Fields — {templateName}
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", height: "75vh" }}>
        {/* Left panel: field controls */}
        <Box sx={{ width: 260, borderRight: "1px solid #e0e0e0", p: 2, overflowY: "auto", flexShrink: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            1. Select field to place
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Field</InputLabel>
            <Select value={activeField} label="Field" onChange={(e) => setActiveField(e.target.value)}>
              {unplacedFields.map((f) => (
                <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth size="small" type="number" label="Font size"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 6, max: 36 } }}
            sx={{ mb: 1 }}
          />

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Style</InputLabel>
            <Select value={bold ? "bold" : "normal"} label="Style" onChange={(e) => setBold(e.target.value === "bold")}>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bold">Bold</MenuItem>
            </Select>
          </FormControl>

          {activeField && (
            <Alert severity="info" sx={{ mb: 2, fontSize: "0.78rem" }}>
              Click on the PDF where <strong>{getFieldLabel(activeField)}</strong> should appear.
            </Alert>
          )}

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1, mb: 1 }}>
            2. Placed fields
          </Typography>

          {placedKeys.length === 0 ? (
            <Typography variant="caption" color="text.secondary">None placed yet.</Typography>
          ) : (
            placedKeys.map((key) => (
              <Box key={key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Chip
                  label={getFieldLabel(key)}
                  size="small"
                  icon={<PinIcon sx={{ fontSize: 14 }} />}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: "0.72rem", maxWidth: 170 }}
                />
                <Tooltip title="Remove">
                  <IconButton size="small" onClick={() => handleRemoveField(key)}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))
          )}
        </Box>

        {/* Right panel: PDF preview */}
        <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "#f0f0f0", display: "flex", justifyContent: "center", p: 2, position: "relative" }}>
          {loading && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
              <CircularProgress sx={{ color: "#7c1519" }} />
            </Box>
          )}

          {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

          {image && !loading && (
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <img
                ref={imgRef}
                src={`data:image/png;base64,${image}`}
                alt="PDF preview"
                onClick={handleImageClick}
                onLoad={() => setImgLoaded(true)}
                style={{
                  maxWidth: "100%",
                  cursor: activeField ? "crosshair" : "default",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  display: "block",
                }}
              />

              {/* Render placed field markers — only after image dimensions are known */}
              {imgLoaded && imgRef.current && placedKeys.map((key) => {
                const pos = positions[key]
                const displayX = (pos.x / pdfWidth) * (imgRef.current!.naturalWidth / 2)
                const displayY = (pos.y / pdfHeight) * (imgRef.current!.naturalHeight / 2)
                const scaleX = imgRef.current!.clientWidth / (imgRef.current!.naturalWidth / 2)
                const scaleY = imgRef.current!.clientHeight / (imgRef.current!.naturalHeight / 2)
                return (
                  <Box
                    key={key}
                    sx={{
                      position: "absolute",
                      left: displayX * scaleX,
                      top: displayY * scaleY,
                      transform: "translate(-50%, -50%)",
                      bgcolor: "rgba(13,0,96,0.85)",
                      color: "#fff",
                      borderRadius: 1,
                      px: 0.5,
                      py: 0.2,
                      fontSize: "0.65rem",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      fontWeight: 700,
                    }}
                  >
                    {getFieldLabel(key)}
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: "#7c1519", color: "#7c1519" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          disabled={saving || placedKeys.length === 0}
          sx={{ bgcolor: "#0D0060", "&:hover": { bgcolor: "#1a0080" } }}
        >
          {saving ? "Saving..." : "Save Field Positions"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
