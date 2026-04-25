"use client"

import { useMemo } from "react"
import { Box, Paper, Typography, Chip, Stack } from "@mui/material"
import CustomButton from "../../../ReUsables/custombutton"
import type { MatrixRow } from "./types"

interface Props {
  rows: MatrixRow[]
  onOpenSemester: (row: MatrixRow) => void
}

function hasAmounts(r: MatrixRow) {
  const t = parseFloat(r.tuition_amount) || 0
  const f = parseFloat(r.functional_amount) || 0
  return t > 0 || f > 0
}

export default function BatchSemesterTree({ rows, onOpenSemester }: Props) {
  const grouped = useMemo(() => {
    const m = new Map<number, { name: string; items: MatrixRow[] }>()
    rows.forEach((r) => {
      if (!m.has(r.program_batch_id)) {
        m.set(r.program_batch_id, { name: r.program_batch_name, items: [] })
      }
      m.get(r.program_batch_id)!.items.push(r)
    })
    return Array.from(m.entries()).map(([id, v]) => ({
      program_batch_id: id,
      program_batch_name: v.name,
      semesters: v.items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
  }, [rows])

  if (!rows.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        No semesters in this batch yet. Add batches and semesters under Academic Setup → Program batches &amp;
        semesters.
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {grouped.map((g) => (
        <Paper key={g.program_batch_id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            {g.program_batch_name}
          </Typography>
          <Stack spacing={1.5}>
            {g.semesters.map((r) => {
              const set = hasAmounts(r)
              return (
                <Box
                  key={`${r.program_batch_id}-${r.semester_id}`}
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {r.semester_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Order {r.order}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    {set ? (
                      <Chip
                        size="small"
                        label={(() => {
                          const cur = r.currency || "UGX"
                          const base = `${cur} ${r.tuition_amount} / ${r.functional_amount}`
                          const ti = r.tuition_amount_international
                          const fi = r.functional_amount_international
                          const ic =
                            r.tuition_currency_international ||
                            r.functional_currency_international ||
                            "USD"
                          if (ti || fi) {
                            return `${base} · Intl ${ic} ${ti || "—"} / ${fi || "—"}`
                          }
                          return base
                        })()}
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip size="small" label="Not set" variant="outlined" />
                    )}
                    <CustomButton
                      text={set ? "Edit tuition" : "Create tuition for semester"}
                      onClick={() => onOpenSemester(r)}
                      sx={{ minWidth: "auto", px: 1.5 }}
                    />
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}
