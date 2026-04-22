import { Box, FormControl, InputLabel, Select, MenuItem, FormHelperText, Typography } from "@mui/material"

interface Props {
  label?: string
  value: string           // YYYY-MM-DD
  onChange: (value: string) => void
  error?: boolean
  helperText?: string
  required?: boolean
  maxYear?: number
  minYear?: number
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function daysInMonth(month: number, year: number) {
  if (!month) return 31
  return new Date(year || 2000, month, 0).getDate()
}

export default function DateDropdownPicker({
  label = "Date of Birth",
  value,
  onChange,
  error,
  helperText,
  required,
  maxYear = new Date().getFullYear() - 15,
  minYear = 1940,
}: Props) {
  // Parse current value
  const parts = value ? value.split("-") : ["", "", ""]
  const year = parts[0] || ""
  const month = parts[1] || ""
  const day = parts[2] || ""

  const numMonth = parseInt(month, 10)
  const numYear = parseInt(year, 10)
  const maxDays = daysInMonth(numMonth, numYear)

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)
  const days = Array.from({ length: maxDays }, (_, i) => i + 1)

  const emit = (d: string, m: string, y: string) => {
    if (d && m && y) {
      const dd = d.padStart(2, "0")
      const mm = m.padStart(2, "0")
      onChange(`${y}-${mm}-${dd}`)
    } else {
      onChange("")
    }
  }

  const handleDay = (d: string) => emit(d, month, year)
  const handleMonth = (m: string) => {
    // Clamp day if new month has fewer days
    const maxD = daysInMonth(parseInt(m, 10), numYear)
    const clampedDay = parseInt(day, 10) > maxD ? String(maxD) : day
    emit(clampedDay, m, year)
  }
  const handleYear = (y: string) => {
    const maxD = daysInMonth(numMonth, parseInt(y, 10))
    const clampedDay = parseInt(day, 10) > maxD ? String(maxD) : day
    emit(clampedDay, month, y)
  }

  const selectSx = {
    bgcolor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: error ? "#d32f2f" : undefined,
    },
  }

  return (
    <Box>
      {label && (
        <Typography variant="caption" sx={{ color: error ? "#d32f2f" : "#666", fontWeight: 600, mb: 0.5, display: "block" }}>
          {label}{required && " *"}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 1 }}>
        {/* Day */}
        <FormControl size="small" sx={{ minWidth: 80 }} error={error}>
          <InputLabel>Day</InputLabel>
          <Select value={day} label="Day" onChange={e => handleDay(e.target.value)} sx={selectSx}>
            <MenuItem value=""><em>Day</em></MenuItem>
            {days.map(d => (
              <MenuItem key={d} value={String(d)}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Month */}
        <FormControl size="small" sx={{ flex: 1 }} error={error}>
          <InputLabel>Month</InputLabel>
          <Select value={month} label="Month" onChange={e => handleMonth(e.target.value)} sx={selectSx}>
            <MenuItem value=""><em>Month</em></MenuItem>
            {MONTHS.map((name, i) => (
              <MenuItem key={i + 1} value={String(i + 1)}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Year */}
        <FormControl size="small" sx={{ minWidth: 90 }} error={error}>
          <InputLabel>Year</InputLabel>
          <Select value={year} label="Year" onChange={e => handleYear(e.target.value)} sx={selectSx}>
            <MenuItem value=""><em>Year</em></MenuItem>
            {years.map(y => (
              <MenuItem key={y} value={String(y)}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {helperText && (
        <FormHelperText error={error} sx={{ mx: "14px" }}>{helperText}</FormHelperText>
      )}
    </Box>
  )
}
