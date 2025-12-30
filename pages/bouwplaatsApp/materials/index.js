import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMaterials, createMaterial } from '../../../store/slices/materialsSlice';
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

export default function Materials() {
const router = useRouter();
const dispatch = useDispatch();
const user = useSelector((state) => state.auth.user);
const materials = useSelector((state) => state.materials.items);
const [openDialog, setOpenDialog] = useState(false);
const [newMaterial, setNewMaterial] = useState({
name: '',
quantity: 0,
unit: '',
supplier: '',
});

useEffect(() => {
if (!user || user.role !== 'field') {
router.push('/auth/login');
} else {
dispatch(fetchMaterials());
}
}, [user, router, dispatch]);

const handleCreate = () => {
dispatch(createMaterial(newMaterial));
setOpenDialog(false);
setNewMaterial({ name: '', quantity: 0, unit: '', supplier: '' });
};

return (
<Container maxWidth="lg">
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
<Typography variant="h4" component="h1">
Materials
</Typography>
<Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
New Material
</Button>
</Box>

text
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Unit</TableCell>
          <TableCell>Supplier</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {materials.map((material) => (
          <TableRow key={material.id}>
            <TableCell>{material.name}</TableCell>
            <TableCell>{material.quantity}</TableCell>
            <TableCell>{material.unit}</TableCell>
            <TableCell>{material.supplier}</TableCell>
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
    <DialogTitle>Add New Material</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Name"
        fullWidth
        value={newMaterial.name}
        onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
      />
      <TextField
        margin="dense"
        label="Quantity"
        type="number"
        fullWidth
        value={newMaterial.quantity}
        onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value) })}
      />
      <TextField
        margin="dense"
        label="Unit"
        fullWidth
        value={newMaterial.unit}
        onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
      />
      <TextField
        margin="dense"
        label="Supplier"
        fullWidth
        value={newMaterial.supplier}
        onChange={(e) => setNewMaterial({ ...newMaterial, supplier: e.target.value })}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
      <Button onClick={handleCreate} variant="contained">Add</Button>
    </DialogActions>
  </Dialog>
</Container>
);
}
