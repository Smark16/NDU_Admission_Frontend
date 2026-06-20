import { useState, useRef, useEffect, useCallback } from "react"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Chip, Select, MenuItem,
  FormControl, InputLabel, TextField, CircularProgress,
  Alert, Tooltip, IconButton, Divider,
} from "@mui/material"
import { Delete as DeleteIcon, Save as SaveIcon, MyLocation as PinIcon } from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"

const IMAGE_FIELD_KEYS = new Set(["passport_photo"])

const AVAILABLE_FIELDS: { key: string; label: string }[] = [
  { key: "passport_photo", label: "Passport photo (image box)" },
  { key: "name", label: "Full name" },
  { key: "student_no", label: "Student number" },
  { key: "reg_no", label: "Registration number" },
  { key: "course", label: "Course / programme" },
  { key: "gender", label: "Gender" },
  { key: "expiry_date", label: "Expiry date" },
  { key: "card_number", label: "Card number" },
]

interface FieldPosition {
  x: number
  y: number
  page: number
  font_size?: number
  bold?: boolean
  font_family?: string
  width?: number
  height?: number
}

const FONT_OPTIONS = [
  { value: "helvetica", label: "Helvetica" },
  { value: "times", label: "Times New Roman" },
  { value: "courier", label: "Courier New" },
  { value: "century", label: "Century" },
]

const DEFAULT_FONT_SIZE = 11
const DEFAULT_PHOTO_WIDTH = 85
const DEFAULT_PHOTO_HEIGHT = 105

function isImageField(key: string) {
  return IMAGE_FIELD_KEYS.has(key)
}

interface Props {
  open: boolean
  templateId: number
  templateName: string
  onClose: () => void
  onSaved: (autoActivated?: boolean) => void
}

export default function IdCardPdfFieldMapper({ open, templateId, templateName, onClose, onSaved }: Props) {
  const AxiosInstance = useAxios()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [image, setImage] = useState<string | null>(null)
  const [pdfWidth, setPdfWidth] = useState(595)
  const [pdfHeight, setPdfHeight] = useState(842)
  const [positions, setPositions] = useState<Record<string, FieldPosition>>({})

  const [activeField, setActiveField] = useState<string>("")
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [bold, setBold] = useState(false)
  const [fontFamily, setFontFamily] = useState("helvetica")
  const [photoWidth, setPhotoWidth] = useState(DEFAULT_PHOTO_WIDTH)
  const [photoHeight, setPhotoHeight] = useState(DEFAULT_PHOTO_HEIGHT)

  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const loadFieldSettings = useCallback((key: string, pos?: FieldPosition) => {
    if (isImageField(key)) {
      setPhotoWidth(pos?.width ?? DEFAULT_PHOTO_WIDTH)
      setPhotoHeight(pos?.height ?? DEFAULT_PHOTO_HEIGHT)
      return
    }
    setFontSize(pos?.font_size ?? DEFAULT_FONT_SIZE)
    setBold(Boolean(pos?.bold))
    setFontFamily(pos?.font_family ?? "helvetica")
  }, [])

  const selectField = useCallback(
    (key: string) => {
      setActiveField(key)
      loadFieldSettings(key, positions[key])
    },
    [loadFieldSettings, positions],
  )

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    setImgLoaded(false)
    setActiveField("")
    AxiosInstance.get(`/api/admissions/id_card_templates/${templateId}/pdf_preview`)
      .then(({ data }) => {
        const loaded = (data.field_positions || {}) as Record<string, FieldPosition>
        setImage(data.image)
        setPdfWidth(data.pdf_width)
        setPdfHeight(data.pdf_height)
        setPositions(loaded)
        const firstUnplaced = AVAILABLE_FIELDS.find((f) => !loaded[f.key])
        const initial = firstUnplaced?.key || AVAILABLE_FIELDS[0]?.key || ""
        if (initial) {
          setActiveField(initial)
          loadFieldSettings(initial, loaded[initial])
        }
      })
      .catch((err: any) => {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load PDF preview."
        setError(detail)
      })
      .finally(() => setLoading(false))
  }, [open, templateId, AxiosInstance, loadFieldSettings])

  const patchActivePosition = (patch: Partial<FieldPosition>) => {
    if (!activeField || !positions[activeField]) return
    setPositions((prev) => ({
      ...prev,
      [activeField]: { ...prev[activeField], ...patch },
    }))
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!activeField || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const displayW = rect.width
    const displayH = rect.height

    const pdfX = (clickX / displayW) * pdfWidth
    const pdfY = (clickY / displayH) * pdfHeight

    if (isImageField(activeField)) {
      setPositions((prev) => ({
        ...prev,
        [activeField]: {
          x: Math.round(pdfX),
          y: Math.round(pdfY),
          page: 0,
          width: photoWidth,
          height: photoHeight,
        },
      }))
      return
    }

    setPositions((prev) => ({
      ...prev,
      [activeField]: {
        x: Math.round(pdfX),
        y: Math.round(pdfY),
        page: 0,
        font_size: fontSize,
        bold,
        font_family: fontFamily,
      },
    }))
  }

  const handleRemoveField = (key: string) => {
    setPositions((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    if (activeField === key) {
      loadFieldSettings(key)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await AxiosInstance.post<{ auto_activated?: boolean }>(
        `/api/admissions/id_card_templates/${templateId}/save_field_positions`,
        {
          field_positions: positions,
        },
      )
      onSaved(Boolean(data?.auto_activated))
      onClose()
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to save field positions."
      setError(detail)
    } finally {
      setSaving(false)
    }
  }

  const getFieldLabel = (key: string) => AVAILABLE_FIELDS.find((f) => f.key === key)?.label ?? key
  const placedKeys = Object.keys(positions)
  const activeIsImage = Boolean(activeField && isImageField(activeField))

  const pdfToDisplay = (pos: FieldPosition) => {
    const img = imgRef.current!
    const scaleX = img.clientWidth / (img.naturalWidth / 2)
    const scaleY = img.clientHeight / (img.naturalHeight / 2)
    const displayX = (pos.x / pdfWidth) * (img.naturalWidth / 2)
    const displayY = (pos.y / pdfHeight) * (img.naturalHeight / 2)
    return {
      left: displayX * scaleX,
      top: displayY * scaleY,
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#1a3a52" }}>
        Map ID card fields — {templateName}
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", height: "75vh" }}>
        <Box sx={{ width: 280, borderRight: "1px solid #e0e0e0", p: 2, overflowY: "auto", flexShrink: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            1. Select field to place or edit
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Field</InputLabel>
            <Select
              value={activeField}
              label="Field"
              onChange={(e) => selectField(String(e.target.value))}
            >
              {AVAILABLE_FIELDS.map((f) => (
                <MenuItem key={f.key} value={f.key}>
                  {f.label}
                  {placedKeys.includes(f.key) ? " (placed)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {activeIsImage ? (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Click the top-left corner of the photo box on the PDF. Adjust width and height to match your artwork.
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Photo box width (pt)"
                value={photoWidth}
                onChange={(e) => {
                  const width = Number(e.target.value) || DEFAULT_PHOTO_WIDTH
                  setPhotoWidth(width)
                  patchActivePosition({ width })
                }}
                slotProps={{ htmlInput: { min: 20, max: 300 } }}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Photo box height (pt)"
                value={photoHeight}
                onChange={(e) => {
                  const height = Number(e.target.value) || DEFAULT_PHOTO_HEIGHT
                  setPhotoHeight(height)
                  patchActivePosition({ height })
                }}
                slotProps={{ htmlInput: { min: 20, max: 300 } }}
                sx={{ mb: 2 }}
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Font size"
                value={fontSize}
                onChange={(e) => {
                  const nextSize = Number(e.target.value) || DEFAULT_FONT_SIZE
                  setFontSize(nextSize)
                  patchActivePosition({ font_size: nextSize })
                }}
                slotProps={{ htmlInput: { min: 6, max: 36 } }}
                sx={{ mb: 1 }}
              />

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Style</InputLabel>
                <Select
                  value={bold ? "bold" : "normal"}
                  label="Style"
                  onChange={(e) => {
                    const nextBold = e.target.value === "bold"
                    setBold(nextBold)
                    patchActivePosition({ bold: nextBold })
                  }}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="bold">Bold</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={fontFamily}
                  label="Font Family"
                  onChange={(e) => {
                    const nextFamily = e.target.value
                    setFontFamily(nextFamily)
                    patchActivePosition({ font_family: nextFamily })
                  }}
                >
                  {FONT_OPTIONS.map((font) => (
                    <MenuItem key={font.value} value={font.value}>
                      {font.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {activeField && (
            <Alert severity="info" sx={{ mb: 2, fontSize: "0.78rem" }}>
              {activeIsImage ? (
                <>
                  Click on the PDF where the <strong>top-left</strong> of{" "}
                  <strong>{getFieldLabel(activeField)}</strong> should sit.
                </>
              ) : (
                <>
                  Click on the PDF where <strong>{getFieldLabel(activeField)}</strong> text should start.
                  {positions[activeField] ? " Adjust font settings above — changes apply to the placed field." : ""}
                </>
              )}
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
                  color={activeField === key ? "primary" : "default"}
                  variant={activeField === key ? "filled" : "outlined"}
                  onClick={() => selectField(key)}
                  sx={{ fontSize: "0.72rem", maxWidth: 190, cursor: "pointer" }}
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

              {imgLoaded && imgRef.current && placedKeys.map((key) => {
                const pos = positions[key]
                const { left, top } = pdfToDisplay(pos)

                if (isImageField(key)) {
                  const w = pos.width ?? DEFAULT_PHOTO_WIDTH
                  const h = pos.height ?? DEFAULT_PHOTO_HEIGHT
                  const boxW = (w / pdfWidth) * imgRef.current!.clientWidth
                  const boxH = (h / pdfHeight) * imgRef.current!.clientHeight
                  return (
                    <Box
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation()
                        selectField(key)
                      }}
                      sx={{
                        position: "absolute",
                        left,
                        top,
                        width: boxW,
                        height: boxH,
                        border: activeField === key ? "2px solid #0D0060" : "2px dashed rgba(13,0,96,0.7)",
                        bgcolor: "rgba(13,0,96,0.08)",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          top: -18,
                          left: 0,
                          bgcolor: "rgba(13,0,96,0.85)",
                          color: "#fff",
                          px: 0.5,
                          borderRadius: 0.5,
                          fontSize: "0.65rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getFieldLabel(key)}
                      </Typography>
                    </Box>
                  )
                }

                return (
                  <Box
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectField(key)
                    }}
                    sx={{
                      position: "absolute",
                      left,
                      top,
                      transform: "translate(-50%, -50%)",
                      bgcolor: activeField === key ? "#0D0060" : "rgba(13,0,96,0.85)",
                      color: "#fff",
                      borderRadius: 1,
                      px: 0.5,
                      py: 0.2,
                      fontSize: "0.65rem",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {getFieldLabel(key)}
                    {pos.font_size ? ` (${pos.font_size}pt)` : ""}
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
