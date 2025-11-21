// src/components/charts.tsx
import {
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export interface FacultyAdmitted {
  faculty: string;
  admitted: number;
}

export interface FeeCollection {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;  
}

interface ChartsProps {
  facultyAdmittedData: FacultyAdmitted[];
  feeCollectionData: FeeCollection[];
  totalAdmitted: number;
}

export default function Charts({
  facultyAdmittedData,
  feeCollectionData,
  totalAdmitted,
}: ChartsProps) {
  return (
    <>
      {/* Bar & Pie */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Admitted Students by Faculty
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={facultyAdmittedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faculty" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="admitted" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Fees: Local vs International
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feeCollectionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {feeCollectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Admitted Students by Faculty
              </Typography>
              <TableContainer component={Paper} sx={{ border: "1px solid #e0e0e0" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#f5f7fa" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Faculty</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Admitted</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Percentage</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {facultyAdmittedData?.map((row) => (
                      <TableRow key={row.faculty} sx={{ "&:hover": { bgcolor: "#f5f7fa" } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{row.faculty}</TableCell>
                        <TableCell align="center">{row.admitted}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${((row.admitted / totalAdmitted) * 100).toFixed(1)}%`}
                            sx={{ bgcolor: "#e0e7ff", color: "#667eea" }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label="Active" color="success" variant="outlined" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}