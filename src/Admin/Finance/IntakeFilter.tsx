import {
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

interface IntakeFilterProps {
  intakeFilter: string;
  setIntakeFilter: (value: string) => void;
  setPage: (page: number) => void;
  intakeOptions: string[];
}

function IntakeFilter({
  intakeFilter,
  setIntakeFilter,
  setPage,
  intakeOptions,
}: IntakeFilterProps) {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Select Intake
          </InputLabel>
          <Select
            value={intakeFilter || ''}
            label="Select Intake"
            onChange={(e) => {
              setIntakeFilter(e.target.value as string);
              setPage(0);       
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#667eea' },
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              },
              '& .MuiSvgIcon-root': {
                color: '#667eea',
              },
            }}
          >
            {intakeOptions.map((intake) => (
              <MenuItem key={intake} value={intake}>
                {intake}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );
}

export default IntakeFilter;