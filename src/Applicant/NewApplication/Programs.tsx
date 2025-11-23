// Programs.tsx
import React, { useEffect, useState } from 'react';
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

// Updated props — now includes setFormData
interface ProgramProps {
  formData: {
    campus: string;
    programs: number[];
    study_mode: string;
    academic_level: string;
  };
  formErrors: Record<string, string> 
  handleChange: (event: SelectChangeEvent<string>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>; // From parent
}

const Programs: React.FC<ProgramProps> = ({
  formData,
  handleChange,
  setFormData,
  formErrors
}) => {
  const AxiosInstance = useAxios();
  const { batch } = useHook();

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);

  // Fetch campuses
  const fetchCampuses = async () => {
    try {
      const response = await AxiosInstance.get('/api/accounts/list_campus');
      setCampuses(response.data);
    } catch (err) {
      console.error('Error fetching campuses:', err);
    }
  };

  // Fetch academic levels
  const fetchAcademicLevels = async () => {
    try {
      const response = await AxiosInstance.get('/api/admissions/list_academic_level');
      setAcademicLevels(response.data);
    } catch (err) {
      console.error('Error fetching academic levels:', err);
    }
  };

  useEffect(() => {
    fetchCampuses();
    fetchAcademicLevels();
  }, []);

  // Filtered programs based on selected campus & academic level
  const filteredPrograms = React.useMemo(() => {
    if (!batch?.programs || !Array.isArray(batch.programs)) return [];

    return batch.programs.filter((program: Program) => {
      const matchesAcademicLevel =
        !formData.academic_level ||
        program.academic_level === Number(formData.academic_level);

      const matchesCampus =
        !formData.campus ||
        program.campuses.some((c: any) => String(c.id) === String(formData.campus));

      return matchesAcademicLevel && matchesCampus;
    });
  }, [batch?.programs, formData.academic_level, formData.campus]);

  // Get currently selected program objects for display
  const selectedPrograms = React.useMemo(() => {
    return filteredPrograms.filter((p: Program) =>
      formData.programs.includes(p.id)
    );
  }, [filteredPrograms, formData.programs]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Alert severity="info" icon={<InfoIcon />}>
        <strong>Note:</strong> You will be assigned to an admission batch by the administration office after your
        application is reviewed.
      </Alert>

      {/* Preferred Campus */}
      <Box>
        <FormControl fullWidth required error={!!formErrors.campus}>
          <InputLabel>Preferred Campus</InputLabel>
          <Select
            name="campus"
            value={formData.campus}
            onChange={handleChange}
            label="Preferred Campus"
          >
            {campuses.map((campus) => (
              <MenuItem key={campus.id} value={campus.id}>
                {campus.name}
              </MenuItem>
            ))}
          </Select>
           {formErrors.campus && (
              <FormHelperText>{formErrors.campus}</FormHelperText>
            )}
        </FormControl>
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#666" }}>
          Select your preferred campus location
        </Typography>
      </Box>

      {/* Academic Level */}
      <Box>
        <FormControl fullWidth required error={!!formErrors.academic_level}>
          <InputLabel>Preferred Academic Level</InputLabel>
          <Select
            name="academic_level"
            value={formData.academic_level}
            onChange={handleChange}
            label="Preferred Academic Level"
          >
            {academicLevels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {level.name}
              </MenuItem>
            ))}
          </Select>
            {formErrors.academic_level && (
              <FormHelperText>{formErrors.academic_level}</FormHelperText>
            )}
        </FormControl>
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#666" }}>
          Select your preferred academic level
        </Typography>
      </Box>

      {/* Study Mode */}
      <Box>
        <FormControl fullWidth required error={!!formErrors.study_mode}>
          <InputLabel>Study Mode</InputLabel>
          <Select
            name="study_mode"
            value={formData.study_mode}
            onChange={handleChange}
            label="Study Mode"
          >
            <MenuItem value="W">Weekend</MenuItem>
            <MenuItem value="D">Day</MenuItem>
            <MenuItem value="DL">Distance Learning</MenuItem>
          </Select>
            {formErrors.study_mode && (
              <FormHelperText>{formErrors.study_mode}</FormHelperText>
            )}
        </FormControl>
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#666" }}>
          Select your preferred study mode
        </Typography>
      </Box>

      {/* Programs Autocomplete */}
      {formData.campus && formData.academic_level && (
        <Box>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: "#5ba3f5" }}>
          Preferred Programs (Select 1–3)
        </Typography>
        <FormControl fullWidth required error={!!formErrors.programs}>
        <Autocomplete
          multiple
          options={filteredPrograms}
          getOptionLabel={(option: Program) => option.name}
          getOptionKey={(option: Program) => option.id}
          value={selectedPrograms}
          onChange={(_, newValue: Program[]) => {
            // Enforce max 3 programs
            if (newValue.length <= 3) {
              setFormData((prev: any) => ({
                ...prev,
                programs: newValue.map(p => p.id),
              }));
            }
          }}
          isOptionEqualToValue={(option: Program, value: Program) => option.id === value.id}
          loading={!batch?.programs}
          noOptionsText={
            !formData.campus || !formData.academic_level
              ? "Please select campus and academic level first"
              : "No programs available for selected filters"
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Preferred Programs"
              placeholder={
                formData.programs.length === 0
                  ? "Search and select up to 3 programs..."
                  : ""
              }
              required={formData.programs.length === 0}
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
        {formErrors.programs && <FormHelperText>{formErrors.programs}</FormHelperText>}
        </FormControl>
        <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#666" }}>
          You must select at least one and at most three programs.
        </Typography>
      </Box>
      )}
    </Box>
  );
};

export default Programs;