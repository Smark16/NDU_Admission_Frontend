"use client"

import { useEffect, useState, type FormEvent } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material"
import useAxios from "../../../AxiosInstance/UseAxios"
import CustomButton from "../../../ReUsables/custombutton"
import IntlFeeFields from "./intl_fee_fields"
import LocalFeeFields from "./local_fee_fields"
import type { MatrixRow } from "./types"

interface Props {
  open: boolean
  onClose: () => void
  row: MatrixRow | null
  programId: number
  onSaved: () => void
  onError: (m: string) => void
  onSuccess: (m: string) => void
}

export default function SemesterTuitionDialog({
  open,
  onClose,
  row,
  programId,
  onSaved,
  onError,
  onSuccess,
}: Props) {
  const AxiosInstance = useAxios()
  const [tuition, setTuition] = useState("")
  const [functional, setFunctional] = useState("")
  const [tuitionIntl, setTuitionIntl] = useState("")
  const [functionalIntl, setFunctionalIntl] = useState("")
  const [currencyIntl, setCurrencyIntl] = useState("USD")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (row && open) {
      setTuition(row.tuition_amount.replace(/\.00$/, "") || "0")
      setFunctional(row.functional_amount.replace(/\.00$/, "") || "0")
      const ti = row.tuition_amount_international?.replace(/\.00$/, "") || ""
      const fi = row.functional_amount_international?.replace(/\.00$/, "") || ""
      setTuitionIntl(ti)
      setFunctionalIntl(fi)
      setCurrencyIntl(
        row.tuition_currency_international ||
          row.functional_currency_international ||
          "USD"
      )
    }
  }, [row, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!row) return
    setSaving(true)
    try {
      await AxiosInstance.post("/api/payments/batch_semester_fees/matrix", {
        program_id: programId,
        program_batch_id: row.program_batch_id,
        semester_id: row.semester_id,
        tuition_amount: tuition,
        functional_amount: functional,
        currency: row.currency || "UGX",
        tuition_amount_international: tuitionIntl.trim() || null,
        functional_amount_international: functionalIntl.trim() || null,
        currency_international: currencyIntl.trim() || "USD",
      })
      onSuccess("Tuition saved for this semester")
      onSaved()
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      onError(e.response?.data?.detail || "Could not save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create tuition for semester</DialogTitle>
        <DialogContent>
          {row ? (
            <Box sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {row.program_batch_name} · {row.semester_name}
              </Typography>
              <LocalFeeFields
                currency={row.currency || "UGX"}
                tuition={tuition}
                functional={functional}
                onTuition={setTuition}
                onFunctional={setFunctional}
              />
              <IntlFeeFields
                tuitionIntl={tuitionIntl}
                functionalIntl={functionalIntl}
                currencyIntl={currencyIntl}
                onTuitionIntl={setTuitionIntl}
                onFunctionalIntl={setFunctionalIntl}
                onCurrencyIntl={setCurrencyIntl}
              />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CustomButton text="Cancel" type="button" onClick={onClose} />
          <CustomButton text={saving ? "Saving…" : "Save"} type="submit" disabled={saving || !row} />
        </DialogActions>
      </form>
    </Dialog>
  )
}
