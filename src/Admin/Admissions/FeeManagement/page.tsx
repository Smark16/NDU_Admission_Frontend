import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Typography,
    Autocomplete,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import type { SelectChangeEvent } from "@mui/material/Select";
import useAxios from '../../../AxiosInstance/UseAxios';
import useHook from '../../../Hooks/useHook';
import CustomButton from '../../../ReUsables/custombutton';

interface AcademicLevel {
    id: number;
    name: string;
}

interface Batch {
    id: number;
    name: string;
    academic_year: string;
}

interface Fee {
    id: string;
    fee_type: string;
    nationality_type: string;
    academic_level: AcademicLevel[];
    admission_period: Batch | number; // From API: sometimes object, sometimes ID
    amount: number;
    currency: string;
    is_active: boolean;
}

export default function FeeManagement() {
    const AxiosInstance = useAxios();
    const { batch } = useHook(); // Assuming this returns the current active batch

    const [fees, setFees] = useState<Fee[]>([]);
    const [academicLevel, setAcademicLevel] = useState<AcademicLevel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{
        message: string
        type: "success" | "error" | "info"
    } | null>(null)

    // Always store admission_period as number (ID) in form
    const [formData, setFormData] = useState<Omit<Fee, 'id' | 'admission_period'> & { admission_period: number }>({
        fee_type: '',
        nationality_type: '',
        academic_level: [],
        admission_period: batch?.id || 0, // Default to current batch if available
        amount: 0,
        currency: 'UGX',
        is_active: true,
    });

    // Fetch fee plans
    const fetchFeePlans = async () => {
        try {
            setIsLoading(true);
            const { data } = await AxiosInstance.get('/api/payments/list_fee_plan');
            setFees(data);
        } catch (err) {
            console.error('Error fetching fees:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // === NOTIFICATION HELPER ===
    const showNotification = (message: string, type: "success" | "error" | "info") => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 4000)
    }


    // Fetch academic levels
    const fetchAcademicLevels = async () => {
        try {
            const response = await AxiosInstance.get('/api/admissions/list_academic_level');
            setAcademicLevel(response.data);
        } catch (err) {
            console.error('Error fetching academic levels:', err);
        }
    };

    useEffect(() => {
        fetchFeePlans();
        fetchAcademicLevels();
    }, []);

    const handleOpenDialog = () => {
        setFormData({
            fee_type: '',
            nationality_type: '',
            academic_level: [],
            admission_period: batch?.id || 0,
            amount: 0,
            currency: 'UGX',
            is_active: true,
        });
        setEditingId(null);
        setOpenDialog(true);
    };

    const handleEditFee = (fee: Fee) => {
        const periodId = typeof fee.admission_period === 'object' && fee.admission_period
            ? fee.admission_period.id
            : (fee.admission_period as number) || 0;

        setFormData({
            fee_type: fee.fee_type,
            nationality_type: fee.nationality_type,
            academic_level: fee.academic_level || [],
            admission_period: periodId,
            amount: fee.amount,
            currency: fee.currency,
            is_active: fee.is_active,
        });
        setEditingId(fee.id);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
    };

    const handleSaveFee = async () => {
        if (!formData.fee_type || formData.academic_level.length === 0 || formData.admission_period === 0) {
            showNotification("Please fill all required fields", "error");
            return;
        }

        try {
            setIsLoading(true);

            const payload = {
                fee_type: formData.fee_type,
                nationality_type: formData.nationality_type,
                academic_level: formData.academic_level.map(level => level.id),
                admission_period: formData.admission_period,
                amount: formData.amount,
                currency: formData.currency,
                is_active: formData.is_active,
            };

            if (editingId) {
                const { data } = await AxiosInstance.put(`/api/payments/update_fee_plan/${editingId}`, payload);
                setIsLoading(false)
                setFees(prev => prev.map(f => (f.id === editingId ? data : f)));
                showNotification("Fees Updated successfully", "success");
            } else {
                const { data } = await AxiosInstance.post('/api/payments/create_fee_plan', payload);
                setIsLoading(false)
                setFees(prev => [...prev, data]);
                showNotification("Fees created successfully", "success");
            }

            handleCloseDialog();
        } catch (err: any) {
            if (err.response?.data?.detail) {
                showNotification(`${err.response?.data?.detail} || an error occured`, "error");
            }
            setIsLoading(false)
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            setIsLoading(true)
            await AxiosInstance.delete(`/api/payments/delete_fee_plan/${deleteId}`);
            setIsLoading(false)
            setFees(prev => prev.filter(fee => fee.id !== deleteId));
            showNotification("Fee plan deleted Successfully", 'success')
        } catch (err: any) {
            if (err.response?.data.detail) {
                showNotification(`${err.response?.data.detail}`, 'error')
            }
            showNotification("Failed to delete fee plan", 'error')
            setIsLoading(false)
        } finally {
            setDeleteDialogOpen(false);
            setDeleteId(null);
            setIsLoading(false)
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent<any>) => {
        const { name, value } = e.target;
        if (name) {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'is_active' ? value === 'true' : value,
            }));
        }
    };

    const handleAcademicLevelChange = (_: any, newValue: AcademicLevel[]) => {
        setFormData(prev => ({ ...prev, academic_level: newValue }));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Card sx={{ mb: 4, boxShadow: 3 }}>
                <CardHeader
                    title="Fee Management"
                    subheader="Manage university fees across different categories"
                    action={
                        <CustomButton icon={<AddIcon />} onClick={handleOpenDialog} text="Add Fee" />
                    }
                />
                {notification && (
                    <Alert
                        severity={notification.type}
                        onClose={() => setNotification(null)}
                        sx={{ mb: 3 }}
                    >
                        {notification.message}
                    </Alert>
                )}
                <CardContent>
                    {isLoading && fees.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell><strong>Fee Type</strong></TableCell>
                                        <TableCell><strong>Nationality</strong></TableCell>
                                        <TableCell><strong>Academic Level</strong></TableCell>
                                        <TableCell><strong>Period</strong></TableCell>
                                        <TableCell align="right"><strong>Amount</strong></TableCell>
                                        <TableCell align="center"><strong>Status</strong></TableCell>
                                        <TableCell align="center"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <Typography color="text.secondary">No fee plans found</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        fees.map((fee) => {
                                            const isCurrentBatch = batch && typeof fee.admission_period === 'object'
                                                ? fee.admission_period.id === batch.id
                                                : false;

                                            const periodDisplay = typeof fee.admission_period === 'object' && fee.admission_period
                                                ? `${fee.admission_period.name} (${fee.admission_period.academic_year})`
                                                : isCurrentBatch && batch
                                                    ? `${batch.name} (${batch.academic_year})`
                                                    : 'Not set';

                                            return (
                                                <TableRow key={fee.id} hover>
                                                    <TableCell>{fee.fee_type}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={fee.nationality_type || 'N/A'}
                                                            size="small"
                                                            color={fee.nationality_type === 'Uganda' ? 'success' : 'info'}
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                                                            {fee.academic_level?.map((level) => (
                                                                <Chip key={level.id} label={level.name} size="small" sx={{ backgroundColor: "#3e397b", color: "white" }} />
                                                            ))}
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>{periodDisplay}</TableCell>
                                                    <TableCell align="right">
                                                        <strong>{fee.currency} {fee.amount.toLocaleString()}</strong>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={fee.is_active ? 'Active' : 'Inactive'}
                                                            color={fee.is_active ? 'success' : 'default'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton size="small" onClick={() => handleEditFee(fee)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(fee.id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingId ? 'Edit Fee Plan' : 'Add New Fee Plan'}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Fee Type"
                                name="fee_type"
                                value={formData.fee_type}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Nationality</InputLabel>
                                <Select
                                    name="nationality_type"
                                    value={formData.nationality_type}
                                    onChange={handleSelectChange}
                                    label="Nationality"
                                >
                                    <MenuItem value="Uganda">Local (Uganda)</MenuItem>
                                    <MenuItem value="International">International</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Currency</InputLabel>
                                <Select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleSelectChange}
                                    label="Currency"
                                >
                                    <MenuItem value="UGX">UGX</MenuItem>
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                multiple
                                options={academicLevel}
                                getOptionLabel={(option) => option.name}
                                value={formData.academic_level}
                                onChange={handleAcademicLevelChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Academic Levels" placeholder="Select levels" />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option.name}
                                            size="small"
                                            {...getTagProps({ index })}
                                            key={option.id}
                                        />
                                    ))
                                }
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Admission Period</InputLabel>
                                <Select
                                    name="admission_period"
                                    value={formData.admission_period}
                                    onChange={handleSelectChange}
                                    label="Admission Period"
                                    disabled={!batch}
                                >
                                    {batch ? (
                                        <MenuItem value={batch.id}>
                                            {batch.name} ({batch.academic_year})
                                        </MenuItem>
                                    ) : (
                                        <MenuItem disabled>No active batch</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Amount"
                                name="amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleInputChange}
                                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="is_active"
                                    value={formData.is_active ? 'true' : 'false'}
                                    onChange={handleSelectChange}
                                    label="Status"
                                >
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <CustomButton onClick={handleCloseDialog} text="Cancel" variant='outlined' sx={{ borderColor: "#7c1519", color: "#7c1519" }} />
                    <CustomButton onClick={handleSaveFee} disabled={isLoading} text={isLoading ? <CircularProgress size={24} /> : editingId ? 'Update' : 'Create'} />
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this fee plan? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error">
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}