import {
  Box,
  Button,
  Chip,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import Clock from '@mui/icons-material/AccessTime';

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

// Helper functions (same as in main component and table)
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />;
    case 'pending':
      return <Clock sx={{ color: '#f59e0b', fontSize: 20 }} />;
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

interface PaymentDetailsProps {
  open: boolean;
  payment: PaymentRecord | null;
  onClose: () => void;
}

function PaymentDetails({ open, payment, onClose }: PaymentDetailsProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>
        Payment Details
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {payment ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Student Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {payment.studentName}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Amount
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                UGX {payment.amount.toLocaleString()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Payment Date & Time
              </Typography>
              <Typography variant="body1">
                {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                at {payment.paymentTime}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Fee Description
              </Typography>
              <Chip label={payment.feeDescription} sx={{ mt: 0.5 }} />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Transaction Status
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                {getStatusIcon(payment.transactionStatus)}
                <Chip
                  label={getStatusLabel(payment.transactionStatus)}
                  color={getStatusColor(payment.transactionStatus)}
                />
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 4 }}>
            No payment selected
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentDetails;