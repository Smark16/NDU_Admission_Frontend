"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  alpha,
} from "@mui/material"
import {
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  ErrorOutline as ErrorOutlineIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material"
import useAxios from "../../AxiosInstance/UseAxios"
import CustomButton from "../../ReUsables/custombutton"
import TuitionPaymentModal from "./TuitionPaymentModal"

interface TuitionItem {
  rule_id: number
  fee_head: string
  amount: number
  currency: string
  semester: {
    semester_id: number | null
    semester_name: string
    program_batch_id: number | null
    program_batch_name: string | null
  }
  installment_number: number | null
  due_date_days: number | null
}

interface PaymentHistory {
  id: number
  source: string
  amount: number
  currency: string
  status: string
  payment_method: string
  fee_head: string
  semester: string
  paid_at: string | null
  receipt_number: string
  is_waived: boolean
  label: string
}

interface AdHocCharge {
  id: number
  fee_head_name: string
  fee_head_category: string
  label: string
  amount: number
  currency: string
  status: string
  is_waived: boolean
  charged_by: string | null
  created_at: string
}

interface TuitionData {
  student_id: string
  reg_no: string
  program: string | null
  campus: string | null
  batch: string | null
  tuition_structure: TuitionItem[]
  total_required: number
  display_currency?: string
  pricing?: string
}

interface PaymentStatus {
  total_required: number
  total_paid: number
  balance: number
  percentage_paid: number
  payment_history: PaymentHistory[]
  display_currency?: string
  pricing?: string
  ad_hoc_charges?: AdHocCharge[]
  ad_hoc_total?: number
  // tuition payment / SchoolPay fields
  payment_code?: string
  commitment_threshold?: number
  commitment_met?: boolean
  commitment_paid_ugx?: number
}

export default function StudentTuitionFees() {
  const AxiosInstance = useAxios()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tuitionData, setTuitionData] = useState<TuitionData | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [payModalOpen, setPayModalOpen] = useState(false)

  useEffect(() => {
    fetchTuitionData()
    fetchPaymentStatus()
  }, [])

  const fetchTuitionData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await AxiosInstance.get("/api/payments/student/tuition_structure")
      setTuitionData(response.data)
    } catch (err: any) {
      console.error("Error fetching tuition structure:", err)
      setError(err.response?.data?.detail || "Failed to load tuition structure")
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentStatus = async () => {
    try {
      const response = await AxiosInstance.get("/api/payments/student/payment_status")
      setPaymentStatus(response.data)
    } catch (err: any) {
      console.error("Error fetching payment status:", err)
    }
  }

  const payCcy = paymentStatus?.display_currency || "UGX"
  const structCcy = tuitionData?.display_currency || "UGX"

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress size={50} sx={{ color: "#3e397b" }} />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!tuitionData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">
          No tuition structure found. Please contact the administration.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: "linear-gradient(135deg, #3e397b 0%, #5a4fa3 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(62, 57, 123, 0.3)",
            }}
          >
            <AccountBalanceIcon sx={{ color: "white", fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#2d2960" }}>
              Tuition Fees
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View your tuition structure and payment status
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Commitment Fee Status Banner ── */}
      {paymentStatus && (
        <Box
          sx={{
            borderRadius: 2,
            mb: 3,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            bgcolor: paymentStatus.commitment_met
              ? alpha("#4caf50", 0.1)
              : alpha("#ff9800", 0.1),
            border: `1.5px solid ${paymentStatus.commitment_met ? "#4caf50" : "#ff9800"}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {paymentStatus.commitment_met ? (
              <LockOpenIcon sx={{ color: "#2e7d32", fontSize: 28 }} />
            ) : (
              <LockIcon sx={{ color: "#e65100", fontSize: 28 }} />
            )}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: paymentStatus.commitment_met ? "#2e7d32" : "#e65100" }}>
                {paymentStatus.commitment_met
                  ? "Commitment Fee Paid — Academic Enrollment Unlocked"
                  : "Commitment Fee Required for Academic Enrollment"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {paymentStatus.commitment_met
                  ? `You have paid UGX ${(paymentStatus.commitment_paid_ugx ?? 0).toLocaleString()} which meets the UGX ${(paymentStatus.commitment_threshold ?? 150000).toLocaleString()} commitment requirement.`
                  : `Pay at least UGX ${(paymentStatus.commitment_threshold ?? 150000).toLocaleString()} to activate your academic enrollment. You have paid UGX ${(paymentStatus.commitment_paid_ugx ?? 0).toLocaleString()} so far.`}
              </Typography>
            </Box>
          </Stack>
          <CustomButton
            variant="contained"
            icon={<PaymentIcon />}
            text={paymentStatus.balance > 0 ? "Pay Now" : "View Payment Info"}
            onClick={() => setPayModalOpen(true)}
            sx={{
              bgcolor: paymentStatus.commitment_met ? "#2e7d32" : "#e65100",
              "&:hover": { bgcolor: paymentStatus.commitment_met ? "#1b5e20" : "#bf360c" },
            }}
          />
        </Box>
      )}

      {/* Payment Status Cards */}
      {paymentStatus && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #3e397b 0%, #5a4fa3 100%)",
                color: "white",
                boxShadow: "0 4px 12px rgba(62, 57, 123, 0.3)",
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PaymentIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Required
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(paymentStatus.total_required, payCcy)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                color: "white",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CheckCircleIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Paid
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(paymentStatus.total_paid, payCcy)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)",
                color: "white",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <WarningIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Balance
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(paymentStatus.balance, payCcy)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)",
                color: "white",
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUpIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Payment Progress
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {paymentStatus.percentage_paid.toFixed(1)}%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── SchoolPay Reference Card ── */}
      {paymentStatus?.payment_code && (
        <Card
          sx={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderRadius: 2,
            mb: 4,
            border: "1.5px solid #3e397b",
          }}
        >
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                Your SchoolPay Payment Reference
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#3e397b", letterSpacing: 3, mt: 0.5 }}>
                {paymentStatus.payment_code}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Use this reference number when paying at any SchoolPay agent, bank, or via mobile money.
                Your payment will reflect here automatically.
              </Typography>
            </Box>
            <CustomButton
              variant="outlined"
              icon={<PaymentIcon />}
              text="Pay Now / Instructions"
              onClick={() => setPayModalOpen(true)}
              sx={{ borderColor: "#3e397b", color: "#3e397b", whiteSpace: "nowrap" }}
            />
          </Box>
        </Card>
      )}

      {/* Tuition Structure */}
      <Card sx={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: 2, mb: 4 }}>
        <Box
          sx={{
            p: 3,
            bgcolor: "#3e397b",
            color: "white",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Tuition Structure
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Breakdown of fees by semester
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          {tuitionData.tuition_structure.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Alert severity="info">No tuition structure configured yet.</Alert>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fee Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Currency</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Installment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tuitionData.tuition_structure.map((item, index) => (
                    <TableRow
                      key={item.rule_id}
                      sx={{
                        "&:hover": { bgcolor: alpha("#3e397b", 0.04) },
                        bgcolor: index % 2 === 0 ? "transparent" : "#fafafa",
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={item.semester.semester_name}
                          size="small"
                          sx={{
                            bgcolor: alpha("#3e397b", 0.1),
                            color: "#3e397b",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{item.fee_head}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.amount, item.currency)}
                      </TableCell>
                      <TableCell>
                        <Chip label={item.currency} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {item.installment_number ? (
                          <Chip label={`Installment ${item.installment_number}`} size="small" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: alpha("#3e397b", 0.05) }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: "1rem" }}>
                      Total Required
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "1rem" }}>
                      {formatCurrency(tuitionData.total_required, structCcy)}
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Additional / Ad-Hoc Charges */}
      {paymentStatus && paymentStatus.ad_hoc_charges && paymentStatus.ad_hoc_charges.length > 0 && (
        <Card sx={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: 2, mb: 4 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: "#b71c1c",
              color: "white",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ErrorOutlineIcon />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Additional Charges
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Individual charges billed to your account
              </Typography>
            </Box>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentStatus.ad_hoc_charges.map((charge, idx) => (
                    <TableRow
                      key={charge.id}
                      sx={{
                        bgcolor: charge.is_waived
                          ? alpha("#f44336", 0.04)
                          : idx % 2 === 0 ? "transparent" : "#fafafa",
                        opacity: charge.is_waived ? 0.6 : 1,
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {charge.label}
                        </Typography>
                        {charge.is_waived && (
                          <Chip label="Waived" size="small" color="error" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={charge.fee_head_name}
                          size="small"
                          sx={{
                            bgcolor: alpha("#b71c1c", 0.1),
                            color: "#b71c1c",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(charge.amount, charge.currency)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={charge.status.charAt(0).toUpperCase() + charge.status.slice(1)}
                          color={
                            charge.status === "completed" ? "success"
                            : charge.status === "pending" ? "warning"
                            : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(charge.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paymentStatus.ad_hoc_total !== undefined && paymentStatus.ad_hoc_total > 0 && (
                    <TableRow sx={{ bgcolor: alpha("#b71c1c", 0.05) }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        Total Additional Charges
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {formatCurrency(paymentStatus.ad_hoc_total, payCcy)}
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {paymentStatus && paymentStatus.payment_history.length > 0 && (
        <Card sx={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: 2 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: "#3e397b",
              color: "white",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Payment History
            </Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fee Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentStatus.payment_history.map((payment, index) => (
                    <TableRow
                      key={payment.id}
                      sx={{
                        "&:hover": { bgcolor: alpha("#3e397b", 0.04) },
                        bgcolor: index % 2 === 0 ? "transparent" : "#fafafa",
                      }}
                    >
                      <TableCell>
                        {payment.paid_at
                          ? new Date(payment.paid_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>{payment.fee_head}</TableCell>
                      <TableCell>{payment.semester}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.payment_method.replace("_", " ").toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          color={
                            payment.status === "completed"
                              ? "success"
                              : payment.status === "pending"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {payment.receipt_number ? (
                          <Chip label={payment.receipt_number} size="small" />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      {/* Payment Modal */}
      {paymentStatus && (
        <TuitionPaymentModal
          open={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          onPaymentSuccess={() => {
            setPayModalOpen(false)
            fetchPaymentStatus()
          }}
          totalRequired={paymentStatus.total_required}
          totalPaid={paymentStatus.total_paid}
          balance={paymentStatus.balance}
          commitmentThreshold={paymentStatus.commitment_threshold ?? 150000}
          commitmentMet={paymentStatus.commitment_met ?? false}
          paymentCode={paymentStatus.payment_code ?? tuitionData?.reg_no ?? ""}
          studentName={tuitionData?.reg_no ?? ""}
        />
      )}
    </Container>
  )
}

