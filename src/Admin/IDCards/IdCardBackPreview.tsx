"use client"

import { Box, Typography } from "@mui/material"

export type IdCardBackPreviewFields = {
  institution?: string
  issuer_title?: string
  issuer_signatory?: string
  issued_on?: string
  issued_on_display?: string
  return_to?: string
}

const DATE_BLUE = "#0b3d6d"
const BODY_SIZE = 12.5
const HEADER_SUB = 13
const UNIVERSITY_SIZE = 22

function returnLines(returnTo: string | undefined): string[] {
  if (!returnTo?.trim()) return []
  return returnTo.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
}

export default function IdCardBackPreview({ back }: { back: IdCardBackPreviewFields | undefined }) {
  const lines = returnLines(back?.return_to)
  const university = (back?.institution || "Ndejje University").toUpperCase()
  const signatory = back?.issuer_signatory?.trim() || "M. Nanda"
  const title = back?.issuer_title?.trim() || "Academic Registrar"
  const when = back?.issued_on_display?.trim() || back?.issued_on || "—"

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        color: "#111",
        border: "1px solid #bdbdbd",
        borderRadius: 1,
        overflow: "hidden",
        fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
        maxWidth: 460,
        mx: { xs: 0, sm: "auto" },
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <Box sx={{ textAlign: "center", pt: 2.25, pb: 1.75, px: 2 }}>
        <Typography sx={{ fontSize: HEADER_SUB, fontWeight: 400, lineHeight: 1.3 }}>
          This card is a property of
        </Typography>
        <Typography
          sx={{
            fontSize: UNIVERSITY_SIZE,
            fontWeight: 800,
            letterSpacing: "0.02em",
            lineHeight: 1.2,
            mt: 0.25,
          }}
        >
          {university}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "stretch",
          px: 2,
          py: 1.5,
          minHeight: { sm: 168 },
        }}
      >
        <Box
          sx={{
            flex: 1,
            pr: { sm: 2 },
            pb: { xs: 2, sm: 0 },
            borderRight: { sm: "1px solid #000" },
            borderBottom: { xs: "1px solid #000", sm: "none" },
          }}
        >
          <Typography
            component="div"
            sx={{
              textDecoration: "underline",
              fontSize: BODY_SIZE,
              fontWeight: 500,
              mb: 1,
            }}
          >
            If found, please return to :
          </Typography>
          {lines.length > 0 ? (
            lines.map((line, i) => (
              <Typography
                key={`${i}-${line.slice(0, 24)}`}
                sx={{
                  fontSize: BODY_SIZE,
                  lineHeight: 1.45,
                  textAlign: "left",
                }}
              >
                {line}
              </Typography>
            ))
          ) : (
            <Typography sx={{ fontSize: BODY_SIZE, color: "text.secondary" }}>—</Typography>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            pl: { sm: 2 },
            pt: { xs: 2, sm: 0 },
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontSize: BODY_SIZE, fontWeight: 400, mb: 1 }}>
            This card was issued by
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Segoe Script", "Brush Script MT", "Apple Chancery", cursive',
              fontSize: 30,
              lineHeight: 1.1,
              mb: 0.75,
              color: "#1a1a1a",
            }}
          >
            {signatory}
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{title}</Typography>
          <Typography
            sx={{
              fontSize: BODY_SIZE,
              color: DATE_BLUE,
              fontWeight: 500,
              mt: "auto",
              pt: 1.5,
            }}
          >
            On: {when}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ height: 16, bgcolor: "#000", width: "100%" }} />
    </Box>
  )
}
