import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Alert, Box, Card, CardContent, CircularProgress, Container, Typography } from "@mui/material"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") || ""

interface OkPayload {
  valid: true
  student_name: string
  programme: string | null
  generated_at: string | null
  printed_by: string | null
  system: string
}

interface ErrPayload {
  valid: false
  detail?: string
}

export default function VerifyOfferLetter() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<OkPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError("Missing verification code in the URL.")
      return
    }
    const url = `${apiBase}/api/offer_letter/verify_offer/${encodeURIComponent(token)}`
    fetch(url)
      .then(async (r) => {
        const j = await r.json()
        if (!r.ok) {
          setError((j as ErrPayload).detail || "This link could not be verified.")
          setData(null)
          return
        }
        if (j.valid) setData(j as OkPayload)
        else setError("This link could not be verified.")
      })
      .catch(() => setError("Could not reach the server. Check your connection."))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: "#0D0060" }}>
          Offer letter verification
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This page confirms whether an admission offer letter matches a record in the university system.
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Card elevation={2}>
            <CardContent>
              <Alert severity="error" icon={<ErrorOutlineIcon />}>
                {error}
              </Alert>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <Link to="/login">Back to login</Link>
              </Typography>
            </CardContent>
          </Card>
        )}

        {!loading && data && (
          <Card elevation={3} sx={{ borderTop: "4px solid #2e7d32" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <VerifiedUserIcon color="success" sx={{ fontSize: 40 }} />
                <Typography variant="h6" fontWeight={700} color="success.dark">
                  Authentic offer letter
                </Typography>
              </Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                This verification code is recognised. The letter was produced through the official admissions workflow.
              </Alert>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Student:</strong> {data.student_name}
              </Typography>
              {data.programme && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Programme:</strong> {data.programme}
                </Typography>
              )}
              {data.generated_at && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Letter generated:</strong> {new Date(data.generated_at).toLocaleString()}
                </Typography>
              )}
              {data.printed_by && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Printed by (staff):</strong> {data.printed_by}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                System: {data.system}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <Link to="/login">Back to login</Link>
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  )
}

