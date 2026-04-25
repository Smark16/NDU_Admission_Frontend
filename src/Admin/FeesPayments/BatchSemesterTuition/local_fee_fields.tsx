"use client"

import { TextField, Typography, Box } from "@mui/material"

interface Props {
  currency: string
  tuition: string
  functional: string
  onTuition: (v: string) => void
  onFunctional: (v: string) => void
}

export default function LocalFeeFields({
  currency,
  tuition,
  functional,
  onTuition,
  onFunctional,
}: Props) {
  return (
    <Box sx={{ pt: 0.5 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Local / default amounts
      </Typography>
      <TextField
        label={`Tuition (${currency})`}
        type="number"
        fullWidth
        size="small"
        margin="normal"
        value={tuition}
        onChange={(e) => onTuition(e.target.value)}
        inputProps={{ min: 0 }}
      />
      <TextField
        label={`Functional fees (${currency})`}
        type="number"
        fullWidth
        size="small"
        margin="dense"
        value={functional}
        onChange={(e) => onFunctional(e.target.value)}
        inputProps={{ min: 0 }}
      />
    </Box>
  )
}
