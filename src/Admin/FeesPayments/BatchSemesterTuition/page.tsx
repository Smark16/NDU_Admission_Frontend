"use client"

import { useState } from "react"
import useAxios from "../../../AxiosInstance/UseAxios"
import SemesterTuitionView from "./semester_tuition_view"
import { useSemesterTuitionData } from "./useSemesterTuitionData"
import type { MatrixRow } from "./types"

export default function BatchSemesterTuitionPage() {
  const AxiosInstance = useAxios()
  const [dialogRow, setDialogRow] = useState<MatrixRow | null>(null)
  const data = useSemesterTuitionData(AxiosInstance)

  return (
    <SemesterTuitionView
      programs={data.programs}
      programBatches={data.programBatches}
      programId={data.programId}
      setProgramId={data.setProgramId}
      programBatchId={data.programBatchId}
      setProgramBatchId={data.setProgramBatchId}
      rows={data.rows}
      feePlanName={data.feePlanName}
      loading={data.loading}
      dialogRow={dialogRow}
      setDialogRow={setDialogRow}
      loadMatrix={data.loadMatrix}
      snack={data.snack}
      setSnack={data.setSnack}
    />
  )
}
