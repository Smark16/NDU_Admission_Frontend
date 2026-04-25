import { useCallback, useEffect, useState } from "react"
import type { AxiosInstance } from "axios"
import type { MatrixRow, ProgramBatchOption } from "./types"

interface Program {
  id: number
  name: string
  short_form?: string
}

export function useSemesterTuitionData(AxiosInstance: AxiosInstance) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [programBatches, setProgramBatches] = useState<ProgramBatchOption[]>([])
  const [programId, setProgramId] = useState<number | "">("")
  const [programBatchId, setProgramBatchId] = useState<number | "">("")
  const [rows, setRows] = useState<MatrixRow[]>([])
  const [feePlanName, setFeePlanName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState<{ msg: string; sev: "success" | "error" } | null>(null)

  const loadPrograms = useCallback(async () => {
    try {
      const { data } = await AxiosInstance.get("/api/program/list_programs")
      const list = Array.isArray(data) ? data : data?.results || data?.data || []
      setPrograms(list)
    } catch {
      setSnack({ msg: "Failed to load programs", sev: "error" })
    }
  }, [AxiosInstance])

  const loadProgramBatches = useCallback(async () => {
    if (!programId) {
      setProgramBatches([])
      return
    }
    try {
      const { data } = await AxiosInstance.get(`/api/program/program/${programId}/batches`)
      setProgramBatches(Array.isArray(data?.batches) ? data.batches : [])
    } catch {
      setSnack({ msg: "Failed to load program batches", sev: "error" })
      setProgramBatches([])
    }
  }, [AxiosInstance, programId])

  const loadMatrix = useCallback(async () => {
    if (!programId || !programBatchId) {
      setRows([])
      setFeePlanName(null)
      return
    }
    setLoading(true)
    try {
      const { data } = await AxiosInstance.get("/api/payments/batch_semester_fees/matrix", {
        params: { program_id: programId, program_batch_id: programBatchId },
      })
      setRows(data.rows || [])
      setFeePlanName(data.fee_plan?.name || null)
    } catch (e: unknown) {
      setRows([])
      setFeePlanName(null)
      const err = e as { response?: { data?: { detail?: string } } }
      setSnack({
        msg: err.response?.data?.detail || "Could not load semesters",
        sev: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [AxiosInstance, programId, programBatchId])

  useEffect(() => {
    loadPrograms()
  }, [loadPrograms])

  useEffect(() => {
    loadProgramBatches()
  }, [loadProgramBatches])

  useEffect(() => {
    loadMatrix()
  }, [loadMatrix])

  return {
    programs,
    programBatches,
    programId,
    setProgramId,
    programBatchId,
    setProgramBatchId,
    rows,
    feePlanName,
    loading,
    loadMatrix,
    snack,
    setSnack,
  }
}
