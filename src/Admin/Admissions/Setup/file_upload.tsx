// FileUpload.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Autocomplete,
} from "@mui/material";
import useAxios from '../../../AxiosInstance/UseAxios';
import {
  Book as BookIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";

interface Program {
  id: number;
  name: string;
}

const HALLS = ["AKIIBUA", "NJUKI", "MUTEESA", "KAKUNGULU", "YOKANA", "RANDOM"]

interface FileUploadProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  templateForm: {
    file: File | null;
    status: "active" | "inactive";
    programs: number[];
    start_date: string;
    hall_of_residence: string;
  };
  setTemplateForm: React.Dispatch<React.SetStateAction<{
    file: File | null;
    status: "active" | "inactive";
    programs: number[];
    start_date: string;
    hall_of_residence: string;
  }>>;
}

function FileUpload({ handleFileChange, templateForm, setTemplateForm }: FileUploadProps) {
  const AxiosInstance = useAxios();
  const [programs, setPrograms] = useState<Program[]>([]);

  // === TYPE-SAFE FIELD UPDATER ===
  type TemplateFormKeys = "file" | "status" | "programs" | "start_date" | "hall_of_residence";
  const handleFormChange = (field: TemplateFormKeys, value: any) => {
    setTemplateForm((prev) => ({ ...prev, [field]: value }));
  };

  console.log('template file', templateForm)
  // === FETCH PROGRAMS ===
  const fetchPrograms = async () => {
    try {
      const response = await AxiosInstance.get("/api/program/list_programs");
      setPrograms(response.data);
    } catch (error) {
      console.log("Failed to fetch programs:", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <>
      {/* File Upload */}
      <Paper sx={{ p: 3, bgcolor: "#f8fbff", border: "1px solid #e0eef7" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <BookIcon sx={{ color: "#5ba3f5", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a3a52" }}>
            Admission Templates
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
          Upload your Admission Template as a word document
        </Typography>
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            border: "2px dashed #5ba3f5",
            borderRadius: 2,
            cursor: "pointer",
            transition: "all 0.3s",
            "&:hover": { bgcolor: "#f0f7ff", borderColor: "#3b82f6" },
          }}
        >
          <input
            type="file"
            name="Admission Templates"
            onChange={handleFileChange}
            accept=".doc, .docx"
            style={{ display: "none" }}
            id="template-upload"
          />
          <label htmlFor="template-upload" style={{ cursor: "pointer", display: "block" }}>
            <CloudUploadIcon sx={{ fontSize: 40, color: "#5ba3f5", mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Click to upload or drag and drop
            </Typography>
            <Typography variant="caption" sx={{ color: "#666" }}>
              Word Documents (Max 10MB)
            </Typography>
            {templateForm.file && (
              <Chip
                label={templateForm.file.name}
                onDelete={() => setTemplateForm((prev) => ({ ...prev, file: null }))}
                sx={{ mt: 2 }}
                color="primary"
              />
            )}
          </label>
        </Paper>
      </Paper>

      {/* === SEARCHABLE PROGRAM SELECT === */}
       <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
          Map Programs to the template
        </Typography>
      <Autocomplete
        multiple
        options={programs}
        getOptionLabel={(option) => option.name}
        value={programs.filter((p) => templateForm.programs.includes(p.id))}
        onChange={(_, newValue) => {
          handleFormChange("programs", newValue.map((v) => v.id));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Programs"
            placeholder="Search and select programs..."
            required={templateForm.programs?.length === 0}
          />
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
        loading={programs?.length === 0}
        noOptionsText="No programs found"
        sx={{ mt: 2 }}
      />

      {/* Start Date */}
      <TextField
        fullWidth
        label="Programme Start Date"
        type="date"
        value={templateForm.start_date}
        onChange={(e) => handleFormChange("start_date", e.target.value)}
        InputLabelProps={{ shrink: true }}
        helperText="This date will appear on all offer letters generated from this template"
        sx={{ mt: 2 }}
      />

      {/* Hall of Residence */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Hall of Residence</InputLabel>
        <Select
          value={templateForm.hall_of_residence}
          label="Hall of Residence"
          onChange={(e) => handleFormChange("hall_of_residence", e.target.value)}
        >
          <MenuItem value="AKIIBUA">AKIIBUA</MenuItem>
          <MenuItem value="NJUKI">NJUKI</MenuItem>
          <MenuItem value="MUTEESA">MUTEESA</MenuItem>
          <MenuItem value="KAKUNGULU">KAKUNGULU</MenuItem>
          <MenuItem value="YOKANA">YOKANA</MenuItem>
          <MenuItem value="RANDOM">Assign Randomly</MenuItem>
        </Select>
      </FormControl>

      {/* Status */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={templateForm.status}
          label="Status"
          onChange={(e) =>
            handleFormChange("status", e.target.value as "active" | "inactive")
          }
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export default FileUpload;