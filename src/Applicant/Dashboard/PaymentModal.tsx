import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  Divider,
  InputAdornment,
  Fade,
//   Paper,
} from '@mui/material';
import {
  CheckCircle,
  AlertCircle,
  Lock,
  Phone,
  FileText,
  DollarSign,
  X,
  ArrowRight,
} from 'lucide-react';
import CustomButton from '../../ReUsables/custombutton';
import useAxios from '../../AxiosInstance/UseAxios';
import { AuthContext } from '../../Context/AuthContext';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentSuccess?: (externalReference?: string) => void;
  amountPaid?: number;
  currency?: string;
  reason?: string;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onPaymentSuccess,
  amountPaid,
  currency = 'UGX',
  reason = 'Application Fee',
}) => {
  const AxiosInstance = useAxios()
  const {loggeduser} = useContext(AuthContext) || {}
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const [extRef, setExtRef] = useState<string | null>(null);
 const [pollInterval, setPollInterval] = useState<number | null>(null);

  const handleClose = () => {
    setPhoneNumber('');
    setStatus('idle');
    setErrorMessage('');
    setSuccessMessage('');
    setTransactionId('');
    onClose();
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Uganda phone number validation (10-12 digits)
    const phoneRegex = /^(\+?256|0)?[7][0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

    useEffect(() => {
    if (status === 'success' && onPaymentSuccess) {
      onPaymentSuccess(extRef || undefined);

      // Auto-close modal after showing success for 1.8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [status, onPaymentSuccess, extRef]);

// Clean up polling on unmount/close
useEffect(() => {
  return () => {
    if (pollInterval !== null) {
      clearInterval(pollInterval);  
    }
  };
}, [pollInterval]);

const handlePayment = async () => {
  // ✅ Validate phone
  if (!phoneNumber.trim() || !validatePhoneNumber(phoneNumber)) {
    setErrorMessage('Valid Uganda phone number required');
    setStatus('error');
    return;
  }

  setStatus('processing');
  setErrorMessage('');
  setSuccessMessage('');

  try {
    const payload = {
      phone: phoneNumber.replace(/\D/g, ''),
      amount: Number(amountPaid),
      first_name: loggeduser?.first_name,
      last_name: loggeduser?.last_name,
    };

    const res = await AxiosInstance.post(
      '/api/payments/initiate_payment/',
      payload
    );

    const data = res.data;

    // ✅ Save references
    setExtRef(data.external_reference);

    setSuccessMessage('Payment request sent! Check your phone for prompt...');
    setStatus('processing');

    // ✅ START POLLING
    const interval = setInterval(async () => {
      try {
        const statusRes = await AxiosInstance.get(
          `/api/payments/check_payment_status/${data.payment_reference}/`
        );

        const statusData = statusRes.data;

        // ✅ SUCCESS
        if (statusData.status === 'PAID') {
          clearInterval(interval);
          setPollInterval(null);

          setTransactionId(
            statusData.transactionId ||
            statusData.receiptNumber ||
            'N/A'
          );

          setSuccessMessage('Payment confirmed successfully!');
          setStatus('success');

          // success callback
          // onPaymentSuccess?.(extRef || data.external_reference);  

          return;
        }

        // ✅ FAILED / CANCELLED
        if (statusData.status === 'FAILED') {
          clearInterval(interval);
          setPollInterval(null);

          setErrorMessage('Payment failed or cancelled');
          setStatus('error');

          return;
        }

        // ✅ else → still PENDING → keep polling

      } catch (err) {
        console.error('Polling error:', err);

        clearInterval(interval);
        setPollInterval(null);

        setErrorMessage('Error checking payment status');
        setStatus('error');
      }
    }, 8000);

    // ✅ Save interval so it can be cleared on unmount
    setPollInterval(interval);

  } catch (err: any) {
    console.error('Payment initiation error:', err);

    setErrorMessage(
      err?.response?.data?.error ||
      err.message ||
      'Payment initiation failed'
    );

    setStatus('error');
  }
};

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 12) return value.substring(0, value.length - 1);
    return value;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        },
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #3e397b 0%, #3e397b 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderRadius: '12px 12px 0 0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Lock size={24} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Secure Payment
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          sx={{
            minWidth: 'auto',
            p: 0.5,
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <X size={20} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Success State */}
        {status === 'success' && (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#dcfce7',
                    borderRadius: '50%',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'scaleIn 0.5s ease-out',
                  }}
                >
                  <CheckCircle size={48} color="#3e397b " />
                </Box>
              </Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#1f2937',
                  mb: 1,
                }}
              >
                Payment Successful!
              </Typography>

              <Typography
                sx={{
                  color: '#6b7280',
                  mb: 3,
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                {successMessage}
              </Typography>

              {transactionId && (
                <Card
                  sx={{
                    backgroundColor: '#f0fdf4',
                    border: '2px solid #3e397b ',
                    p: 2,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#6b7280',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Transaction ID
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#3e397b ',
                      wordBreak: 'break-all',
                    }}
                  >
                    {transactionId}
                  </Typography>
                </Card>
              )}

              {/* Payment Summary */}
              <Card sx={{ p: 2, backgroundColor: '#fafaf9', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#6b7280' }}>Amount Paid:</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#1f2937' }}>
                    {amountPaid?.toLocaleString()} {currency}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#6b7280' }}>Phone Number:</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                    {phoneNumber}
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Fade>
        )}

        {/* Error State */}
        {status === 'error' && (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#fee2e2',
                    borderRadius: '50%',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertCircle size={48} color="#dc2626" />
                </Box>
              </Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#1f2937',
                  mb: 1,
                }}
              >
                Payment Failed
              </Typography>

              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  backgroundColor: '#fecaca',
                  color: '#7f1d1d',
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: '#dc2626',
                  },
                }}
              >
                {errorMessage}
              </Alert>

              <Typography
                sx={{
                  color: '#6b7280',
                  fontSize: '0.9rem',
                }}
              >
                Please verify your phone number and try again, or contact support.
              </Typography>
            </Box>
          </Fade>
        )}

        {/* Form State */}
        {status === 'idle' && (
          <Fade in timeout={300}>
            <Box>
              {/* Payment Details Summary */}
              <Card
                sx={{
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #3e397b',
                  p: 2.5,
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#6b7280',
                    fontWeight: 600,
                    mb: 1.5,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  Payment Summary
                </Typography>

                {/* Amount */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DollarSign size={18} color="#3e397b" />
                    <Typography sx={{ color: '#6b7280', fontWeight: 600 }}>
                      Amount
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: '#3e397b',
                      fontSize: '1.1rem',
                    }}
                  >
                    {amountPaid?.toLocaleString()} {currency}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Reason */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={18} color="#3e397b" />
                    <Typography sx={{ color: '#6b7280', fontWeight: 600 }}>
                      Reason
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                    {reason}
                  </Typography>
                </Box>
              </Card>

              {/* Phone Number Input */}
              <Typography
                sx={{
                  color: '#1f2937',
                  fontWeight: 700,
                  mb: 1.5,
                  fontSize: '0.95rem',
                }}
              >
                Enter Phone Number
              </Typography>

              <TextField
                fullWidth
                placeholder="e.g., +256 702 123 456 or 0702123456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                // disabled={status === 'processing'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={20} color="#3e397b" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#3e397b',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3e397b',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    fontWeight: 600,
                  },
                }}
              />

              <Typography
                sx={{
                  color: '#9ca3af',
                  fontSize: '0.8rem',
                  mb: 3,
                }}
              >
                We'll send you a prompt on this number to complete the payment.
              </Typography>

              {/* Security Notice */}
              <Box
                sx={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 2,
                  p: 2,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                }}
              >
                 <Lock size={18} color="#6b7280" />
                <Typography
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                  }}
                >
                  Your payment is processed securely. We never store your payment details.
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress
                sx={{
                  color: '#3e397b',
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1f2937',
                  mb: 1,
                }}
              >
                Processing Payment...
              </Typography>
              <Typography
                sx={{
                  color: '#6b7280',
                  fontSize: '0.9rem',
                }}
              >
                Please wait while we process your payment
              </Typography>
            </Box>
          </Fade>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          borderTop: '1px solid #e5e7eb',
        }}
      >
        {status === 'idle' && (
          <>
          <CustomButton onClick={handleClose} text='Cancel' variant='outlined'/>
          <CustomButton endIcon={<ArrowRight size={18} />} onClick={handlePayment} text='Complete Payment' />
          </>
        )}

        {/* {status === 'success' && (
            <CustomButton 
             onClick={() => {
               onPaymentSuccess?.(extRef || "");   
              handleClose();
             }}  
            text='Done'/>
        )} */}

        {status === 'error' && (
          <>
          <CustomButton onClick={handleClose} text='Close' variant='outlined'/>
            <CustomButton onClick={() => {
                setStatus('idle');
                setErrorMessage('');
              }} text='Try Again'/>
           
          </>
        )}
      </DialogActions>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </Dialog>
  );
};

export default PaymentModal;
