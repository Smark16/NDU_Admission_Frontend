import React from 'react';
import {
    Card,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    Chip,
    Paper,
    Typography,
    Avatar,
    Stack,
    CircularProgress,
} from '@mui/material';
import {  CheckCircle, Error } from '@mui/icons-material';
import { Clock } from 'lucide-react';

import { Box } from '@mui/system';

interface PaymentRecord {
  id: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentTime: string;
  feeDescription: string;
  transactionStatus: 'paid' | 'pending' | 'failed';
  intake: string;
  currencyType: 'local' | 'international';
}

// Helper functions
const getStatusIcon = (status: string) => {
    switch (status) {
        case 'paid':
            return <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />;
        case 'pending':
            return <Clock color="#f59e0b" size={20} />;   // Fixed: lucide-react uses 'color' and 'size'
        case 'failed':
            return <Error sx={{ color: '#ef4444', fontSize: 20 }} />;
        default:
            return null;
    }
};

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
        case 'paid':
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

interface PaymentsTableProps {
    payments: PaymentRecord[];
    loader: boolean;
    page: number;
    rowsPerPage: number;
    filteredPaymentsCount: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onViewDetails: (payment: PaymentRecord) => void;
}

function PaymentsTable({
    payments,
    page,
    rowsPerPage,
    loader,
    filteredPaymentsCount,
    onPageChange,
    onRowsPerPageChange,
    onViewDetails,
}: PaymentsTableProps) {
    return (
        <Card>
            <CardHeader
                title={`Payment Records (${filteredPaymentsCount})`}
                action={
                    <Stack direction="row" spacing={1}>
                    </Stack>
                }
                sx={{ borderBottom: '1px solid #e0e0e0' }}
            />

            <TableContainer component={Paper} elevation={0}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                Amount
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Payment Date & Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fee Type</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                Status
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loader ? (<>
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Box sx={{ p: 8, textAlign: "center", py: 12 }}>
                                <CircularProgress sx={{ color: "#7c1519" }} />
                                <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: "auto" }}>
                                    loading application payments please wait.
                                </Typography>
                            </Box>
                            </TableCell>
                        </TableRow>
                        </>) : payments.length > 0 ? (
                            payments.map((payment) => (
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
                                            label={payment.feeDescription}
                                            size="small"
                                            color={
                                                payment.feeDescription === 'Application Fee' ? 'info' : 'success'
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
                                                color={getStatusColor(payment.transactionStatus)}
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </TableCell>
                                   
                                    <TableCell align="center">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => onViewDetails(payment)}
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
                count={filteredPaymentsCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                sx={{
                    borderTop: '1px solid #e0e0e0',
                    '.MuiTablePagination-toolbar': {
                        minHeight: 56,
                    },
                }}
            />
        </Card>
    );
}

export default PaymentsTable;