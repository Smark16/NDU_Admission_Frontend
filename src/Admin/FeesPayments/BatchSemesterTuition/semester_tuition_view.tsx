import { Box, Button, Container, Alert, CircularProgress, Snackbar } from "@mui/material"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import BatchSemesterTree from "./batch_semester_tree"
import SemesterTuitionBulkUpload from "./semester_tuition_bulk_upload"
import SemesterTuitionDialog from "./semester_tuition_dialog"
import SemesterTuitionTop from "./semester_tuition_top"
import type { MatrixRow, ProgramBatchOption } from "./types"
import { useState } from "react"

interface Props {
  programs: { id: number; name: string }[]
  programBatches: ProgramBatchOption[]
  programId: number | ""
  setProgramId: (v: number | "") => void
  programBatchId: number | ""
  setProgramBatchId: (v: number | "") => void
  rows: MatrixRow[]
  feePlanName: string | null
  loading: boolean
  dialogRow: MatrixRow | null
  setDialogRow: (r: MatrixRow | null) => void
  loadMatrix: () => Promise<void>
  snack: { msg: string; sev: "success" | "error" } | null
  setSnack: (v: { msg: string; sev: "success" | "error" } | null) => void
}

export default function SemesterTuitionView(props: Props) {
  const {
    programs,
    programBatches,
    programId,
    setProgramId,
    programBatchId,
    setProgramBatchId,
    rows,
    feePlanName,
    loading,
    dialogRow,
    setDialogRow,
    loadMatrix,
    snack,
    setSnack,
  } = props

  const [bulkOpen, setBulkOpen] = useState(false)

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <SemesterTuitionTop
        programs={programs}
        programBatches={programBatches}
        programId={programId}
        setProgramId={setProgramId}
        programBatchId={programBatchId}
        setProgramBatchId={setProgramBatchId}
      />

      {feePlanName && programId && programBatchId ? (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            rows.length > 0 ? (
              <Button
                size="small"
                startIcon={<UploadFileIcon />}
                onClick={() => setBulkOpen(true)}
                sx={{ color: "#1b5e20", fontWeight: 600, whiteSpace: "nowrap" }}
              >
                Bulk Upload
              </Button>
            ) : undefined
          }
        >
          Fee plan: <strong>{feePlanName}</strong>
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : programId && programBatchId ? (
        <BatchSemesterTree rows={rows} onOpenSemester={(r) => setDialogRow(r)} />
      ) : null}

      {programId && programBatchId ? (
        <SemesterTuitionBulkUpload
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          programId={Number(programId)}
          programBatchId={Number(programBatchId)}
          rows={rows}
          onSaved={loadMatrix}
          onSuccess={(m) => { setBulkOpen(false); setSnack({ msg: m, sev: "success" }) }}
          onError={(m) => setSnack({ msg: m, sev: "error" })}
        />
      ) : null}

      {programId && programBatchId ? (
        <SemesterTuitionDialog
          open={!!dialogRow}
          onClose={() => setDialogRow(null)}
          row={dialogRow}
          programId={Number(programId)}
          onSaved={loadMatrix}
          onError={(m) => setSnack({ msg: m, sev: "error" })}
          onSuccess={(m) => setSnack({ msg: m, sev: "success" })}
        />
      ) : null}

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snack ? (
          <Alert severity={snack.sev} onClose={() => setSnack(null)} sx={{ width: "100%" }}>
            {snack.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Container>
  )
}
