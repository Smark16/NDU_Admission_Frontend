import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Box,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';

interface RejectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title?: string;
  subtitle?: string;
  itemName?: string; 
}

const RejectionForm: React.FC<RejectionFormProps> = ({
  open,
  onClose,
  onSubmit,
  title = 'Reject',
  subtitle = 'Please provide a reason for rejection',
  itemName,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

 const handleSubmit = async () => {
  if (!reason.trim()) {
    setError(true);
    return;
  }

  // Disable submit button while submitting
  setIsSubmitting(true);   

  try {
    await onSubmit(reason.trim());   
    handleClose();                   
  } catch (error) {
    // Do NOT close on error → user can see the error and try again
    console.error(error);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleClose = () => {
    setReason('');
    setError(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ m: 0, p: 3, pb: 2, background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <WarningIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            {itemName && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {itemName}
              </Typography>
            )}
          </Box>
        </Box>

        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 4, pt: 3 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {subtitle}
        </Typography>

        <TextField
          autoFocus
          margin="dense"
          label="Rejection Reason"
          fullWidth
          multiline
          rows={5}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError(false);
          }}
          error={error}
          helperText={error ? 'Please provide a reason for rejection' : ''}
          placeholder="Explain why this is being rejected..."
          variant="outlined"
          sx={{
            mt: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 4, py: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 2, textTransform: 'none', px: 4 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 5,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
          }}
        >
         {isSubmitting ? <CircularProgress sx={{ color: "#7c1519" }} size={24}/> : 'Confirm Rejection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectionForm;