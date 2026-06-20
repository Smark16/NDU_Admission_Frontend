"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  FormControl,
  GlobalStyles,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import PhotoCamera from "@mui/icons-material/PhotoCamera"
import UploadFile from "@mui/icons-material/UploadFile"
import Videocam from "@mui/icons-material/Videocam"
import DeleteOutline from "@mui/icons-material/DeleteOutline"
import Print from "@mui/icons-material/Print"
import MapIcon from "@mui/icons-material/Map"
import useAxios from "../../AxiosInstance/UseAxios"
import CropPassportDialog from "./CropPassportDialog"
import IdCardBackPreview from "./IdCardBackPreview"
import IdCardStudentQr from "./IdCardStudentQr"
import { Link } from "react-router-dom"

interface EligibleStudent {
  id: number
  student_id: string
  reg_no: string
  name: string
  gender: string
  program: string
  campus: string
  batch: string
  academic_year: string
  faculty: string
  is_registered: boolean
  has_passport_photo: boolean
  physical_documents_verified?: boolean
}

interface IDCardItem {
  id: number
  admitted_student: number
  admitted_student_name: string
  student_id: string
  reg_no: string
  card_number: string
  status: string
  issue_date: string
  expiry_date: string
  is_active: boolean
  print_count: number
}

interface CardPreviewData {
  card_number: string
  render_mode?: "default" | "pdf_template"
  rendered_image?: string
  print_pdf_url?: string
  render_hint?: string
  template?: { key?: string; name?: string; front_title?: string; back_text?: string }
  front?: {
    name?: string
    student_no?: string
    reg_no?: string
    course?: string
    gender?: string
    expiry_date?: string
    /** @deprecated Legacy one-line value; use QR instead */
    barcode_value?: string
    /** JSON string for QR (name, numbers, course, expiry, card_number, …) */
    qr_payload?: string
    passport_photo?: string
  }
  back?: {
    institution?: string
    issuer_title?: string
    issuer_signatory?: string
    issued_on?: string
    issued_on_display?: string
    return_to?: string
    tel?: string
    email?: string
  }
}

type BatchOpt = { id: number; name: string; code: string; academic_year: string }
type FacultyOpt = { id: number; name: string; code: string }
type CampusOpt = { id: number; name: string; code: string }
type ProgramOpt = { id: number; name: string; code: string; faculty_id: number | null }

function errDetail(err: unknown): string | undefined {
  return (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
}

function CameraCaptureDialog({
  open,
  onClose,
  onCapture,
}: {
  open: boolean
  onClose: () => void
  onCapture: (blob: Blob) => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "user" }, width: { ideal: 720 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const el = videoRef.current
        if (el) {
          el.srcObject = stream
          await el.play().catch(() => {})
        }
      } catch {
        onClose()
      }
    }
    void start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      const el = videoRef.current
      if (el) el.srcObject = null
    }
  }, [open, onClose])

  const snap = () => {
    const v = videoRef.current
    if (!v || v.videoWidth < 2) return
    const canvas = document.createElement("canvas")
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(v, 0, 0)
    canvas.toBlob(
      (b) => {
        if (b) onCapture(b)
        onClose()
      },
      "image/jpeg",
      0.92,
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Take photo with webcam</DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          Allow camera access when prompted. Capture a clear head-and-shoulders shot.
        </Typography>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", maxHeight: 360, borderRadius: 8, background: "#000" }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={snap}>
          Capture & use
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function IDCardsPage() {
  const AxiosInstance = useAxios()
  const [eligible, setEligible] = useState<EligibleStudent[]>([])
  const [cards, setCards] = useState<IDCardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [academicYear, setAcademicYear] = useState("")
  const [batchId, setBatchId] = useState("")
  const [facultyId, setFacultyId] = useState("")
  const [campusId, setCampusId] = useState("")
  const [programId, setProgramId] = useState("")
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [batches, setBatches] = useState<BatchOpt[]>([])
  const [faculties, setFaculties] = useState<FacultyOpt[]>([])
  const [campuses, setCampuses] = useState<CampusOpt[]>([])
  const [programs, setPrograms] = useState<ProgramOpt[]>([])
  const [creatingFor, setCreatingFor] = useState<number | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewCardId, setPreviewCardId] = useState<number | null>(null)
  const [preview, setPreview] = useState<CardPreviewData | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 450)
    return () => window.clearTimeout(t)
  }, [search])

  const filteredBatches = useMemo(() => {
    if (!academicYear) return batches
    return batches.filter((b) => (b.academic_year || "").trim() === academicYear)
  }, [batches, academicYear])

  const filteredPrograms = useMemo(() => {
    if (!facultyId) return programs
    const fid = Number(facultyId)
    return programs.filter((p) => (p.faculty_id ?? null) === fid)
  }, [programs, facultyId])

  const filterParams = useMemo(() => {
    const params: Record<string, string> = {}
    if (academicYear) params.academic_year = academicYear
    if (batchId) params.batch_id = batchId
    if (facultyId) params.faculty_id = facultyId
    if (campusId) params.campus_id = campusId
    if (programId) params.program_id = programId
    return params
  }, [academicYear, batchId, facultyId, campusId, programId])

  const loadFilterOptions = useCallback(async () => {
    setOptionsLoading(true)
    try {
      const { data } = await AxiosInstance.get("/api/admissions/id_cards/filter-options")
      setAcademicYears(Array.isArray(data?.academic_years) ? data.academic_years : [])
      setBatches(Array.isArray(data?.batches) ? data.batches : [])
      setFaculties(Array.isArray(data?.faculties) ? data.faculties : [])
      setCampuses(Array.isArray(data?.campuses) ? data.campuses : [])
      setPrograms(Array.isArray(data?.programs) ? data.programs : [])
    } catch (err: unknown) {
      setError(errDetail(err) || "Failed to load filter options")
    } finally {
      setOptionsLoading(false)
    }
  }, [AxiosInstance])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const eligibleParams: Record<string, string> = { ...filterParams }
      const cardParams: Record<string, string> = { ...filterParams }
      if (debouncedSearch) eligibleParams.q = debouncedSearch
      if (debouncedSearch) cardParams.q = debouncedSearch
      if (status) cardParams.status = status
      const [eligibleRes, cardsRes] = await Promise.all([
        AxiosInstance.get("/api/admissions/id_cards/eligible", { params: eligibleParams }),
        AxiosInstance.get("/api/admissions/id_cards", { params: cardParams }),
      ])
      setEligible(Array.isArray(eligibleRes.data) ? eligibleRes.data : [])
      setCards(Array.isArray(cardsRes.data) ? cardsRes.data : [])
    } catch (err: unknown) {
      setError(errDetail(err) || "Failed to load ID card data")
    } finally {
      setLoading(false)
    }
  }, [AxiosInstance, filterParams, debouncedSearch, status])

  const [photoTarget, setPhotoTarget] = useState<EligibleStudent | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoBlobUrlRef = useRef<string | null>(null)
  const [cropState, setCropState] = useState<{ src: string; originalFile: File | null } | null>(null)

  const closeCamera = useCallback(() => setCameraOpen(false), [])

  const closeCropDialog = useCallback(() => {
    setCropState((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src)
      return null
    })
  }, [])

  const closePhotoDialog = useCallback(() => {
    closeCropDialog()
    setPhotoTarget(null)
  }, [closeCropDialog])

  const openCropFromFile = useCallback((file: File) => {
    setCropState((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src)
      return { src: URL.createObjectURL(file), originalFile: file }
    })
  }, [])

  const openCropFromBlob = useCallback((blob: Blob, suggestedName = "capture.jpg") => {
    setCropState((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src)
      const file = new File([blob], suggestedName, { type: blob.type || "image/jpeg" })
      return { src: URL.createObjectURL(blob), originalFile: file }
    })
  }, [])

  const uploadPassportForAdmitted = useCallback(
    async (student: EligibleStudent, file: File) => {
      setPhotoUploading(true)
      setError("")
      try {
        const fd = new FormData()
        fd.append("passport_photo", file)
        await AxiosInstance.post(`/api/admissions/id_cards/admitted/${student.id}/passport_photo`, fd)
        await fetchData()
        setPhotoTarget((prev) =>
          prev && prev.id === student.id ? { ...prev, has_passport_photo: true } : prev,
        )
      } catch (err: unknown) {
        setError(errDetail(err) || "Could not save photo.")
      } finally {
        setPhotoUploading(false)
      }
    },
    [AxiosInstance, fetchData],
  )

  const deletePassportForAdmitted = useCallback(
    async (student: EligibleStudent) => {
      if (
        !window.confirm(
          "Remove this student’s stored passport photo from the application? You can add a new one afterwards. ID cards cannot be generated until a photo is on file again.",
        )
      ) {
        return
      }
      setPhotoUploading(true)
      setError("")
      try {
        await AxiosInstance.delete(`/api/admissions/id_cards/admitted/${student.id}/passport_photo`)
        await fetchData()
        setPhotoTarget((prev) =>
          prev && prev.id === student.id ? { ...prev, has_passport_photo: false } : prev,
        )
      } catch (err: unknown) {
        setError(errDetail(err) || "Could not remove photo.")
      } finally {
        setPhotoUploading(false)
      }
    },
    [AxiosInstance, fetchData],
  )

  useEffect(() => {
    const revoke = () => {
      if (photoBlobUrlRef.current) {
        URL.revokeObjectURL(photoBlobUrlRef.current)
        photoBlobUrlRef.current = null
      }
    }
    revoke()
    setPhotoPreviewUrl(null)
    if (!photoTarget?.has_passport_photo) {
      return () => {
        revoke()
      }
    }
    let alive = true
    ;(async () => {
      try {
        const res = await AxiosInstance.get(
          `/api/admissions/id_cards/admitted/${photoTarget.id}/passport_photo`,
          { responseType: "blob" },
        )
        if (!alive) return
        const u = URL.createObjectURL(res.data)
        photoBlobUrlRef.current = u
        setPhotoPreviewUrl(u)
      } catch {
        if (alive) setPhotoPreviewUrl(null)
      }
    })()
    return () => {
      alive = false
      revoke()
      setPhotoPreviewUrl(null)
    }
  }, [photoTarget, AxiosInstance])

  useEffect(() => {
    loadFilterOptions()
  }, [loadFilterOptions])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!batchId) return
    const ok = filteredBatches.some((b) => String(b.id) === batchId)
    if (!ok) setBatchId("")
  }, [filteredBatches, batchId])

  useEffect(() => {
    if (!programId) return
    const ok = filteredPrograms.some((p) => String(p.id) === programId)
    if (!ok) setProgramId("")
  }, [filteredPrograms, programId])

  const clearScopeFilters = () => {
    setAcademicYear("")
    setBatchId("")
    setFacultyId("")
    setCampusId("")
    setProgramId("")
  }

  const generateCard = async (admittedStudentId: number) => {
    setCreatingFor(admittedStudentId)
    setError("")
    try {
      await AxiosInstance.post("/api/admissions/id_cards/generate", { admitted_student_id: admittedStudentId })
      await fetchData()
    } catch (err: unknown) {
      setError(errDetail(err) || "Failed to generate ID card")
    } finally {
      setCreatingFor(null)
    }
  }

  const previewCard = async (cardId: number) => {
    setError("")
    try {
      const res = await AxiosInstance.get(`/api/admissions/id_cards/${cardId}/preview-data`)
      setPreviewCardId(cardId)
      setPreview(res.data || null)
      setPreviewOpen(true)
    } catch (err: unknown) {
      setError(errDetail(err) || "Failed to load preview data")
    }
  }

  const downloadPreviewPdf = async () => {
    if (!previewCardId) return
    try {
      const res = await AxiosInstance.get(`/api/admissions/id_cards/${previewCardId}/print.pdf`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }))
      const link = document.createElement("a")
      link.href = url
      link.download = `id-card-${preview?.card_number || previewCardId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setError(errDetail(err) || "Could not download PDF.")
    }
  }

  const revokeCard = async (cardId: number) => {
    const reason = window.prompt("Enter revoke reason:")
    if (!reason) return
    setError("")
    try {
      await AxiosInstance.post(`/api/admissions/id_cards/${cardId}/revoke`, { reason })
      await fetchData()
    } catch (err: unknown) {
      setError(errDetail(err) || "Failed to revoke card")
    }
  }

  const reissueCard = async (cardId: number) => {
    const reason = window.prompt("Enter reissue reason:")
    if (!reason) return
    setError("")
    try {
      await AxiosInstance.post(`/api/admissions/id_cards/${cardId}/reissue`, { reason })
      await fetchData()
    } catch (err: unknown) {
      setError(errDetail(err) || "Failed to reissue card")
    }
  }

  const cardStats = useMemo(() => {
    return {
      total: cards.length,
      active: cards.filter((c) => c.is_active).length,
      generated: cards.filter((c) => c.status === "generated").length,
      printed: cards.filter((c) => c.status === "printed" || c.status === "active").length,
    }
  }, [cards])

  const selectSx = { minWidth: { xs: "100%", sm: 160 } }

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Student IDs
        </Typography>
        <Button variant="outlined" component={Link} to="/admin/students/id-card-templates" startIcon={<MapIcon />}>
          Map ID card PDF templates
        </Button>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        Only students with <strong>physical documents verified</strong> at the admissions desk appear here.
        In the <strong>Eligible queue</strong> table (below, left), use the right-hand <strong>Actions</strong> column: click{" "}
        <strong>Add photo</strong> or <strong>View / replace photo</strong> on that student’s row. A window opens with{" "}
        <strong>Choose image file</strong>, <strong>Phone or tablet camera</strong>, and (on supported browsers){" "}
        <strong>This computer’s webcam</strong>. You can <strong>crop</strong> the image before saving, or <strong>delete</strong> an existing photo from the same window. Then use <strong>Generate</strong> for the ID card.
        For a generated card, open <strong>Preview</strong> in the right-hand table, then use <strong>Print</strong> at the bottom of the preview window.
        Use <strong>Map ID card PDF templates</strong> (button above) to configure PDF layouts the same way as admission offer letters.
      </Alert>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Filter by intake, year, faculty, campus, or programme
          </Typography>
          {optionsLoading ? (
            <CircularProgress size={22} />
          ) : (
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                useFlexGap
                flexWrap="wrap"
                alignItems={{ md: "flex-end" }}
              >
                <FormControl size="small" sx={selectSx}>
                  <InputLabel>Academic year</InputLabel>
                  <Select
                    label="Academic year"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(String(e.target.value))}
                  >
                    <MenuItem value="">All years</MenuItem>
                    {academicYears.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ ...selectSx, minWidth: { xs: "100%", sm: 220 } }}>
                  <InputLabel>Intake (batch)</InputLabel>
                  <Select
                    label="Intake (batch)"
                    value={batchId}
                    onChange={(e) => setBatchId(String(e.target.value))}
                  >
                    <MenuItem value="">All intakes</MenuItem>
                    {filteredBatches.map((b) => (
                      <MenuItem key={b.id} value={String(b.id)}>
                        {b.name} {b.code ? `(${b.code})` : ""}
                        {b.academic_year ? ` — ${b.academic_year}` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={selectSx}>
                  <InputLabel>Faculty</InputLabel>
                  <Select
                    label="Faculty"
                    value={facultyId}
                    onChange={(e) => setFacultyId(String(e.target.value))}
                  >
                    <MenuItem value="">All faculties</MenuItem>
                    {faculties.map((f) => (
                      <MenuItem key={f.id} value={String(f.id)}>
                        {f.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={selectSx}>
                  <InputLabel>Campus</InputLabel>
                  <Select
                    label="Campus"
                    value={campusId}
                    onChange={(e) => setCampusId(String(e.target.value))}
                  >
                    <MenuItem value="">All campuses</MenuItem>
                    {campuses.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ ...selectSx, minWidth: { xs: "100%", sm: 240 } }}>
                  <InputLabel>Programme</InputLabel>
                  <Select
                    label="Programme"
                    value={programId}
                    onChange={(e) => setProgramId(String(e.target.value))}
                  >
                    <MenuItem value="">All programmes</MenuItem>
                    {filteredPrograms.map((p) => (
                      <MenuItem key={p.id} value={String(p.id)}>
                        {p.name} {p.code ? `(${p.code})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" color="inherit" onClick={clearScopeFilters}>
                  Clear filters
                </Button>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 3 }}><Card><CardContent><Typography variant="caption">Total Cards</Typography><Typography variant="h5">{cardStats.total}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, md: 3 }}><Card><CardContent><Typography variant="caption">Active Cards</Typography><Typography variant="h5">{cardStats.active}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, md: 3 }}><Card><CardContent><Typography variant="caption">Generated</Typography><Typography variant="h5">{cardStats.generated}</Typography></CardContent></Card></Grid>
        <Grid size={{ xs: 12, md: 3 }}><Card><CardContent><Typography variant="caption">Printed/Active</Typography><Typography variant="h5">{cardStats.printed}</Typography></CardContent></Card></Grid>
      </Grid>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search by name/student no/reg no"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          select
          label="Card Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="generated">Generated</MenuItem>
          <MenuItem value="printed">Printed</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="revoked">Revoked</MenuItem>
          <MenuItem value="reissued">Reissued</MenuItem>
        </TextField>
        <Button variant="contained" onClick={() => void fetchData()}>Refresh</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Eligible queue</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Scroll the table sideways on small screens. To upload or take a picture, use the photo button in the
                last column (same row as the student).
              </Typography>
              {loading ? <CircularProgress size={22} /> : (
                <TableContainer sx={{ overflowX: "auto", maxWidth: "100%" }}>
                  <Table size="small" sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Student No.</TableCell>
                        <TableCell>Year / Intake</TableCell>
                        <TableCell>Faculty</TableCell>
                        <TableCell>Program</TableCell>
                        <TableCell>Photo</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eligible.length === 0 && (
                        <TableRow><TableCell colSpan={7}>No eligible students.</TableCell></TableRow>
                      )}
                      {eligible.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                            {!s.has_passport_photo && <Chip size="small" color="warning" label="No Photo" />}
                          </TableCell>
                          <TableCell>{s.student_id}</TableCell>
                          <TableCell>
                            <Typography variant="caption" display="block">{s.academic_year || "—"}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.batch || "—"}</Typography>
                          </TableCell>
                          <TableCell>{s.faculty || "—"}</TableCell>
                          <TableCell>{s.program}</TableCell>
                          <TableCell>
                            {s.has_passport_photo ? (
                              <Chip size="small" color="success" label="On file" variant="outlined" />
                            ) : (
                              <Chip size="small" color="warning" label="Missing" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                              <Button
                                size="small"
                                variant={s.has_passport_photo ? "outlined" : "contained"}
                                color={s.has_passport_photo ? "primary" : "warning"}
                                startIcon={<PhotoCamera fontSize="small" />}
                                onClick={() => setPhotoTarget(s)}
                              >
                                {s.has_passport_photo ? "View / replace" : "Add photo"}
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={creatingFor === s.id || !s.has_passport_photo}
                                onClick={() => generateCard(s.id)}
                              >
                                {creatingFor === s.id ? "Generating..." : "Generate"}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Generated Cards</Typography>
              {loading ? <CircularProgress size={22} /> : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Card No.</TableCell>
                        <TableCell>Student</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Issue</TableCell>
                        <TableCell>Expiry</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cards.length === 0 && (
                        <TableRow><TableCell colSpan={6}>No cards generated yet.</TableCell></TableRow>
                      )}
                      {cards.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.card_number}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.admitted_student_name}</Typography>
                            <Typography variant="caption">{c.student_id} / {c.reg_no}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={c.status} color={c.is_active ? "success" : "default"} />
                          </TableCell>
                          <TableCell>{c.issue_date}</TableCell>
                          <TableCell>{c.expiry_date || "—"}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button size="small" variant="outlined" onClick={() => previewCard(c.id)}>
                                Preview
                              </Button>
                              {c.is_active && (
                                <>
                                  <Button size="small" variant="outlined" color="warning" onClick={() => reissueCard(c.id)}>
                                    Reissue
                                  </Button>
                                  <Button size="small" variant="outlined" color="error" onClick={() => revokeCard(c.id)}>
                                    Revoke
                                  </Button>
                                </>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={Boolean(photoTarget)}
        onClose={() => {
          if (!photoUploading) closePhotoDialog()
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Passport photo for ID — {photoTarget?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            This is the same passport image stored on the application. It is used for ID card preview and printing.
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Upload or take a new picture (pick one):
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            After you choose an image, you can crop it to a passport-shaped frame before it is saved.
          </Typography>
          {photoUploading && <LinearProgress sx={{ mb: 2 }} />}
          <Box sx={{ textAlign: "center", mb: 2, minHeight: 120 }}>
            {photoPreviewUrl ? (
              <Box
                component="img"
                src={photoPreviewUrl}
                alt=""
                sx={{
                  maxWidth: "100%",
                  maxHeight: 320,
                  borderRadius: 1,
                  border: "1px solid #ddd",
                  objectFit: "contain",
                }}
              />
            ) : photoTarget?.has_passport_photo ? (
              <CircularProgress size={28} />
            ) : (
              <Typography color="text.secondary">No image on file. Upload or capture one below.</Typography>
            )}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="stretch"
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ "& > .MuiButton-root": { width: { xs: "100%", sm: "auto" }, justifyContent: "flex-start" } }}
          >
            <Button
              variant="contained"
              component="label"
              disabled={photoUploading || !photoTarget}
              startIcon={<UploadFile />}
            >
              Choose image file
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f && photoTarget) openCropFromFile(f)
                  e.target.value = ""
                }}
              />
            </Button>
            <Button variant="outlined" component="label" disabled={photoUploading || !photoTarget} startIcon={<PhotoCamera />}>
              Phone or tablet camera
              <input
                type="file"
                accept="image/*"
                capture="user"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f && photoTarget) openCropFromFile(f)
                  e.target.value = ""
                }}
              />
            </Button>
            {typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && (
              <Button
                variant="outlined"
                disabled={photoUploading || !photoTarget}
                startIcon={<Videocam />}
                onClick={() => setCameraOpen(true)}
              >
                This computer’s webcam
              </Button>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            “Phone or tablet camera” works best on a phone; on desktop it may open a file picker instead.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          {photoTarget?.has_passport_photo && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteOutline />}
              disabled={photoUploading}
              onClick={() => photoTarget && void deletePassportForAdmitted(photoTarget)}
            >
              Delete photo
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => !photoUploading && closePhotoDialog()}>Close</Button>
        </DialogActions>
      </Dialog>

      <CropPassportDialog
        open={Boolean(cropState)}
        imageSrc={cropState?.src ?? ""}
        originalFile={cropState?.originalFile ?? null}
        onClose={closeCropDialog}
        onComplete={(file) => {
          if (!photoTarget) return
          closeCropDialog()
          void uploadPassportForAdmitted(photoTarget, file)
        }}
      />

      <CameraCaptureDialog
        open={cameraOpen}
        onClose={closeCamera}
        onCapture={(blob) => {
          if (!photoTarget) return
          openCropFromBlob(blob, "webcam.jpg")
        }}
      />

      {previewOpen ? (
        <GlobalStyles
          styles={{
            "@media print": {
              "@page": { margin: "10mm", size: "auto" },
              body: { printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" },
              "body *": { visibility: "hidden" },
              ".id-card-print-dialog-paper, .id-card-print-dialog-paper *": { visibility: "visible" },
              ".id-card-print-dialog-paper": {
                position: "absolute",
                left: 0,
                top: 0,
                width: "100% !important",
                maxWidth: "100% !important",
                margin: "0 !important",
                boxShadow: "none !important",
                maxHeight: "none !important",
                overflow: "visible !important",
              },
              ".id-card-print-hide": { display: "none !important" },
              ".MuiBackdrop-root": { display: "none !important" },
            },
          }}
        />
      ) : null}

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            className: "id-card-print-dialog-paper",
            sx: { "@media print": { bgcolor: "#fff" } },
          },
        }}
      >
        <DialogTitle className="id-card-print-hide">
          ID Card Preview ({preview?.template?.name || "Default"})
        </DialogTitle>
        <DialogContent>
          {preview?.render_mode !== "pdf_template" && preview?.render_hint ? (
            <Alert severity="warning" sx={{ mb: 2 }} className="id-card-print-hide">
              {preview.render_hint}
            </Alert>
          ) : null}
          {preview?.render_mode === "pdf_template" && preview.rendered_image ? (
            <Box sx={{ textAlign: "center", py: 1 }}>
              <Box
                component="img"
                src={`data:image/png;base64,${preview.rendered_image}`}
                alt="ID card from PDF template"
                className="id-card-print-target"
                sx={{
                  maxWidth: "100%",
                  height: "auto",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }} className="id-card-print-hide">
                Rendered from active PDF template ({preview.template?.name || preview.template?.key}). Map fields
                under <strong>ID card templates</strong> if text or photo placement needs adjustment.
              </Typography>
            </Box>
          ) : (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Card sx={{ flex: 1, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" className="id-card-print-hide">
                  Front
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  {preview?.template?.front_title || "NDEJJE UNIVERSITY"}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
                  <Box sx={{ flexShrink: 0 }}>
                    {preview?.front?.passport_photo ? (
                      <Box
                        component="img"
                        src={preview.front.passport_photo}
                        alt="Applicant passport"
                        sx={{
                          width: 90,
                          height: 110,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid #ddd",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="warning.main" sx={{ display: "block", maxWidth: 100 }}>
                        No passport photo on file
                      </Typography>
                    )}
                  </Box>
                  <Stack spacing={0.35} sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {preview?.front?.name || "-"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Student No.:</strong> {preview?.front?.student_no || "-"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Reg No.:</strong> {preview?.front?.reg_no || "-"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Course:</strong> {preview?.front?.course || "-"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Gender:</strong> {preview?.front?.gender || "-"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Expiry:</strong> {preview?.front?.expiry_date || "-"}
                    </Typography>
                  </Stack>
                </Stack>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <IdCardStudentQr preview={preview} size={140} />
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, borderRadius: 2, bgcolor: "#f5f5f5" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }} className="id-card-print-hide">
                  Back (layout preview)
                </Typography>
                <IdCardBackPreview back={preview?.back} />
              </CardContent>
            </Card>
          </Stack>
          )}
        </DialogContent>
        <DialogActions className="id-card-print-hide" sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          {preview?.render_mode === "pdf_template" && preview.rendered_image ? (
            <Button variant="outlined" onClick={() => void downloadPreviewPdf()}>
              Download PDF
            </Button>
          ) : null}
          <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
