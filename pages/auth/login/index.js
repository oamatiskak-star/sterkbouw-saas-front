import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../../store/slices/authSlice';
import {
Container,
Paper,
Typography,
TextField,
Button,
Box,
Alert,
CircularProgress,
} from '@mui/material';
import { Lock } from '@mui/icons-material';

export default function Login() {
const router = useRouter();
const dispatch = useDispatch();
const { loading, error } = useSelector((state) => state.auth);
const [credentials, setCredentials] = useState({
email: '',
password: '',
});

const handleSubmit = async (e) => {
e.preventDefault();
const result = await dispatch(login(credentials));
if (result.meta.requestStatus === 'fulfilled') {
const user = result.payload;
if (user.role === 'admin') {
router.push('/admin/dashboard');
} else {
router.push('/bouwplaatsApp');
}
}
};

return (
<Container maxWidth="sm">
<Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
<Paper elevation={3} sx={{ p: 4, width: '100%' }}>
<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
<Lock sx={{ mr: 1, color: 'primary.main' }} />
<Typography variant="h5" component="h1">
Sign In
</Typography>
</Box>
{error && (
<Alert severity="error" sx={{ mb: 2 }}>
{error}
</Alert>
)}
<form onSubmit={handleSubmit}>
<TextField
margin="normal"
required
fullWidth
label="Email Address"
type="email"
autoComplete="email"
value={credentials.email}
onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
/>
<TextField
margin="normal"
required
fullWidth
label="Password"
type="password"
autoComplete="current-password"
value={credentials.password}
onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
/>
<Button
type="submit"
fullWidth
variant="contained"
sx={{ mt: 3, mb: 2 }}
disabled={loading}
>
{loading ? <CircularProgress size={24} /> : 'Sign In'}
</Button>
<Box sx={{ textAlign: 'center' }}>
<Button onClick={() => router.push('/auth/register')}>
Don't have an account? Sign Up
</Button>
</Box>
</form>
</Paper>
</Box>
</Container>
);
}

