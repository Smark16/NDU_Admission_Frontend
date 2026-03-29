import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Typography,
} from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface CurrencyDataItem {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
}

interface PieChartSectionProps {
    currencyData: CurrencyDataItem[];
    intakeFilter: string;
}

function PieChartSection({
    currencyData,
    intakeFilter
}: PieChartSectionProps) {
    const formatCurrency = (amount: number) => {
        if (!amount) return '0';

        if (amount >= 1_000_000) {
            return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
        }

        return amount.toLocaleString();
    };

    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <Card>
                <CardHeader
                    title="Currency Distribution"
                    subheader={`Based on ${intakeFilter || 'All Intakes'}`}
                />
                <CardContent>
                    {currencyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={currencyData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: UGX ${formatCurrency(value)}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {currencyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `UGX ${value.toLocaleString()}`}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 300
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                No completed transactions for this intake
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );
}

export default PieChartSection;