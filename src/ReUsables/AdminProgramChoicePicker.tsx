import { useMemo } from "react"
import { Autocomplete, Chip, TextField } from "@mui/material"

export type AdminProgramOption = {
  id: number
  name: string
  code?: string
  campus_ids: number[]
  academic_level_id: number | null
  academic_level: string
}

export type ProgramChoiceSeed = {
  id: number
  name: string
}

type Props = {
  campusId: number | ""
  options: AdminProgramOption[]
  valueIds: number[]
  onChange: (ids: number[]) => void
  currentChoices?: ProgramChoiceSeed[]
  disabled?: boolean
  maxSelections?: number
  academicLevelHint?: string
}

export default function AdminProgramChoicePicker({
  campusId,
  options,
  valueIds,
  onChange,
  currentChoices = [],
  disabled = false,
  maxSelections = 3,
  academicLevelHint,
}: Props) {
  const seedById = useMemo(() => {
    const map = new Map<number, string>()
    for (const s of currentChoices) {
      map.set(s.id, s.name)
    }
    return map
  }, [currentChoices])

  const resolveOption = (id: number): AdminProgramOption => {
    const fromCatalogue = options.find((p) => p.id === id)
    if (fromCatalogue) return fromCatalogue
    const name = seedById.get(id) || `Programme #${id}`
    return {
      id,
      name,
      campus_ids: [],
      academic_level_id: null,
      academic_level: "",
    }
  }

  const selectedObjects = useMemo(
    () => valueIds.map((id) => resolveOption(id)),
    [valueIds, options, seedById],
  )

  const programsAtCampus = useMemo(() => {
    if (campusId === "") return options
    const cid = Number(campusId)
    return options.filter((p) => p.campus_ids.includes(cid))
  }, [options, campusId])

  const autocompleteOptions = useMemo(() => {
    const merged: AdminProgramOption[] = [...selectedObjects]
    const seen = new Set(valueIds)
    for (const p of programsAtCampus) {
      if (!seen.has(p.id)) {
        merged.push(p)
      }
    }
    return merged
  }, [selectedObjects, programsAtCampus, valueIds])

  const helperParts = [
    `${valueIds.length} of ${maxSelections} selected`,
    academicLevelHint,
  ].filter(Boolean)

  return (
    <Autocomplete
      multiple
      fullWidth
      size="small"
      disablePortal
      disabled={disabled}
      options={autocompleteOptions}
      value={selectedObjects}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_, newValue: AdminProgramOption[]) => {
        const next = newValue.length > maxSelections ? newValue.slice(-maxSelections) : newValue
        onChange(next.map((p) => p.id))
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Preferred programmes"
          placeholder={
            valueIds.length > 0
              ? "Search to add or replace…"
              : "Search and select programmes..."
          }
          helperText={helperParts.join(" · ")}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={option.name}
            size="small"
            variant="outlined"
          />
        ))
      }
      sx={{
        "& .MuiAutocomplete-inputRoot": {
          alignItems: "flex-start",
          flexWrap: "wrap",
          minHeight: 112,
          maxHeight: 220,
          overflowY: "auto",
          py: 1,
        },
      }}
    />
  )
}
