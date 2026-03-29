import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Grid,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface FiltersCardProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: 'single' | 'range';
  setFilterType: (value: 'single' | 'range') => void;
  singleDate: string;
  setSingleDate: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  feeFilter: string;
  setFeeFilter: (value: string) => void;
  handleClearFilters: () => void;
  setPage: (page: number) => void;
}

function FiltersCard({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  singleDate,
  setSingleDate,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  statusFilter,
  setStatusFilter,
  feeFilter,
  setFeeFilter,
  handleClearFilters,
  setPage,
}: FiltersCardProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title="Filters & Search"
        sx={{ borderBottom: '1px solid #e0e0e0' }}
      />
      <CardContent>
        <Grid container spacing={2}>
          {/* Search Field */}
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, code, or payment ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* Date Filter Type */}
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Filter</InputLabel>
              <Select
                value={filterType}
                label="Date Filter"
                onChange={(e) => {
                  setFilterType(e.target.value as 'single' | 'range');
                  setSingleDate('');
                  setFromDate('');
                  setToDate('');
                }}
              >
                <MenuItem value="single">Single Date</MenuItem>
                <MenuItem value="range">Date Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Date Inputs */}
          {filterType === 'single' ? (
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Payment Date"
                value={singleDate}
                onChange={(e) => {
                  setSingleDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From Date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To Date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(0);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {/* Status Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="paid">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Fee Type Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Fee Type</InputLabel>
              <Select
                value={feeFilter}
                label="Fee Type"
                onChange={(e) => {
                  setFeeFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Application Fee">Application Fee</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Action Buttons */}
          <Grid size={{ xs: 12, md: 1 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                onClick={handleClearFilters}
                sx={{ textTransform: 'none' }}
              >
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default FiltersCard;