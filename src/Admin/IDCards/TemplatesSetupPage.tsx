"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutline from "@mui/icons-material/DeleteOutline"
import MapIcon from "@mui/icons-material/Map"
import Star from "@mui/icons-material/Star"
import StarBorder from "@mui/icons-material/StarBorder"
import { Link } from "react-router-dom"
import useAxios from "../../AxiosInstance/UseAxios"
import IdCardPdfFieldMapper from "./IdCardPdfFieldMapper"

interface PdfTemplateRow {
  id: number
  key: string
  name: string
  pdf_url?: string | null
  front_title?: string
  institution?: string
  issuer_title?: string
  issuer_signatory?: string
  return_to?: string
  tel?: string
  email?: string
}

function errDetail(err: unknown): string | undefined {
  return (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
}

export default function IdCardTemplatesSetupPage() {
  const AxiosInstance = useAxios()
  const [rows, setRows] = useState<PdfTemplateRow[]>([])
  const [activeKey, setActiveKey] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PdfTemplateRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [mapper, setMapper] = useState<PdfTemplateRow | null>(null)

  const [form, setForm] = useState({
    key: "",
    name: "",
    front_title: "",
    institution: "",
    issuer_title: "",
    issuer_signatory: "",
    return_to: "",
    tel: "",
    email: "",
    file: null as File | null,
  })

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [tplRes, sysRes] = await Promise.all([
        AxiosInstance.get<PdfTemplateRow[]>("/api/admissions/id_card_templates"),
        AxiosInstance.get<{ active_id_card_template?: string }>("/api/accounts/system_settings"),
      ])
      setRows(Array.isArray(tplRes.data) ? tplRes.data : [])
      setActiveKey((sysRes.data?.active_id_card_template || "").trim())
    } catch (err: unknown) {
      setError(errDetail(err) || "Failed to load templates.")
    } finally {
      setLoading(false)
    }
  }, [AxiosInstance])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  const openCreate = () => {
    setEditing(null)
    setForm({
      key: "",
      name: "",
      front_title: "",
      institution: "",
      issuer_title: "",
      issuer_signatory: "",
      return_to: "",
      tel: "",
      email: "",
      file: null,
    })
    setDialogOpen(true)
  }

  const openEdit = (row: PdfTemplateRow) => {
    setEditing(row)
    setForm({
      key: row.key,
      name: row.name,
      front_title: row.front_title || "",
      institution: row.institution || "",
      issuer_title: row.issuer_title || "",
      issuer_signatory: row.issuer_signatory || "",
      return_to: row.return_to || "",
      tel: row.tel || "",
      email: row.email || "",
      file: null,
    })
    setDialogOpen(true)
  }

  const saveTemplate = async () => {
    if (!form.key.trim() || !form.name.trim()) {
      setError("Key and name are required.")
      return
    }
    if (!editing && !form.file) {
      setError("Upload a PDF template file when creating a new record.")
      return
    }
    setSaving(true)
    setError("")
    setNotice("")
    try {
      if (editing) {
        if (form.file) {
          const fd = new FormData()
          fd.append("key", form.key.trim())
          fd.append("name", form.name.trim())
          fd.append("front_title", form.front_title)
          fd.append("institution", form.institution)
          fd.append("issuer_title", form.issuer_title)
          fd.append("issuer_signatory", form.issuer_signatory)
          fd.append("return_to", form.return_to)
          fd.append("tel", form.tel)
          fd.append("email", form.email)
          fd.append("template_pdf", form.file)
          await AxiosInstance.patch(`/api/admissions/id_card_templates/${editing.id}`, fd)
        } else {
          await AxiosInstance.patch(`/api/admissions/id_card_templates/${editing.id}`, {
            key: form.key.trim(),
            name: form.name.trim(),
            front_title: form.front_title,
            institution: form.institution,
            issuer_title: form.issuer_title,
            issuer_signatory: form.issuer_signatory,
            return_to: form.return_to,
            tel: form.tel,
            email: form.email,
          })
        }
      } else {
        const fd = new FormData()
        fd.append("key", form.key.trim())
        fd.append("name", form.name.trim())
        fd.append("template_pdf", form.file as File)
        fd.append("front_title", form.front_title)
        fd.append("institution", form.institution)
        fd.append("issuer_title", form.issuer_title)
        fd.append("issuer_signatory", form.issuer_signatory)
        fd.append("return_to", form.return_to)
        fd.append("tel", form.tel)
        fd.append("email", form.email)
        const { data } = await AxiosInstance.post<{ auto_activated?: boolean }>("/api/admissions/id_card_templates", fd)
        if (data?.auto_activated) {
          setNotice(`Template saved and set as active automatically (${form.key.trim()}). Map fields next.`)
        }
      }
      setDialogOpen(false)
      await loadAll()
    } catch (err: unknown) {
      setError(errDetail(err) || "Could not save template.")
    } finally {
      setSaving(false)
    }
  }

  const setActive = async (key: string) => {
    setError("")
    try {
      await AxiosInstance.patch("/api/accounts/update_system_settings", {
        active_id_card_template: key,
      })
      setActiveKey(key)
    } catch (err: unknown) {
      setError(errDetail(err) || "Could not set active template.")
    }
  }

  const remove = async (row: PdfTemplateRow) => {
    if (!window.confirm(`Delete template “${row.name}” (${row.key})?`)) return
    setError("")
    try {
      await AxiosInstance.delete(`/api/admissions/id_card_templates/${row.id}`)
      if (activeKey === row.key) await setActive("")
      await loadAll()
    } catch (err: unknown) {
      setError(errDetail(err) || "Could not delete.")
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            ID card PDF templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload a PDF, <strong>Map PDF fields</strong> (including passport photo on the photo box), then preview/print on
            Student IDs uses your artwork. The first upload is set <strong>active</strong> automatically; use the star to
            switch templates later.
          </Typography>
        </Box>
        <Button variant="outlined" component={Link} to="/admin/id-cards">
          Back to Student IDs
        </Button>
      </Stack>

      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {!loading && rows.length > 0 && !activeKey && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No template is active yet. Click the <strong>star</strong> on the template you want for Student ID preview and
          print. New uploads are activated automatically when none is set.
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add PDF template
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
          Active template key: <strong>{activeKey || "—"}</strong> (saved in system settings)
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          {loading ? (
            <CircularProgress size={28} />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Key</TableCell>
                    <TableCell>PDF</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>No PDF templates yet. Add one to start mapping.</TableCell>
                    </TableRow>
                  )}
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Typography fontWeight={600}>{r.name}</Typography>
                        {activeKey === r.key && <Chip size="small" color="success" label="Active" sx={{ mt: 0.5 }} />}
                      </TableCell>
                      <TableCell>{r.key}</TableCell>
                      <TableCell>{r.pdf_url ? <Chip size="small" label="Uploaded" color="primary" variant="outlined" /> : "—"}</TableCell>
                      <TableCell align="right">
                        <Tooltip title={activeKey === r.key ? "Active" : "Set as active"}>
                          <IconButton size="small" color={activeKey === r.key ? "warning" : "default"} onClick={() => void setActive(r.key)}>
                            {activeKey === r.key ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Button size="small" variant="outlined" startIcon={<MapIcon />} onClick={() => setMapper(r)} disabled={!r.pdf_url}>
                          Map fields
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => openEdit(r)}>
                          Edit
                        </Button>
                        <IconButton size="small" color="error" onClick={() => void remove(r)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit template" : "New PDF template"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Key (slug)"
              value={form.key}
              onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
              disabled={Boolean(editing)}
              helperText="Lowercase letters, numbers, hyphens. Must match active template when selected."
              required
            />
            <TextField label="Display name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            {!editing && (
              <Button variant="outlined" component="label">
                Choose PDF file
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                />
              </Button>
            )}
            {editing && (
              <Button variant="outlined" component="label">
                Replace PDF (optional)
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                />
              </Button>
            )}
            {form.file && <Typography variant="caption">Selected: {form.file.name}</Typography>}
            <TextField label="Front title (optional)" value={form.front_title} onChange={(e) => setForm((p) => ({ ...p, front_title: e.target.value }))} />
            <TextField label="Institution (optional)" value={form.institution} onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))} />
            <TextField label="Issuer title (optional)" value={form.issuer_title} onChange={(e) => setForm((p) => ({ ...p, issuer_title: e.target.value }))} />
            <TextField
              label="Issuer signatory (optional)"
              value={form.issuer_signatory}
              onChange={(e) => setForm((p) => ({ ...p, issuer_signatory: e.target.value }))}
            />
            <TextField
              label="Return-to block (optional, multiline)"
              value={form.return_to}
              onChange={(e) => setForm((p) => ({ ...p, return_to: e.target.value }))}
              multiline
              minRows={3}
            />
            <TextField label="Tel (optional)" value={form.tel} onChange={(e) => setForm((p) => ({ ...p, tel: e.target.value }))} />
            <TextField label="Email (optional)" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void saveTemplate()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {mapper && (
        <IdCardPdfFieldMapper
          open
          templateId={mapper.id}
          templateName={mapper.name}
          onClose={() => setMapper(null)}
          onSaved={(autoActivated) => {
            setMapper(null)
            if (autoActivated) {
              setNotice("Field positions saved and template set as active automatically.")
            }
            void loadAll()
          }}
        />
      )}
    </Box>
  )
}
