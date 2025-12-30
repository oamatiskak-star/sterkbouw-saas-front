import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects, createProject } from '../../../store/slices/projectsSlice';
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
Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

export default function AdminProjects() {
const router = useRouter();
const dispatch = useDispatch();
const user = useSelector((state) => state.auth.user);
const projects = useSelector((state) => state.projects.items);
const [openDialog, setOpenDialog] = useState(false);
const [newProject, setNewProject] = useState({
name: '',
client: '',
startDate: new Date().toISOString().split('T')[0],
endDate: '',
budget: 0,
status: 'planning',
});

useEffect(() => {
if (!user || user.role !== 'admin') {
router.push('/auth/login');
} else {
dispatch(fetchProjects());
}
}, [user, router, dispatch]);

const handleCreate = () => {
dispatch(createProject(newProject));
setOpenDialog(false);
setNewProject({
name: '',
client: '',
startDate: new Date().toISOString().split('T')[0],
endDate: '',
budget: 0,
status: 'planning',
});
};

const getStatusColor = (status) => {
switch (status) {
case 'active': return 'success';
case 'completed': return 'primary';
case 'on-hold': return 'warning';
default: return 'default';
}
};

return (
<Container maxWidth="lg">
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
<Typography variant="h4" component="h1">
Project Management
</Typography>
<Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
New Project
</Button>
</Box>

text
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Client</TableCell>
          <TableCell>Start Date</TableCell>
          <TableCell>End Date</TableCell>
          <TableCell>Budget</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell>{project.name}</TableCell>
            <TableCell>{project.client}</TableCell>
            <TableCell>{project.startDate}</TableCell>
            <TableCell>{project.endDate}</TableCell>
            <TableCell>€{project.budget.toLocaleString()}</TableCell>
            <TableCell>
              <Chip label={project.status} color={getStatusColor(project.status)} size="small" />
            </TableCell>
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
    <DialogTitle>Create New Project</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Project Name"
        fullWidth
        value={newProject.name}
        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
      />
      <TextField
        margin="dense"
        label="Client"
        fullWidth
        value={newProject.client}
        onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
      />
      <TextField
        margin="dense"
        label="Start Date"
        type="date"
        fullWidth
        value={newProject.startDate}
        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
      />
      <TextField
        margin="dense"
        label="End Date"
        type="date"
        fullWidth
        value={newProject.endDate}
        onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
      />
      <TextField
        margin="dense"
        label="Budget (€)"
        type="number"
        fullWidth
        value={newProject.budget}
        onChange={(e) => setNewProject({ ...newProject, budget: parseInt(e.target.value) })}
      />
      <TextField
        margin="dense"
        label="Status"
        select
        fullWidth
        value={newProject.status}
        onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
        SelectProps={{ native: true }}
      >
        <option value="planning">Planning</option>
        <option value="active">Active</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
      </TextField>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
      <Button onClick={handleCreate} variant="contained">Create</Button>
    </DialogActions>
  </Dialog>
</Container>
);
}
