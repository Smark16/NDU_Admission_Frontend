"use client"

import { TextField, Typography, Box } from "@mui/material"

interface Props {
  tuitionIntl: string
  functionalIntl: string
  currencyIntl: string
  onTuitionIntl: (v: string) => void
  onFunctionalIntl: (v: string) => void
  onCurrencyIntl: (v: string) => void
}

export default function IntlFeeFields({
  tuitionIntl,
  functionalIntl,
  currencyIntl,
  onTuitionIntl,
  onFunctionalIntl,
  onCurrencyIntl,
}: Props) {
  return (
    <Box sx={{ mt: 1, pt: 2, borderTop: 1, borderColor: "divider" }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        International students (optional — uses application nationality; Uganda / Ugandan = local)
      </Typography>
      <TextField
        label="Tuition (international)"
        type="number"
        fullWidth
        size="small"
        margin="dense"
        value={tuitionIntl}
        onChange={(e) => onTuitionIntl(e.target.value)}
        inputProps={{ min: 0 }}
      />
      <TextField
        label="Functional fees (international)"
        type="number"
        fullWidth
        size="small"
        margin="dense"
        value={functionalIntl}
        onChange={(e) => onFunctionalIntl(e.target.value)}
        inputProps={{ min: 0 }}
      />
      <TextField
        label="International currency"
        fullWidth
        size="small"
        margin="dense"
        placeholder="USD"
        value={currencyIntl}
        onChange={(e) => onCurrencyIntl(e.target.value.toUpperCase().slice(0, 3))}
        inputProps={{ maxLength: 3 }}
      />
    </Box>
  )
}
