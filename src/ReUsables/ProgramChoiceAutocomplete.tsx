import { useEffect, useMemo, useState } from "react"
import SearchIcon from "@mui/icons-material/Search"
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material"

export type ProgramOption = {
  id: number
  name: string
  code?: string
  campus_ids: number[]
}

export function programOptionLabel(p: ProgramOption): string {
  return p.code ? `${p.name} (${p.code})` : p.name
}

export function resolveCampusDisplayName(
  selectedCampus: number | "",
  campusOptions: Array<{ id: number; name: string }>,
  application?: any,
): string {
  if (selectedCampus !== "") {
    const hit = campusOptions.find((c) => c.id === Number(selectedCampus))
    if (hit) return hit.name
  }
  if (typeof application?.campus === "string" && application.campus) {
    return application.campus
  }
  if (application?.campus?.name) return application.campus.name
  return "Not set on application"
}

export function resolveDefaultCampusId(
  application: any,
  campusOptions: Array<{ id: number; name: string }>,
): number | "" {
  const raw = application?.campus_id ?? application?.campus?.id
  if (raw != null && raw !== "" && Number.isFinite(Number(raw))) {
    return Number(raw)
  }
  const campusName =
    typeof application?.campus === "string"
      ? application.campus
      : application?.campus?.name
  if (campusName && campusOptions.length) {
    const hit = campusOptions.find(
      (c) => c.name.toLowerCase() === String(campusName).toLowerCase(),
    )
    if (hit) return hit.id
  }
  return ""
}

export function resolveDefaultProgramIds(
  program_choices: Array<{ program_id?: number; choice_order?: number }> | undefined,
  application?: { programs?: Array<{ id: number }> },
): number[] {
  if (program_choices?.length) {
    return [...program_choices]
      .sort((a, b) => (a.choice_order ?? 99) - (b.choice_order ?? 99))
      .map((p) => Number(p.program_id))
      .filter((id) => Number.isFinite(id) && id > 0)
  }
  return (application?.programs ?? [])
    .map((p) => Number(p.id))
    .filter((id) => Number.isFinite(id) && id > 0)
}

type Props = {
  options: ProgramOption[]
  selectedCampus: number | ""
  valueIds: number[]
  onChange: (ids: number[]) => void
  maxSelections?: number
  disabled?: boolean
}

export default function ProgramChoiceAutocomplete({
  options,
  selectedCampus,
  valueIds,
  onChange,
  maxSelections = 3,
  disabled = false,
}: Props) {
  const [search, setSearch] = useState("")
  const campusId = selectedCampus === "" ? null : Number(selectedCampus)

  useEffect(() => {
    setSearch("")
  }, [selectedCampus])

  const byCampus = useMemo(
    () =>
      options.filter(
        (p) => campusId === null || p.campus_ids.includes(campusId),
      ),
    [options, campusId],
  )

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return byCampus
    return byCampus.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q),
    )
  }, [byCampus, search])

  const toggleProgram = (programId: number, checked: boolean) => {
    if (checked) {
      if (valueIds.length < maxSelections) {
        onChange([...valueIds, programId])
      }
    } else {
      onChange(valueIds.filter((id) => id !== programId))
    }
  }

  return (
    <Box>
      <TextField
        size="small"
        fullWidth
        placeholder={campusId === null ? "Campus not set" : "Type to narrow the list…"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled || campusId === null}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#999", fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 1 }}
      />

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        {campusId === null
          ? "Campus required to list programmes."
          : search.trim()
            ? `${visible.length} match(es) · ${valueIds.length} of ${maxSelections} selected`
            : `${byCampus.length} programme(s) at this campus · ${valueIds.length} of ${maxSelections} selected`}
      </Typography>

      <FormGroup
        sx={{
          maxHeight: 280,
          overflowY: "auto",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          p: 1,
          bgcolor: campusId === null ? "#fafafa" : "#fff",
        }}
      >
        {campusId === null ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 0.5 }}>
            Campus is not set on this application.
          </Typography>
        ) : visible.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 0.5 }}>
            No programmes match your search.
          </Typography>
        ) : (
          visible.map((p) => {
            const checked = valueIds.includes(p.id)
            const atLimit = !checked && valueIds.length >= maxSelections
            return (
              <FormControlLabel
                key={p.id}
                control={
                  <Checkbox
                    checked={checked}
                    disabled={disabled || atLimit}
                    onChange={(e) => toggleProgram(p.id, e.target.checked)}
                    sx={{ color: "#0D0060", "&.Mui-checked": { color: "#0D0060" } }}
                  />
                }
                label={programOptionLabel(p)}
              />
            )
          })
        )}
      </FormGroup>
    </Box>
  )
}
