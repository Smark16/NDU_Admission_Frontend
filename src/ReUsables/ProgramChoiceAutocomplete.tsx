import { Autocomplete, Chip, TextField } from "@mui/material"

export type ProgramOption = {
  id: number
  name: string
  code?: string
  campus_ids: number[]
}

export function programOptionLabel(p: ProgramOption): string {
  return p.code ? `${p.name} (${p.code})` : p.name
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
  const campusId = selectedCampus === "" ? null : Number(selectedCampus)
  const filtered = options.filter(
    (p) => campusId === null || p.campus_ids.includes(campusId),
  )
  const value = options.filter((p) => valueIds.includes(p.id))

  return (
    <Autocomplete
      multiple
      disabled={disabled || campusId === null}
      options={filtered}
      value={value}
      onChange={(_, newValue) => {
        if (newValue.length <= maxSelections) {
          onChange(newValue.map((p) => p.id))
        }
      }}
      getOptionLabel={programOptionLabel}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      filterSelectedOptions
      filterOptions={(opts, { inputValue }) => {
        const q = inputValue.trim().toLowerCase()
        if (!q) return opts
        return opts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.code || "").toLowerCase().includes(q),
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="Programmes"
          placeholder={campusId !== null ? "Search by name or code…" : "Select a campus first"}
          helperText={`${valueIds.length} of ${maxSelections} selected`}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={programOptionLabel(option)}
            size="small"
          />
        ))
      }
    />
  )
}
