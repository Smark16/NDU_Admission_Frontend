"use client"

import { useContext, useEffect, useState } from "react" // useContext needed for AuthContext
import {
  Box, Card, CardContent, CardHeader, Typography, TextField,
  Button, Alert, CircularProgress, Divider, Chip, Grid,
} from "@mui/material"
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  AccessTime as TimeIcon,
  AdminPanelSettings as AdminIcon,
  School as StudentIcon,
} from "@mui/icons-material"
import { AuthContext } from "../../Context/AuthContext"
import useAxios from "../../AxiosInstance/UseAxios"

interface SystemSettingsData {
  student_session_timeout: number
  admin_session_timeout: number
  id_card_templates?: Array<{
    key: string
    name: string
    front_title?: string
    back_text?: string
  }>
  active_id_card_template?: string
  updated_by_name: string | null
  updated_at: string | null
}

export default function SystemSettings() {
  const { showSuccessAlert, showErrorAlert } = useContext(AuthContext) || {}
  const AxiosInstance = useAxios()

  const [settings, setSettings] = useState<SystemSettingsData>({
    student_session_timeout: 30,
    admin_session_timeout: 60,
    id_card_templates: [],
    active_id_card_template: "",
    updated_by_name: null,
    updated_at: null,
  })
  const [templatesJson, setTemplatesJson] = useState<string>("[]")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const normalizeTimeout = (value: string, fallback: number) => {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed)) return fallback
    return Math.min(480, Math.max(1, parsed))
  }

  const extractErrorMessage = (err: any) => {
    const apiData = err?.response?.data
    if (apiData?.detail) return apiData.detail
    if (apiData?.errors && typeof apiData.errors === "object") {
      const [field, fieldErrors] = Object.entries(apiData.errors)[0] || []
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        return `${field}: ${fieldErrors[0]}`
      }
      return "Invalid settings values."
    }
    return "Failed to save settings."
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await AxiosInstance!.get("/api/accounts/system_settings")
        setSettings(data)
        setTemplatesJson(JSON.stringify(Array.isArray(data.id_card_templates) ? data.id_card_templates : [], null, 2))
      } catch {
        setError("Failed to load system settings.")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    if (
      !Number.isInteger(settings.student_session_timeout) ||
      !Number.isInteger(settings.admin_session_timeout)
    ) {
      setError("Timeout values must be whole numbers.")
      return
    }
    if (settings.student_session_timeout < 1 || settings.admin_session_timeout < 1) {
      setError("Timeout values must be at least 1 minute.")
      return
    }
    try {
      setSaving(true)
      let parsedTemplates: SystemSettingsData["id_card_templates"] = []
      try {
        const parsed = JSON.parse(templatesJson || "[]")
        if (!Array.isArray(parsed)) throw new Error("ID templates JSON must be an array.")
        parsedTemplates = parsed
      } catch (e: any) {
        const msg = e?.message || "Invalid ID templates JSON."
        setError(msg)
        showErrorAlert?.(msg)
        setSaving(false)
        return
      }
      const { data } = await AxiosInstance!.put("/api/accounts/update_system_settings", {
        student_session_timeout: settings.student_session_timeout,
        admin_session_timeout: settings.admin_session_timeout,
        id_card_templates: parsedTemplates,
        active_id_card_template: (settings.active_id_card_template || "").trim(),
      })
      setSettings(data)
      setTemplatesJson(JSON.stringify(Array.isArray(data.id_card_templates) ? data.id_card_templates : [], null, 2))
      setSuccess("Settings saved successfully.")
      showSuccessAlert?.("System settings updated.")
    } catch (err: any) {
      const msg = extractErrorMessage(err)
      setError(msg)
      showErrorAlert?.(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress sx={{ color: "#7c1519" }} />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 32, color: "#7c1519" }} />
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1a3a52">
            System Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure system-wide settings for the admissions portal
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Session Timeout Settings */}
      <Card sx={{ mb: 3, border: "1px solid #e0eef7" }}>
        <CardHeader
          avatar={<TimeIcon sx={{ color: "#7c1519" }} />}
          title={<Typography fontWeight={700}>Session Timeout (Inactivity Sleep)</Typography>}
          subheader="Set how long accounts stay active without any interaction before being signed out"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2, bgcolor: "#f8fbff", borderRadius: 2, border: "1px solid #e0eef7" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <StudentIcon sx={{ color: "#5ba3f5" }} />
                  <Typography fontWeight={600}>Student / Applicant Accounts</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Timeout (minutes)"
                  value={settings.student_session_timeout}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      student_session_timeout: normalizeTimeout(
                        e.target.value,
                        prev.student_session_timeout
                      ),
                    }))
                  }
                  slotProps={{ htmlInput: { min: 1, max: 480, step: 1 } }}
                  helperText="Recommended: 20–60 minutes"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2, bgcolor: "#fff8f0", borderRadius: 2, border: "1px solid #ffe0b2" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <AdminIcon sx={{ color: "#f57c00" }} />
                  <Typography fontWeight={600}>Admin / Staff Accounts</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Timeout (minutes)"
                  value={settings.admin_session_timeout}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      admin_session_timeout: normalizeTimeout(
                        e.target.value,
                        prev.admin_session_timeout
                      ),
                    }))
                  }
                  slotProps={{ htmlInput: { min: 1, max: 480, step: 1 } }}
                  helperText="Recommended: 60–240 minutes"
                  size="small"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Active ID template key"
                value={settings.active_id_card_template || ""}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    active_id_card_template: e.target.value,
                  }))
                }
                helperText="This key must exist in the templates JSON list."
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="ID Card Templates (JSON array)"
                multiline
                minRows={8}
                value={templatesJson}
                onChange={(e) => setTemplatesJson(e.target.value)}
                helperText='Each item should include at least: {"key":"...", "name":"..."}'
                size="small"
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            Users will be automatically signed out after the configured period of inactivity.
            Any unsaved work will be lost.
          </Alert>
        </CardContent>
      </Card>

      {/* Last Updated Info */}
      {settings.updated_at && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated:
          </Typography>
          <Chip
            size="small"
            label={new Date(settings.updated_at).toLocaleString()}
            variant="outlined"
          />
          {settings.updated_by_name && (
            <>
              <Typography variant="caption" color="text.secondary">by</Typography>
              <Chip size="small" label={settings.updated_by_name} color="primary" variant="outlined" />
            </>
          )}
        </Box>
      )}

      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
        onClick={handleSave}
        disabled={saving}
        sx={{ bgcolor: "#7c1519", "&:hover": { bgcolor: "#5a0f12" }, px: 4 }}
      >
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </Box>
  )
}
