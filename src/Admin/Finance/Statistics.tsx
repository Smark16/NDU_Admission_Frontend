import {
    Card,
    CardContent,
    Grid,
    Typography,
} from '@mui/material';

interface StatisticsProps {
    totalAmount: number;
    completedCount: number;
    localAmount: number;
    internationalAmount: number;
}

function Statistics({
    totalAmount,
    completedCount,
    localAmount,
    internationalAmount,
}: StatisticsProps) {

    const formatCurrency = (value: number): string => {
        if (!value) return '0';

        // Millions
        if (value >= 1_000_000) {
            const millions = value / 1_000_000;

            // Remove .0 (e.g., 1.0M → 1M)
            return `${parseFloat(millions.toFixed(1))}M`;
        }

        // Thousands and below → use commas
        return value.toLocaleString();
    };

    return (
        <Grid size={{ xs: 12, md: 6 }} container spacing={2}>
            {/* Total Collected Card */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Card
                    sx={{
                        background: 'linear-gradient(135deg, #0D0060 0%, #07003A 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                            Total Collected
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            UGX {formatCurrency(totalAmount)}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                            {completedCount} successful transactions
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Completed Payments Card */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Card
                    sx={{
                        background: 'linear-gradient(135deg, #7c1519 0%, #f5576c 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(245, 87, 108, 0.3)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(245, 87, 108, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                            Completed Payments
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {completedCount}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                            Successfully processed
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Local Payments Card */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Card
                    sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                            Local Payments
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            UGX {formatCurrency(localAmount)}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                            successfully processed
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* International Payments Card */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Card
                    sx={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(250, 112, 154, 0.3)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(250, 112, 154, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                            International Payments
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            UGX {formatCurrency(internationalAmount)}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                            successfully processed
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

export default Statistics;