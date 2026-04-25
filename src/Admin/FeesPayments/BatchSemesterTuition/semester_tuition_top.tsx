import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material"
import { AccountBalance as BankIcon } from "@mui/icons-material"
import type { ProgramBatchOption } from "./types"

interface Program {
  id: number
  name: string
}

interface Props {
  programs: Program[]
  programBatches: ProgramBatchOption[]
  programId: number | ""
  setProgramId: (v: number | "") => void
  programBatchId: number | ""
  setProgramBatchId: (v: number | "") => void
}

export default function SemesterTuitionTop({
  programs,
  programBatches,
  programId,
  setProgramId,
  programBatchId,
  setProgramBatchId,
}: Props) {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <BankIcon sx={{ color: "#3e397b" }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Semester tuition
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose the program and the academic program batch (Year 1, Year 2, etc.) where semesters are defined in{" "}
        <strong>Academic Setup → Program batches &amp; semesters</strong>. Set tuition and functional fees per
        semester; one tuition fee plan per program holds the rules.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Program</InputLabel>
          <Select
            label="Program"
            value={programId === "" ? "" : programId}
            onChange={(e: SelectChangeEvent<string | number>) => {
              const v = e.target.value
              setProgramId(v === "" ? "" : Number(v))
              setProgramBatchId("")
            }}
          >
            <MenuItem value="">
              <em>Select program</em>
            </MenuItem>
            {programs.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 300 }} disabled={!programId}>
          <InputLabel>Program batch</InputLabel>
          <Select
            label="Program batch"
            value={programBatchId === "" ? "" : programBatchId}
            onChange={(e: SelectChangeEvent<string | number>) => {
              const v = e.target.value
              setProgramBatchId(v === "" ? "" : Number(v))
            }}
          >
            <MenuItem value="">
              <em>Select batch (e.g. Year 1)</em>
            </MenuItem>
            {programBatches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
                {typeof b.semester_count === "number" ? ` (${b.semester_count} semesters)` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </>
  )
}
