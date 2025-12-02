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
  Typography,
  Container,
  FormControlLabel,
  Switch,
  Alert,

} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import useAxios from '../../../AxiosInstance/UseAxios';
import CustomButton from '../../../ReUsables/custombutton';

interface AcademicLevel {
  id: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

export default function AcademicLevels() {
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const AxiosInstance = useAxios()

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', is_active: false });
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error" | "info"
  } | null>(null)

  // fetch academic levels
  const fetchAcademicLevels = async () => {
    try {
      setIsLoading(true)
      const response = await AxiosInstance.get('/api/admissions/list_academic_level')
      setLevels(response.data)
      setIsLoading(false)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchAcademicLevels()
  }, [])

  // === NOTIFICATION HELPER ===
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleOpenDialog = () => {
    setFormData({ name: '', is_active: false })
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleEditLevel = (level: AcademicLevel) => {
    setFormData({ name: level.name, is_active: level.is_active });
    setEditingId(level.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ name: '', is_active: false });
  };

  const handleSaveLevel = async () => {
    if (!formData.name.trim()) return;

    try {
      setIsLoading(true)
      const new_level = {
        name: formData.name,
        is_active: formData.is_active
      }
      if (editingId) {
        const response = await AxiosInstance.put(`/api/admissions/update_academic_levels/${editingId}`, new_level)
        setIsLoading(false)
        showNotification("Academi Level Updated successfully", "success");
        setLevels(
          levels.map((level) =>
            level.id === editingId ? { ...level, name: response.data.name, is_active: response.data.is_active } : level
          )
        );
      } else {
        const response = await AxiosInstance.post('/api/admissions/create_levels', new_level)
        setIsLoading(false)
        showNotification("Academic Levels created successfully", "success");
        setLevels([
          ...levels,
          response.data
        ]);
      }
    } catch (err:any) {
       if(err.response?.data.detail){
        showNotification(`${err.response?.data.detail}`, "error");
       }else{
          showNotification('An error has occured', "error");
       }
      setIsLoading(false)
    }

    handleCloseDialog();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async() => {
    try{
       if (deleteId) {
      setIsLoading(true)
      await AxiosInstance.delete(`/api/admissions/delete_level/${deleteId}`)
      setIsLoading(false)
       showNotification('Academic Level deleted successfully', "success");
      setLevels(levels.filter((level) => level.id !== deleteId));
    }
    }catch(err:any){
     if(err.response?.data.detail){
       showNotification(`${err.response?.data.detail}`, "error");
     }else{
        showNotification('An error has occured', "error");
     } 
     setIsLoading(false)
    }
  
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const getStatusColor = (status: Boolean) => {
    return status === true ? 'success' : 'default';
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                backgroundColor: '#e3f2fd',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolIcon sx={{ color: '#3e397b', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Academic Levels
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Manage and organize all academic degree levels
              </Typography>
            </Box>
          </Stack>
        </Box>

        {notification && (
          <Alert
            severity={notification.type}
            onClose={() => setNotification(null)}
            sx={{ mb: 3 }}
          >
            {notification.message}
          </Alert>
        )}

        {/* Main Card */}
        <Card
          sx={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Level Management
              </Typography>
            }
            action={
              <CustomButton icon={<AddIcon />} onClick={handleOpenDialog} text="Add New Level"/>
            }
            sx={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}
          />

          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} variant="elevation" elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: '#1a1a1a',
                        fontSize: '0.95rem',
                      }}
                    >
                      Level Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: '#1a1a1a',
                        fontSize: '0.95rem',
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: '#1a1a1a',
                        fontSize: '0.95rem',
                      }}
                    >
                      Created Date
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        color: '#1a1a1a',
                        fontSize: '0.95rem',
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {levels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography sx={{ color: '#999' }}>
                          No academic levels found. Create your first level!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    levels.map((level) => (
                      <TableRow
                        key={level.id}
                        hover
                        sx={{
                          '&:hover': { backgroundColor: '#f9f9f9' },
                          borderBottom: '1px solid #e0e0e0',
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                          {level.name}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={level.is_active ? 'Active' : 'Inactive'}
                            color={getStatusColor(level.is_active)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#666', fontSize: '0.9rem' }}>
                          {new Date(level.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              onClick={() => handleEditLevel(level)}
                              sx={{
                                color: '#3e397b',
                                '&:hover': { backgroundColor: '#e3f2fd' },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(level.id)}
                              sx={{
                                color: '#d32f2f',
                                '&:hover': { backgroundColor: '#ffebee' },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
          {editingId ? 'Edit Academic Level' : 'Add New Academic Level'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Level Name"
            placeholder="e.g., Post Graduate"
            value={formData.name}
            onChange={handleInputChange}
            variant="outlined"
            size="medium"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveLevel();
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label={formData.is_active ? 'Active' : 'Inactive'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <CustomButton onClick={handleCloseDialog} text="cancel" sx={{ borderColor: "#7c1519", color: "#7c1519" }} variant='outlined'/>
          <CustomButton onClick={handleSaveLevel} text={isLoading ? (editingId ? 'Updating...' : 'Adding...') :(editingId ? 'Update' : 'Add')}/>
          
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            Are you sure you want to delete this academic level? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
