/**
 * TuitionPaymentModal
 *
 * Two ways to pay:
 *   Tab 1 — Pay Online Now   (phone-initiated mobile money via SchoolPay, same flow as application fee)
 *   Tab 2 — Pay at Agent     (instructions for paying outside the portal using reg_no / payment code)
 *
 * Props:
 *   open               — show/hide
 *   onClose            — close callback
 *   onPaymentSuccess   — called when payment confirmed (receives receipt_number)
 *   totalRequired      — full tuition owed (UGX)
 *   totalPaid          — amount already paid (UGX)
 *   balance            — remaining balance (UGX)
 *   commitmentThreshold — 150,000 by default
 *   commitmentMet      — whether the 150k threshold is already met
 *   paymentCode        — student reg_no (SchoolPay reference)
 *   studentName        — display name
 */

import { useState, useEffect, useRef } from "react"
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
} from "@mui/material"
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
  Payment as PaymentIcon,
  PhoneAndroid as PhoneIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import CustomButton from "../../ReUsables/custombutton"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

type PayState = "idle" | "processing" | "success" | "error"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TuitionPaymentModalProps {
  open: boolean
  onClose: () => void
  onPaymentSuccess: (receiptNumber: string) => void
  totalRequired: number
  totalPaid: number
  balance: number
  commitmentThreshold: number
  commitmentMet: boolean
  paymentCode: string
  studentName: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TuitionPaymentModal({
  open,
  onClose,
  onPaymentSuccess,
  totalPaid,
  balance,
  commitmentThreshold,
  commitmentMet,
  paymentCode,
}: TuitionPaymentModalProps) {
  const axios = useAxios()
  const [tab, setTab] = useState(0)

  // Online payment state
  const [phone, setPhone] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [payState, setPayState] = useState<PayState>("idle")
  const [_paymentRef, setPaymentRef] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [receiptNumber, setReceiptNumber] = useState("")
  const [copied, setCopied] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Suggested amounts
  const suggestions = [
    ...(commitmentMet ? [] : [{ label: `Commitment fee`, amount: commitmentThreshold }]),
    ...(balance > 0 && balance !== commitmentThreshold ? [{ label: "Full balance", amount: balance }] : []),
  ]

  const payAmount =
    selectedAmount !== null
      ? selectedAmount
      : customAmount
      ? parseFloat(customAmount)
      : 0

  // Stop polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  // Reset on open
  useEffect(() => {
    if (open) {
      setTab(0)
      setPhone("")
      setSelectedAmount(null)
      setCustomAmount("")
      setPayState("idle")
      setPaymentRef("")
      setErrorMsg("")
      setReceiptNumber("")
    }
  }, [open])

  // ---------------------------------------------------------------------------
  // Initiate payment
  // ---------------------------------------------------------------------------
  const handlePay = async () => {
    setErrorMsg("")
    if (!phone.trim()) {
      setErrorMsg("Enter your mobile money phone number.")
      return
    }
    if (!payAmount || payAmount <= 0) {
      setErrorMsg("Choose or enter a valid amount.")
      return
    }

    setPayState("processing")
    try {
      const res = await axios.post("/api/payments/student/initiate_tuition_payment", {
        phone: phone.trim(),
        amount: payAmount,
      })
      setPaymentRef(res.data.payment_reference)
      startPolling(res.data.payment_reference)
    } catch (e: any) {
      setPayState("error")
      setErrorMsg(e.response?.data?.detail || "Could not initiate payment. Try again.")
    }
  }

  // ---------------------------------------------------------------------------
  // Poll for status
  // ---------------------------------------------------------------------------
  const startPolling = (ref: string) => {
    let attempts = 0
    pollRef.current = setInterval(async () => {
      attempts++
      try {
        const res = await axios.get(`/api/payments/student/tuition_payment_status/${ref}`)
        const s = res.data.status
        if (s === "PAID") {
          clearInterval(pollRef.current!)
          setReceiptNumber(res.data.receipt_number || "")
          setPayState("success")
          onPaymentSuccess(res.data.receipt_number || ref)
        } else if (s === "FAILED" || s === "CANCELLED") {
          clearInterval(pollRef.current!)
          setPayState("error")
          setErrorMsg("Payment was not completed. Please try again.")
        }
      } catch { /* ignore poll errors */ }

      // Stop after 3 minutes (22 × 8s ≈ 176s)
      if (attempts >= 22) {
        clearInterval(pollRef.current!)
        if (payState !== "success") {
          setPayState("error")
          setErrorMsg("Payment confirmation timed out. If you paid, it will reflect after reconciliation.")
        }
      }
    }, 8000)
  }

  // ---------------------------------------------------------------------------
  // Copy helper
  // ---------------------------------------------------------------------------
  const copyCode = () => {
    navigator.clipboard.writeText(paymentCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const AmountButton = ({ label, amount }: { label: string; amount: number }) => (
    <Box
      onClick={() => { setSelectedAmount(amount); setCustomAmount("") }}
      sx={{
        border: 2,
        borderColor: selectedAmount === amount ? "#3e397b" : "#ddd",
        borderRadius: 2,
        px: 2, py: 1.5,
        cursor: "pointer",
        bgcolor: selectedAmount === amount ? alpha("#3e397b", 0.08) : "white",
        transition: "all 0.15s",
        "&:hover": { borderColor: "#3e397b" },
        minWidth: 160,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#3e397b" }}>
        {fmt(amount)}
      </Typography>
    </Box>
  )

  return (
    <Dialog
      open={open}
      onClose={payState === "processing" ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "#3e397b", color: "white", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <PaymentIcon />
          <span>Pay Tuition Fees</span>
        </Stack>
        {payState !== "processing" && (
          <IconButton onClick={onClose} sx={{ color: "white" }} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* ── SUCCESS ── */}
        {payState === "success" && (
          <Box sx={{ textAlign: "center", py: 5, px: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 72, color: "#4caf50", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#2d2960", mb: 1 }}>
              Payment Confirmed!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your payment of {fmt(payAmount)} has been received.
            </Typography>
            {receiptNumber && (
              <Chip
                label={`Receipt: ${receiptNumber}`}
                color="success"
                sx={{ mb: 3, fontWeight: 600 }}
              />
            )}
            <br />
            <CustomButton variant="contained" text="Close" onClick={onClose} />
          </Box>
        )}

        {/* ── NORMAL FLOW ── */}
        {payState !== "success" && (
          <>
            {/* Balance summary strip */}
            <Box sx={{ bgcolor: "#f8f9ff", borderBottom: "1px solid #eee", px: 3, py: 2 }}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Box>
                  <Typography variant="caption" color="text.secondary">Balance Due</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#c62828" }}>
                    {fmt(balance)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Paid</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                    {fmt(totalPaid)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Commitment Status</Typography>
                  <Box>
                    <Chip
                      label={commitmentMet ? "Commitment Met ✓" : `Commitment: ${fmt(commitmentThreshold)} required`}
                      color={commitmentMet ? "success" : "warning"}
                      size="small"
                      sx={{ fontWeight: 600, mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Tabs */}
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ borderBottom: "1px solid #eee", px: 2 }}
              TabIndicatorProps={{ style: { backgroundColor: "#3e397b" } }}
            >
              <Tab
                label="Pay Online Now"
                icon={<PhoneIcon fontSize="small" />}
                iconPosition="start"
                sx={{ fontWeight: 600, textTransform: "none", "&.Mui-selected": { color: "#3e397b" } }}
              />
              <Tab
                label="Pay at Agent / Bank"
                icon={<InfoIcon fontSize="small" />}
                iconPosition="start"
                sx={{ fontWeight: 600, textTransform: "none", "&.Mui-selected": { color: "#3e397b" } }}
              />
            </Tabs>

            {/* ── TAB 0: Online Payment ── */}
            {tab === 0 && (
              <Box sx={{ px: 3, py: 3 }}>
                {payState === "processing" ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress sx={{ color: "#3e397b", mb: 2 }} size={48} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Waiting for payment confirmation…
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      A mobile money prompt has been sent to <strong>{phone}</strong>.
                      Approve it on your phone to complete payment.
                    </Typography>
                    <Typography color="text.secondary" variant="caption" sx={{ mt: 2, display: "block" }}>
                      Do not close this window. This will update automatically.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {/* Amount selection */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        How much do you want to pay?
                      </Typography>
                      {suggestions.length > 0 && (
                        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                          {suggestions.map(s => (
                            <AmountButton key={s.label} label={s.label} amount={s.amount} />
                          ))}
                        </Stack>
                      )}
                      <TextField
                        label="Or enter a custom amount (UGX)"
                        type="number"
                        fullWidth
                        value={customAmount}
                        onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                        inputProps={{ min: 1, step: "any" }}
                        size="small"
                      />
                    </Box>

                    {/* Phone number */}
                    <TextField
                      label="Mobile Money Phone Number *"
                      fullWidth
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 0771234567"
                      helperText="MTN or Airtel Uganda number — you will receive a payment prompt"
                      size="small"
                    />

                    {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                    <CustomButton
                      variant="contained"
                      text={`Pay ${payAmount > 0 ? fmt(payAmount) : "Now"}`}
                      onClick={handlePay}
                      disabled={!payAmount || payAmount <= 0 || !phone.trim()}
                    />

                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                      Payment processed securely by SchoolPay. You will receive a mobile money
                      prompt immediately after clicking Pay.
                    </Typography>
                  </Stack>
                )}
              </Box>
            )}

            {/* ── TAB 1: Agent / Offline Instructions ── */}
            {tab === 1 && (
              <Box sx={{ px: 3, py: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  You can pay at any SchoolPay agent, bank, or through MTN/Airtel mobile money
                  using the details below. Your payment will reflect in this portal after
                  reconciliation — you do not need to initiate payment here.
                </Alert>

                {/* Payment reference card */}
                <Box
                  sx={{
                    border: "2px solid #3e397b",
                    borderRadius: 2,
                    p: 2.5,
                    mb: 3,
                    bgcolor: alpha("#3e397b", 0.03),
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    Your SchoolPay Payment Reference
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#3e397b", letterSpacing: 2 }}>
                      {paymentCode}
                    </Typography>
                    <IconButton size="small" onClick={copyCode} title="Copy">
                      <CopyIcon fontSize="small" />
                    </IconButton>
                    {copied && (
                      <Typography variant="caption" color="success.main">Copied!</Typography>
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    This is your registration number — use it every time you pay tuition.
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Step-by-step instructions */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  How to pay:
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    "Go to your mobile money menu (MTN MoMo or Airtel Money) or visit a SchoolPay agent.",
                    "Select Pay Bills / Pay School Fees.",
                    `Enter the institution code provided by the admissions office.`,
                    `When prompted for a reference or student number, enter: ${paymentCode}`,
                    `Enter the amount you wish to pay. Minimum for academic enrollment activation: ${fmt(commitmentThreshold)}.`,
                    "Confirm the payment. Keep your receipt.",
                    "Your payment will reflect in this portal automatically. If it does not reflect within 24 hours, contact the finance office.",
                  ].map((step, i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          minWidth: 24, height: 24, borderRadius: "50%",
                          bgcolor: "#3e397b", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, mt: 0.2,
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Typography variant="body2">{step}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Alert severity="warning" icon={<InfoIcon />}>
                  <strong>Important:</strong> Always quote your reference number <strong>{paymentCode}</strong> when
                  paying. Payments made without the correct reference cannot be automatically
                  matched to your account.
                </Alert>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
