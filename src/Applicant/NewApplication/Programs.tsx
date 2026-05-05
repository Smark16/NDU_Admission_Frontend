import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  FormHelperText,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import type { SelectChangeEvent } from '@mui/material/Select';

import useAxios from '../../AxiosInstance/UseAxios';
import useHook from '../../Hooks/useHook';

interface Campus {
  id: number;
  name: string;
}

interface AcademicLevel {
  id: number;
  name: string;
}

interface Program {
  id: number;
  name: string;
  academic_level: number;
  campuses: { id: number }[];
}

interface ProgramProps {
  formData: {
    campus: string;
    programs: number[];
    academic_level: string;
  };
  formErrors: Record<string, string>;
  handleChange: (event: SelectChangeEvent<string>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Programs: React.FC<ProgramProps> = ({
  formData,
  formErrors,
  handleChange,
  setFormData,
}) => {
  const AxiosInstance = useAxios();
  const { batch } = useHook();

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [campusRes, levelRes] = await Promise.all([
        AxiosInstance.get('/api/accounts/list_campus'),
        AxiosInstance.get('/api/admissions/list_academic_level'),
      ]);

      setCampuses(campusRes.data);
      setAcademicLevels(levelRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered programs based on selected campus & academic level
  const filteredPrograms = useMemo(() => {
    if (!batch?.programs || !Array.isArray(batch.programs)) return [];

    return batch.programs.filter((program: Program) => {
      const matchesAcademicLevel = 
        !formData.academic_level || 
        String(program.academic_level) === String(formData.academic_level);

      const matchesCampus = 
        !formData.campus || 
        program.campuses.some((c: any) => String(c.id) === String(formData.campus));

      return matchesAcademicLevel && matchesCampus;
    });
  }, [batch?.programs, formData.academic_level, formData.campus]);

  // Get selected program objects for Autocomplete
  const selectedPrograms = useMemo(() => {
    return filteredPrograms.filter((p: Program) =>
      formData.programs.includes(p.id)
    );
  }, [filteredPrograms, formData.programs]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Alert severity="info" icon={<InfoIcon />}>
        <strong>Note:</strong> You will be assigned to an admission batch by the administration office after your application is reviewed.
      </Alert>

      {/* Preferred Campus */}
      <FormControl fullWidth required error={!!formErrors.campus}>
        <InputLabel>Preferred Campus</InputLabel>
        <Select
          name="campus"
          value={formData.campus || ""}
          onChange={handleChange}
          label="Preferred Campus"
          disabled={loading}
        >
          {loading ? (
            <MenuItem disabled>Loading campuses...</MenuItem>
          ) : (
            campuses.map((campus) => (
              <MenuItem key={campus.id} value={campus.id}>
                {campus.name}
              </MenuItem>
            ))
          )}
        </Select>
        {formErrors.campus && <FormHelperText>{formErrors.campus}</FormHelperText>}
      </FormControl>

      {/* Academic Level */}
      <FormControl fullWidth required error={!!formErrors.academic_level}>
        <InputLabel>Preferred Academic Level</InputLabel>
        <Select
          name="academic_level"
          value={formData.academic_level || ""}
          onChange={handleChange}
          label="Preferred Academic Level"
          disabled={loading}
        >
          {loading ? (
            <MenuItem disabled>Loading academic levels...</MenuItem>
          ) : (
            academicLevels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {level.name}
              </MenuItem>
            ))
          )}
        </Select>
        {formErrors.academic_level && (
          <FormHelperText>{formErrors.academic_level}</FormHelperText>
        )}
      </FormControl>

      {/* Programs Autocomplete - Only show when both campus and academic level are selected */}
      {formData.campus && formData.academic_level && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
            Preferred Programs (Select 1–3)
          </Typography>

          <Autocomplete
            multiple
            options={filteredPrograms}
            getOptionLabel={(option: Program) => option.name}
            value={selectedPrograms}
            onChange={(_, newValue: Program[]) => {
              if (newValue.length <= 3) {
                setFormData((prev: any) => ({
                  ...prev,
                  // programs: newValue.map((p) => p.id),
                  programs: newValue.map((p) => p.id).filter(id => Number(id) > 0),
                }));
              }
            }}
            isOptionEqualToValue={(option: Program, value: Program) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Preferred Programs"
                placeholder="Search and select programs..."
                error={formData.programs.length > 3}
                helperText={
                  formData.programs.length > 3 
                    ? "Maximum 3 programs allowed" 
                    : `${formData.programs.length} of 3 selected`
                }
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option: Program, index) => (
                <Chip
                  label={option.name}
                  size="small"
                  color="primary"
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
          />
          {formErrors.programs && <FormHelperText error>{formErrors.programs}</FormHelperText>}
        </Box>
      )}
    </Box>
  );
};

export default Programs;