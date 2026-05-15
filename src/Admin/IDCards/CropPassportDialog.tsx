"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Typography,
} from "@mui/material"

/** Typical passport aspect (35×45 mm). */
const PASSPORT_ASPECT = 35 / 45

async function getCroppedJpegBlob(imageSrc: string, pixelCrop: Area, quality = 0.92): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener("load", () => resolve(img))
    img.addEventListener("error", reject)
    img.src = imageSrc
  })
  const w = Math.max(1, Math.round(pixelCrop.width))
  const h = Math.max(1, Math.round(pixelCrop.height))
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not create canvas context.")
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    w,
    h,
  )
  const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), "image/jpeg", quality))
  if (!blob) throw new Error("Could not encode image.")
  return blob
}

export type CropPassportDialogProps = {
  open: boolean
  /** `URL.createObjectURL` for the image to crop */
  imageSrc: string
  /** When set, user can skip cropping and upload the original file */
  originalFile: File | null
  onClose: () => void
  onComplete: (file: File) => void
}

export default function CropPassportDialog({
  open,
  imageSrc,
  originalFile,
  onClose,
  onComplete,
}: CropPassportDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [busy, setBusy] = useState(false)
  const croppedAreaPixelsRef = useRef<Area | null>(null)

  useEffect(() => {
    if (!open) return
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    croppedAreaPixelsRef.current = null
  }, [open, imageSrc])

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    croppedAreaPixelsRef.current = areaPixels
  }, [])

  const handleApplyCrop = async () => {
    const pixels = croppedAreaPixelsRef.current
    if (!pixels) return
    setBusy(true)
    try {
      const blob = await getCroppedJpegBlob(imageSrc, pixels)
      const name =
        originalFile?.name?.toLowerCase().endsWith(".jpg") || originalFile?.name?.toLowerCase().endsWith(".jpeg")
          ? originalFile.name.replace(/\.[^.]+$/, ".jpg")
          : "passport.jpg"
      onComplete(new File([blob], name, { type: "image/jpeg" }))
    } finally {
      setBusy(false)
    }
  }

  const handleSkipCrop = () => {
    if (!originalFile) return
    onComplete(originalFile)
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adjust crop (passport frame)</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Drag to position the face, then zoom so the head and shoulders fit the frame. Use “Apply crop” to continue.
        </Typography>
        <Box sx={{ position: "relative", width: "100%", height: 280, bgcolor: "#111", borderRadius: 1, overflow: "hidden" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={PASSPORT_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Zoom
        </Typography>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.05}
          aria-label="Zoom"
          onChange={(_, v) => setZoom(Array.isArray(v) ? v[0] : v)}
        />
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        {originalFile && (
          <Button onClick={handleSkipCrop} disabled={busy}>
            Skip cropping
          </Button>
        )}
        <Button variant="contained" onClick={() => void handleApplyCrop()} disabled={busy}>
          {busy ? "Working…" : "Apply crop"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
