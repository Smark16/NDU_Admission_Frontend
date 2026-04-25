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
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material"
import useAxios from "../../../AxiosInstance/UseAxios"
import CustomButton from "../../../ReUsables/custombutton"

interface CourseCatalogUnit {
  id: number
  code: string
  title: string
  description: string
  credit_units: string
  lecture_hours: number | null
  practical_hours: number | null
  tutorial_hours: number | null
  contact_hours: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const emptyForm = {
  code: "",
  title: "",
  description: "",
  credit_units: "3",
  lecture_hours: "" as string | number,
  practical_hours: "" as string | number,
  tutorial_hours: "" as string | number,
  contact_hours: "" as string | number,
  is_active: true,
}

export default function CourseCatalogPage() {
  const AxiosInstance = useAxios()
  const [rows, setRows] = useState<CourseCatalogUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<CourseCatalogUnit | null>(null)
  const [notice, setNotice] = useState<{ msg: string; sev: "success" | "error" } | null>(null)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await AxiosInstance.get<CourseCatalogUnit[]>("/api/courses/catalog_course_units", {
        params: search.trim() ? { search: search.trim() } : {},
      })
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setRows([])
      setNotice({ msg: "Could not load catalog entries.", sev: "error" })
    } finally {
      setLoading(false)
    }
  }, [AxiosInstance, search])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchRows()
    }, 300)
    return () => window.clearTimeout(t)
  }, [fetchRows])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (row: CourseCatalogUnit) => {
    setEditingId(row.id)
    setForm({
      code: row.code,
      title: row.title,
      description: row.description || "",
      credit_units: String(row.credit_units),
      lecture_hours: row.lecture_hours ?? "",
      practical_hours: row.practical_hours ?? "",
      tutorial_hours: row.tutorial_hours ?? "",
      contact_hours: row.contact_hours ?? "",
      is_active: row.is_active,
    })
    setDialogOpen(true)
  }

  const toPayload = () => {
    const num = (v: string | number) => {
      if (v === "" || v === null || v === undefined) return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    return {
      code: form.code.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      credit_units: form.credit_units,
      lecture_hours: num(form.lecture_hours),
      practical_hours: num(form.practical_hours),
      tutorial_hours: num(form.tutorial_hours),
      contact_hours: num(form.contact_hours),
      is_active: form.is_active,
    }
  }

  const save = async () => {
    if (!form.code.trim() || !form.title.trim()) {
      setNotice({ msg: "Code and title are required.", sev: "error" })
      return
    }
    try {
      const payload = toPayload()
      if (editingId) {
        await AxiosInstance.put(`/api/courses/catalog_course_units/${editingId}`, payload)
        setNotice({ msg: "Course catalog entry updated.", sev: "success" })
      } else {
        await AxiosInstance.post("/api/courses/catalog_course_units", payload)
        setNotice({ msg: "Course catalog entry created.", sev: "success" })
      }
      setDialogOpen(false)
      await fetchRows()
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, unknown> } }
      const detail = err.response?.data?.detail
      const msg =
        typeof detail === "string"
          ? detail
          : JSON.stringify(err.response?.data || e)
      setNotice({ msg: String(msg), sev: "error" })
    }
  }

  const remove = async () => {
    if (!deleteTarget) return
    try {
      await AxiosInstance.delete(`/api/courses/catalog_course_units/${deleteTarget.id}`)
      setNotice({ msg: "Deleted.", sev: "success" })
      setDeleteTarget(null)
      await fetchRows()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      setNotice({ msg: err.response?.data?.detail || "Delete failed.", sev: "error" })
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <MenuBookIcon color="primary" />
        <Typography variant="h5" fontWeight={600}>
          Course catalog
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Reusable course definitions (code, credits, hours). Map these to programmes in a later step; attach to
        semester offerings from&nbsp;
        <strong>Batches, courses &amp; registration</strong>.
      </Typography>

      {notice && (
        <Alert severity={notice.sev} sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice.msg}
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <TextField
              size="small"
              label="Search code or title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, maxWidth: 360 }}
            />
            <Stack direction="row" spacing={1}>
              <CustomButton
                text="Upload (bulk)"
                icon={<CloudUploadIcon />}
                variant="outlined"
                onClick={() => {
                  setUploadFile(null)
                  setUpdateExisting(false)
                  setUploadOpen(true)
                }}
              />
              <CustomButton
                text="Template"
                icon={<FileDownloadIcon />}
                variant="outlined"
                onClick={async () => {
                  try {
                    const res = await AxiosInstance.get("/api/courses/catalog_course_units/template", {
                      responseType: "blob",
                    })
                    const url = window.URL.createObjectURL(new Blob([res.data]))
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "catalog_course_units_template.xlsx"
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    window.URL.revokeObjectURL(url)
                  } catch {
                    setNotice({ sev: "error", msg: "Failed to download template." })
                  }
                }}
              />
              <CustomButton text="Add catalog course" icon={<AddIcon />} onClick={openCreate} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Title</TableCell>
                <TableCell align="right">Credits</TableCell>
                <TableCell align="right">Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{r.code}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell align="right">{r.credit_units}</TableCell>
                  <TableCell align="right">{r.contact_hours ?? "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.is_active ? "Active" : "Inactive"}
                      color={r.is_active ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(r)} aria-label="edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(r)}
                      aria-label="delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">No catalog entries yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit catalog course" : "New catalog course"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Code"
              fullWidth
              required
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              disabled={editingId != null}
              helperText={editingId ? "Code cannot be changed here; create a new row if needed." : ""}
            />
            <TextField
              label="Title"
              fullWidth
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <TextField
              label="Credit units"
              type="number"
              fullWidth
              required
              inputProps={{ step: "0.01", min: 0 }}
              value={form.credit_units}
              onChange={(e) => setForm((f) => ({ ...f, credit_units: e.target.value }))}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Lecture hrs"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
                value={form.lecture_hours}
                onChange={(e) => setForm((f) => ({ ...f, lecture_hours: e.target.value }))}
              />
              <TextField
                label="Practical hrs"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
                value={form.practical_hours}
                onChange={(e) => setForm((f) => ({ ...f, practical_hours: e.target.value }))}
              />
              <TextField
                label="Tutorial hrs"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
                value={form.tutorial_hours}
                onChange={(e) => setForm((f) => ({ ...f, tutorial_hours: e.target.value }))}
              />
            </Stack>
            <TextField
              label="Contact hours (blank = auto sum)"
              type="number"
              fullWidth
              inputProps={{ min: 0 }}
              value={form.contact_hours}
              onChange={(e) => setForm((f) => ({ ...f, contact_hours: e.target.value }))}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void save()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete catalog entry?</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget ? `Remove ${deleteTarget.code} — ${deleteTarget.title}?` : ""}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void remove()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={uploadOpen} onClose={() => (uploading ? null : setUploadOpen(false))} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk upload catalog courses</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload Excel/CSV with columns: <b>code</b>, <b>title</b>, <b>credit_units</b> (required).
            Optional: description, lecture_hours, practical_hours, tutorial_hours, contact_hours, is_active.
          </Typography>

          <Button variant="outlined" component="label" disabled={uploading}>
            Choose file
            <input
              hidden
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {uploadFile ? uploadFile.name : "No file selected"}
          </Typography>

          <FormControlLabel
            sx={{ mt: 2 }}
            control={<Switch checked={updateExisting} onChange={(e) => setUpdateExisting(e.target.checked)} />}
            label="Update existing rows (match by code)"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton
            text="Cancel"
            variant="outlined"
            onClick={() => setUploadOpen(false)}
            disabled={uploading}
            sx={{ borderColor: "#7c1519", color: "#7c1519" }}
          />
          <CustomButton
            text={uploading ? "Uploading..." : "Upload"}
            disabled={uploading || !uploadFile}
            onClick={async () => {
              if (!uploadFile) return
              setUploading(true)
              try {
                const fd = new FormData()
                fd.append("file", uploadFile)
                fd.append("update_existing", updateExisting ? "true" : "false")
                const { data } = await AxiosInstance.post(
                  "/api/courses/catalog_course_units/bulk_upload",
                  fd,
                  { headers: { "Content-Type": "multipart/form-data" } },
                )
                setNotice({
                  sev: "success",
                  msg: `Upload complete: ${data.created ?? 0} created, ${data.updated ?? 0} updated, ${data.failed ?? 0} failed.`,
                })
                setUploadOpen(false)
                setUploadFile(null)
                await fetchRows()
                if (Array.isArray(data.errors) && data.errors.length > 0) {
                  setNotice({ sev: "error", msg: String(data.errors[0]) })
                }
              } catch (e: any) {
                const detail = e.response?.data?.detail
                setNotice({ sev: "error", msg: typeof detail === "string" ? detail : "Upload failed." })
              } finally {
                setUploading(false)
              }
            }}
          />
        </DialogActions>
      </Dialog>
    </Container>
  )
}
