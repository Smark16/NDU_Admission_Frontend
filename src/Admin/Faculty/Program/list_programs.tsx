// components/program/ListPrograms.tsx
import React from "react"
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Switch,
} from "@mui/material"
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"

interface Campus {
  id: number
  name: string
}

interface Program {
  id: number
  name: string
  short_form: string
  code: string
  academic_level: string
  campuses: Campus[]
  faculty: string
  min_years: number | undefined
  max_years: number | undefined
  is_active: boolean
}

interface ListProgramsProps {
  programs: Program[]
  onEdit: (program: Program) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
}

const ListPrograms: React.FC<ListProgramsProps> = ({
  programs,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (programs.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="textSecondary">No programs found</Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 2, mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#3e397b"}}>
            <TableCell sx={{ fontWeight: 600, color: "white" }}>Program Name</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "white"  }}>Short Form</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "white"  }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "white"  }}>Faculty</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "white"  }}>Level</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "white"  }}>Campuses</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, color: "white"  }}>Min Years</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600, color: "white"  }}>Max Years</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600, color: "white"  }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, color: "white"  }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {programs.map((program) => (
            <TableRow
              key={program.id}
              hover
              sx={{ "&:hover": { backgroundColor: "action.hover" } }}
            >
              <TableCell>
                <Typography sx={{ fontWeight: 500 }}>{program.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 500 }}>{program.short_form || "—"}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 500 }}>{program.code}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontWeight: 500 }}>{program.faculty || "—"}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={program.academic_level}
                  size="small"
                  color={program.academic_level === "Undergraduate" ? "primary" : "secondary"}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {program.campuses.map((c) => (
                    <Chip
                      key={c.id}
                      label={c.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {program.campuses.length === 0 && "—"}
                </Box>
              </TableCell>
              <TableCell align="right">{program.min_years ?? "—"}</TableCell>
              <TableCell align="center">{program.max_years ?? "—"}</TableCell>
              <TableCell align="center">
                <Switch
                  checked={program.is_active}
                  onChange={() => onToggleStatus(program.id)}
                  sx={{color:"#3e397b"}}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  sx={{color:"#3e397b"}}
                  onClick={() => onEdit(program)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(program.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ListPrograms