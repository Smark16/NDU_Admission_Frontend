'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Grid,
  Chip,
  Paper,
  Typography,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Download,
  Print,
  Search,
  FileDownload,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import Clock from '@mui/icons-material/AccessTime';

interface PaymentRecord {
  id: string;
  studentName: string;
  studentCode: string;
  amount: number;
  paymentDate: string;
  paymentTime: string;
  paymentChannel: string;
  feeDescription: string;
  transactionStatus: 'completed' | 'pending' | 'failed';
  studentPaymentCode: string;
}

const mockPayments: PaymentRecord[] = [
  {
    id: '1',
    studentName: 'John Doe',
    studentCode: 'STU001',
    amount: 500000,
    paymentDate: '2024-03-10',
    paymentTime: '14:30:45',
    paymentChannel: 'Mobile Money',
    feeDescription: 'Application Fee',
    transactionStatus: 'completed',
    studentPaymentCode: 'PAY-2024-001',
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    studentCode: 'STU002',
    amount: 1000000,
    paymentDate: '2024-03-09',
    paymentTime: '10:15:20',
    paymentChannel: 'Bank Transfer',
    feeDescription: 'Commitment Fee',
    transactionStatus: 'completed',
    studentPaymentCode: 'PAY-2024-002',
  },
  {
    id: '3',
    studentName: 'Michael Johnson',
    studentCode: 'STU003',
    amount: 500000,
    paymentDate: '2024-03-08',
    paymentTime: '09:45:10',
    paymentChannel: 'Mobile Money',
    feeDescription: 'Application Fee',
    transactionStatus: 'completed',
    studentPaymentCode: 'PAY-2024-003',
  },
  {
    id: '4',
    studentName: 'Sarah Williams',
    studentCode: 'STU004',
    amount: 1000000,
    paymentDate: '2024-03-07',
    paymentTime: '16:20:30',
    paymentChannel: 'Credit Card',
    feeDescription: 'Commitment Fee',
    transactionStatus: 'pending',
    studentPaymentCode: 'PAY-2024-004',
  },
  {
    id: '5',
    studentName: 'David Brown',
    studentCode: 'STU005',
    amount: 500000,
    paymentDate: '2024-03-06',
    paymentTime: '11:00:00',
    paymentChannel: 'Mobile Money',
    feeDescription: 'Application Fee',
    transactionStatus: 'failed',
    studentPaymentCode: 'PAY-2024-005',
  },
  {
    id: '6',
    studentName: 'Emma Davis',
    studentCode: 'STU006',
    amount: 1000000,
    paymentDate: '2024-03-05',
    paymentTime: '13:45:15',
    paymentChannel: 'Bank Transfer',
    feeDescription: 'Commitment Fee',
    transactionStatus: 'completed',
    studentPaymentCode: 'PAY-2024-006',
  },
  {
    id: '7',
    studentName: 'Oliver Martinez',
    studentCode: 'STU007',
    amount: 500000,
    paymentDate: '2024-03-04',
    paymentTime: '15:30:45',
    paymentChannel: 'Mobile Money',
    feeDescription: 'Application Fee',
    transactionStatus: 'completed',
    studentPaymentCode: 'PAY-2024-007',
  },
  {
    id: '8',
    studentName: 'Sophia Wilson',
    studentCode: 'STU008',
    amount: 1000000,
    paymentDate: '2024-03-03',
    paymentTime: '12:15:30',
    paymentChannel: 'Credit Card',
    feeDescription: 'Commitment Fee',
    transactionStatus: 'completed',
    studentPaymentCode: 'PAY-2024-008',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />;
    case 'pending':
      return <Clock sx={{color:'#f59e0b', fontSize:20}} />;
    case 'failed':
      return <Error sx={{ color: '#ef4444', fontSize: 20 }} />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function Finance() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredPayments = useMemo(() => {
    let filtered = mockPayments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.studentPaymentCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (filterType === 'single' && singleDate) {
      filtered = filtered.filter((payment) => payment.paymentDate === singleDate);
    } else if (filterType === 'range') {
      if (fromDate) {
        filtered = filtered.filter((payment) => payment.paymentDate >= fromDate);
      }
      if (toDate) {
        filtered = filtered.filter((payment) => payment.paymentDate <= toDate);
      }
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((payment) => payment.transactionStatus === statusFilter);
    }

    // Fee type filter
    if (feeFilter) {
      filtered = filtered.filter((payment) => payment.feeDescription === feeFilter);
    }

    return filtered;
  }, [searchTerm, filterType, singleDate, fromDate, toDate, statusFilter, feeFilter]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSingleDate('');
    setFromDate('');
    setToDate('');
    setStatusFilter('');
    setFeeFilter('');
    setPage(0);
  };

  const totalAmount = filteredPayments
    .filter((p) => p.transactionStatus === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const completedCount = filteredPayments.filter(
    (p) => p.transactionStatus === 'completed'
  ).length;
  const pendingCount = filteredPayments.filter(
    (p) => p.transactionStatus === 'pending'
  ).length;
  const failedCount = filteredPayments.filter(
    (p) => p.transactionStatus === 'failed'
  ).length;

  const paginatedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Finance & Payments
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Track and manage student payment records
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs:12, sm:6, md:3}}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Total Collected
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                UGX {(totalAmount / 1000000).toFixed(2)}M
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                {completedCount} successful transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #7c1519 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(245, 87, 108, 0.3)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(245, 87, 108, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Completed Payments
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {completedCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                Successfully processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Pending Payments
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {pendingCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                Awaiting confirmation
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, sm:6, md:3}}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #7c1519 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(250, 112, 154, 0.3)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(250, 112, 154, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Failed Payments
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {failedCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                Requires action
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Filters & Search"
          sx={{ borderBottom: '1px solid #e0e0e0' }}
        />
        <CardContent>
          <Grid container spacing={2}>
            {/* Search Field */}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, code, or payment ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            {/* Date Filter Type */}
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Filter</InputLabel>
                <Select
                  value={filterType}
                  label="Date Filter"
                  onChange={(e) => {
                    setFilterType(e.target.value as 'single' | 'range');
                    setSingleDate('');
                    setFromDate('');
                    setToDate('');
                  }}
                >
                  <MenuItem value="single">Single Date</MenuItem>
                  <MenuItem value="range">Date Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date Inputs */}
            {filterType === 'single' ? (
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Payment Date"
                  value={singleDate}
                  onChange={(e) => {
                    setSingleDate(e.target.value);
                    setPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            ) : (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="From Date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(0);
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="To Date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(0);
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            {/* Status Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Fee Type Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Fee Type</InputLabel>
                <Select
                  value={feeFilter}
                  label="Fee Type"
                  onChange={(e) => {
                    setFeeFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Application Fee">Application Fee</MenuItem>
                  <MenuItem value="Commitment Fee">Commitment Fee</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12, md: 1 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleClearFilters}
                  sx={{ textTransform: 'none' }}
                >
                  Clear
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader
          title={`Payment Records (${filteredPayments.length})`}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<FileDownload />}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Export
              </Button>
              <Button
                size="small"
                startIcon={<Print />}
                variant="outlined"
                sx={{ textTransform: 'none' }}
                onClick={() => window.print()}
              >
                Print
              </Button>
            </Stack>
          }
          sx={{ borderBottom: '1px solid #e0e0e0' }}
        />
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Student Code
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Channel</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fee Type</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Code</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      },
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: 36,
                            height: 36,
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {payment.studentName.charAt(0)}
                          {payment.studentName.split(' ')[1]?.charAt(0) || ''}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {payment.studentName}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {payment.studentCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        UGX {payment.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {payment.paymentTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.paymentChannel}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.feeDescription}
                        size="small"
                        color={
                          payment.feeDescription === 'Application Fee'
                            ? 'info'
                            : 'success'
                        }
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                        {getStatusIcon(payment.transactionStatus)}
                        <Chip
                          label={getStatusLabel(payment.transactionStatus)}
                          size="small"
                          color={getStatusColor(payment.transactionStatus) as any}
                          variant="outlined"
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 500,
                          color: 'primary.main',
                        }}
                      >
                        {payment.studentPaymentCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewDetails(payment)}
                        sx={{ textTransform: 'none' }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No payment records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #e0e0e0',
            '.MuiTablePagination-toolbar': {
              minHeight: 56,
            },
          }}
        />
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>
          Payment Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedPayment && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Student Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPayment.studentName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Student Code
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPayment.studentCode}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Payment Code
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                  {selectedPayment.studentPaymentCode}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  UGX {selectedPayment.amount.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Payment Date & Time
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedPayment.paymentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  at {selectedPayment.paymentTime}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Payment Channel
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPayment.paymentChannel}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Fee Description
                </Typography>
                <Chip label={selectedPayment.feeDescription} sx={{ mt: 0.5 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Transaction Status
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  {getStatusIcon(selectedPayment.transactionStatus)}
                  <Chip
                    label={getStatusLabel(selectedPayment.transactionStatus)}
                    color={getStatusColor(selectedPayment.transactionStatus) as any}
                  />
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            sx={{ textTransform: 'none' }}
          >
            Download Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
