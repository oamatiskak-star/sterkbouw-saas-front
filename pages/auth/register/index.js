import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../../store/slices/authSlice';
import {
Container,
Paper,
Typography,
TextField,
Button,
Box,
Alert,
CircularProgress,
MenuItem,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

export default function Register() {
const router = useRouter();
const dispatch = useDispatch();
const { loading, error } = useSelector((state) => state.auth);
const [userData, setUserData] = useState({
name: '',
email: '',
password: '',
confirmPassword: '',
role: 'field',
company: '',
});

const handleSubmit = async (e) => {
e.preventDefault();
if (userData.password !== userData.confirmPassword) {
alert('Passwords do not match');
return;
}
const result = await dispatch(register(userData));
if (result.meta.requestStatus === 'fulfilled') {
router.push('/auth/login');
}
};

return (
<Container maxWidth="sm">
<Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
<Paper elevation={3} sx={{ p: 4, width: '100%' }}>
<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
<PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
<Typography variant="h5" component="h1">
Create Account
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
label="Full Name"
value={userData.name}
onChange={(e) => setUserData({ ...userData, name: e.target.value })}
/>
<TextField
margin="normal"
required
fullWidth
label="Email Address"
type="email"
value={userData.email}
onChange={(e) => setUserData({ ...userData, email: e.target.value })}
/>
<TextField
margin="normal"
required
fullWidth
label="Password"
type="password"
value={userData.password}
onChange={(e) => setUserData({ ...userData, password: e.target.value })}
/>
<TextField
margin="normal"
required
fullWidth
label="Confirm Password"
type="password"
value={userData.confirmPassword}
onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
/>
<TextField
margin="normal"
required
fullWidth
label="Role"
select
value={userData.role}
onChange={(e) => setUserData({ ...userData, role: e.target.value })}
>
<MenuItem value="field">Field Worker</MenuItem>
<MenuItem value="admin">Administrator</MenuItem>
</TextField>
<TextField
margin="normal"
required
fullWidth
label="Company"
value={userData.company}
onChange={(e) => setUserData({ ...userData, company: e.target.value })}
/>
<Button
type="submit"
fullWidth
variant="contained"
sx={{ mt: 3, mb: 2 }}
disabled={loading}
>
{loading ? <CircularProgress size={24} /> : 'Sign Up'}
</Button>
<Box sx={{ textAlign: 'center' }}>
<Button onClick={() => router.push('/auth/login')}>
Already have an account? Sign In
</Button>
</Box>
</form>
</Paper>
</Box>
</Container>
);
}
