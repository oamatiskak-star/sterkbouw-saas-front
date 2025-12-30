import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInspections, createInspection } from '../../../store/slices/inspectionsSlice';
import {
Container,
Typography,
Button,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
Paper,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
TextField,
Box,
IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

export default function Inspections() {
const router = useRouter();
const dispatch = useDispatch();
const user = useSelector((state) => state.auth.user);
const inspections = useSelector((state) => state.inspections.items);
const [openDialog, setOpenDialog] = useState(false);
const [newInspection, setNewInspection] = useState({
title: '',
description: '',
location: '',
date: new Date().toISOString().split('T')[0],
});

useEffect(() => {
if (!user || user.role !== 'field') {
router.push('/auth/login');
} else {
dispatch(fetchInspections());
}
}, [user, router, dispatch]);

const handleCreate = () => {
dispatch(createInspection(newInspection));
setOpenDialog(false);
setNewInspection({
title: '',
description: '',
location: '',
date: new Date().toISOString().split('T')[0],
});
};

return (
<Container maxWidth="lg">
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
<Typography variant="h4" component="h1">
Inspections
</Typography>
<Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
New Inspection
</Button>
</Box>

text
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Location</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {inspections.map((inspection) => (
          <TableRow key={inspection.id}>
            <TableCell>{inspection.title}</TableCell>
            <TableCell>{inspection.description}</TableCell>
            <TableCell>{inspection.location}</TableCell>
            <TableCell>{inspection.date}</TableCell>
            <TableCell>{inspection.status}</TableCell>
            <TableCell>
              <IconButton>
                <Edit />
              </IconButton>
              <IconButton>
                <Delete />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
    <DialogTitle>Create New Inspection</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Title"
        fullWidth
        value={newInspection.title}
        onChange={(e) => setNewInspection({ ...newInspection, title: e.target.value })}
      />
      <TextField
        margin="dense"
        label="Description"
        fullWidth
        multiline
        rows={3}
        value={newInspection.description}
        onChange={(e) => setNewInspection({ ...newInspection, description: e.target.value })}
      />
      <TextField
        margin="dense"
        label="Location"
        fullWidth
        value={newInspection.location}
        onChange={(e) => setNewInspection({ ...newInspection, location: e.target.value })}
      />
      <TextField
        margin="dense"
        label="Date"
        type="date"
        fullWidth
        value={newInspection.date}
        onChange={(e) => setNewInspection({ ...newInspection, date: e.target.value })}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
      <Button onClick={handleCreate} variant="contained">Create</Button>
    </DialogActions>
  </Dialog>
</Container>
);
}
