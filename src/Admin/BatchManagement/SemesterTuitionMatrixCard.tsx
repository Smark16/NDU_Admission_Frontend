"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import useAxios from "../../AxiosInstance/UseAxios"

export interface MatrixBatchOption {
  id: number
  name: string
  academic_year?: string
}

interface MatrixRow {
  semester_id: number
  semester_name: string
  order: number
  tuition_amount: string
  functional_amount: string
  currency: string
}

interface Props {
  programId: number | null
  batches: MatrixBatchOption[]
  onMessage: (message: string, severity: "success" | "error") => void
}

const SemesterTuitionMatrixCard: React.FC<Props> = ({ programId, batches, onMessage }) => {
  const AxiosInstance = useAxios()
  const [matrixRows, setMatrixRows] = useState<MatrixRow[]>([])
  const [matrixLoading, setMatrixLoading] = useState(false)
  const [matrixBatchId, setMatrixBatchId] = useState<number | null>(null)
  const [tuitionDrafts, setTuitionDrafts] = useState<
    Record<number, { tuition: string; functional: string; currency: string }>
  >({})

  useEffect(() => {
    if (!batches.length) {
      setMatrixBatchId(null)
      return
    }
    setMatrixBatchId((prev) => {
      if (prev != null && batches.some((b) => b.id === prev)) return prev
      return batches[0].id
    })
  }, [batches])

  const fetchMatrix = useCallback(async () => {
    if (!programId || matrixBatchId == null) {
      setMatrixRows([])
      return
    }
    setMatrixLoading(true)
    try {
      const { data } = await AxiosInstance.get<{ rows: MatrixRow[] }>(
        "/api/payments/batch_semester_fees/matrix",
        { params: { program_id: programId, program_batch_id: matrixBatchId } }
      )
      setMatrixRows(data.rows || [])
      const drafts: Record<number, { tuition: string; functional: string; currency: string }> = {}
      ;(data.rows || []).forEach((r) => {
        drafts[r.semester_id] = {
          tuition: r.tuition_amount || "0",
          functional: r.functional_amount || "0",
          currency: r.currency || "UGX",
        }
      })
      setTuitionDrafts(drafts)
    } catch {
      setMatrixRows([])
    } finally {
      setMatrixLoading(false)
    }
  }, [AxiosInstance, programId, matrixBatchId])

  useEffect(() => {
    if (programId && matrixBatchId != null) void fetchMatrix()
    else setMatrixRows([])
  }, [programId, matrixBatchId, fetchMatrix])

  const saveTuitionRow = async (programBatchId: number, semesterId: number) => {
    if (!programId || matrixBatchId == null) return
    const draft = tuitionDrafts[semesterId]
    if (!draft) return
    try {
      await AxiosInstance.post("/api/payments/batch_semester_fees/matrix", {
        program_id: programId,
        program_batch_id: programBatchId,
        semester_id: semesterId,
        tuition_amount: draft.tuition,
        functional_amount: draft.functional,
        currency: draft.currency || "UGX",
      })
      onMessage("Tuition amounts saved for this semester", "success")
      void fetchMatrix()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      onMessage(err.response?.data?.detail || "Could not save tuition", "error")
    }
  }

  if (!programId || batches.length === 0) return null

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Semester tuition &amp; functional fees
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: "center" }}>
          <Typography variant="body2" color="textSecondary">
            Set amounts per semester for the selected program batch (same data as Fees → Semester tuition).
          </Typography>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="matrix-batch-label">Program batch</InputLabel>
            <Select
              labelId="matrix-batch-label"
              label="Program batch"
              value={matrixBatchId ?? ""}
              onChange={(e) => {
                const raw = e.target.value as string | number
                if (raw === "" || raw === undefined) setMatrixBatchId(null)
                else setMatrixBatchId(typeof raw === "number" ? raw : Number(raw))
              }}
            >
              {batches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name} ({b.academic_year || "no year"})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {matrixLoading && <Typography>Loading fee matrix…</Typography>}
        {!matrixLoading && matrixRows.length === 0 && (
          <Typography color="textSecondary">No semesters in this batch to price.</Typography>
        )}
        {!matrixLoading && matrixRows.length > 0 && matrixBatchId != null && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Semester</TableCell>
                <TableCell>Tuition</TableCell>
                <TableCell>Functional</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell align="right">Save</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matrixRows.map((r) => (
                <TableRow key={r.semester_id}>
                  <TableCell>
                    {r.semester_name} (order {r.order})
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={tuitionDrafts[r.semester_id]?.tuition ?? r.tuition_amount}
                      onChange={(e) =>
                        setTuitionDrafts((prev) => ({
                          ...prev,
                          [r.semester_id]: {
                            tuition: e.target.value,
                            functional: prev[r.semester_id]?.functional ?? r.functional_amount,
                            currency: prev[r.semester_id]?.currency ?? r.currency,
                          },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={tuitionDrafts[r.semester_id]?.functional ?? r.functional_amount}
                      onChange={(e) =>
                        setTuitionDrafts((prev) => ({
                          ...prev,
                          [r.semester_id]: {
                            tuition: prev[r.semester_id]?.tuition ?? r.tuition_amount,
                            functional: e.target.value,
                            currency: prev[r.semester_id]?.currency ?? r.currency,
                          },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      sx={{ width: 80 }}
                      value={tuitionDrafts[r.semester_id]?.currency ?? r.currency}
                      onChange={(e) =>
                        setTuitionDrafts((prev) => ({
                          ...prev,
                          [r.semester_id]: {
                            tuition: prev[r.semester_id]?.tuition ?? r.tuition_amount,
                            functional: prev[r.semester_id]?.functional ?? r.functional_amount,
                            currency: e.target.value,
                          },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => void saveTuitionRow(matrixBatchId, r.semester_id)}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default SemesterTuitionMatrixCard
