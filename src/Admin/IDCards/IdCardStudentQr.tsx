"use client"

import { useMemo } from "react"
import QRCode from "react-qr-code"
import { Box, Typography } from "@mui/material"

export type IdCardPreviewForQr = {
  card_number?: string
  front?: {
    qr_payload?: string
    name?: string
    student_no?: string
    reg_no?: string
    course?: string
    gender?: string
    expiry_date?: string
  }
}

export function buildIdCardQrPayload(preview: IdCardPreviewForQr | null): string {
  if (!preview?.front) return ""
  const f = preview.front
  if (f.qr_payload) return f.qr_payload
  return JSON.stringify({
    v: 1,
    type: "ndu_student_id",
    card_number: preview.card_number ?? "",
    name: f.name ?? "",
    student_no: f.student_no ?? "",
    reg_no: f.reg_no ?? "",
    course: f.course ?? "",
    gender: f.gender ?? "",
    expiry_date: f.expiry_date ?? "",
  })
}

export default function IdCardStudentQr({
  preview,
  size = 140,
}: {
  preview: IdCardPreviewForQr | null
  size?: number
}) {
  const value = useMemo(() => buildIdCardQrPayload(preview), [preview])
  if (!value) return null
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box
        sx={{
          bgcolor: "#fff",
          p: 0.75,
          borderRadius: 1,
          border: "1px solid #e0e0e0",
          lineHeight: 0,
        }}
      >
        <QRCode value={value} size={size} level="M" />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, textAlign: "center", maxWidth: 240 }}>
        QR code encodes student ID details (JSON)
      </Typography>
    </Box>
  )
}
