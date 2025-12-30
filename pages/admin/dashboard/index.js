import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import {
Container,
Grid,
Paper,
Typography,
Box,
Card,
CardContent,
} from '@mui/material';
import {
Assessment,
MonetizationOn,
People,
Engineering,
} from '@mui/icons-material';

export default function AdminDashboard() {
const router = useRouter();
const user = useSelector((state) => state.auth.user);

useEffect(() => {
if (!user || user.role !== 'admin') {
router.push('/auth/login');
}
}, [user, router]);

const stats = [
{ title: 'Active Projects', value: '12', icon: <Assessment />, color: '#1976d2' },
{ title: 'Revenue', value: '€245,380', icon: <MonetizationOn />, color: '#2e7d32' },
{ title: 'Total Users', value: '48', icon: <People />, color: '#ed6c02' },
{ title: 'Field Teams', value: '8', icon: <Engineering />, color: '#9c27b0' },
];

return (
<Container maxWidth="lg">
<Typography variant="h4" component="h1" gutterBottom>
Admin Dashboard
</Typography>
<Grid container spacing={3}>
{stats.map((stat) => (
<Grid item xs={12} sm={6} md={3} key={stat.title}>
<Card>
<CardContent>
<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
<Box sx={{ color: stat.color, mr: 2 }}>{stat.icon}</Box>
<Typography variant="h6">{stat.title}</Typography>
</Box>
<Typography variant="h4">{stat.value}</Typography>
</CardContent>
</Card>
</Grid>
))}
<Grid item xs={12}>
<Paper sx={{ p: 3 }}>
<Typography variant="h6" gutterBottom>
Recent Activity
</Typography>
<Typography>
• New inspection submitted by Team A


• BIM model updated for Project Gamma


• Material delivery confirmed for Site 3


• Financial report Q3 generated
</Typography>
</Paper>
</Grid>
</Grid>
</Container>
);
}
