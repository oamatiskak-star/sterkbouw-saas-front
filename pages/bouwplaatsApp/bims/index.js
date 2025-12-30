import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBims, uploadBim } from '../../../store/slices/bimsSlice';
import {
Container,
Typography,
Button,
Card,
CardContent,
CardActions,
Grid,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
TextField,
Box,
IconButton,
LinearProgress,
} from '@mui/material';
import { Add, Delete, CloudUpload } from '@mui/icons-material';

export default function Bims() {
const router = useRouter();
const dispatch = useDispatch();
const user = useSelector((state) => state.auth.user);
const bims = useSelector((state) => state.bims.items);
const [openDialog, setOpenDialog] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [newBim, setNewBim] = useState({
name: '',
description: '',
file: null,
});

useEffect(() => {
if (!user || user.role !== 'field') {
router.push('/auth/login');
} else {
dispatch(fetchBims());
}
}, [user, router, dispatch]);

const handleFileChange = (e) => {
const file = e.target.files[0];
setNewBim({ ...newBim, file });
// Simulate upload progress
let progress = 0;
const interval = setInterval(() => {
progress += 10;
setUploadProgress(progress);
if (progress >= 100) clearInterval(interval);
}, 100);
};

const handleUpload = () => {
dispatch(uploadBim(newBim));
setOpenDialog(false);
setNewBim({ name: '', description: '', file: null });
setUploadProgress(0);
};

return (
<Container maxWidth="lg">
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
<Typography variant="h4" component="h1">
BIM Models
</Typography>
<Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
Upload BIM
</Button>
</Box>

text
  <Grid container spacing={3}>
    {bims.map((bim) => (
      <Grid item xs={12} sm={6} md={4} key={bim.id}>
        <Card>
          <CardContent>
            <Typography variant="h6">{bim.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {bim.description}
            </Typography>
            <Typography variant="caption">Uploaded: {bim.date}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small">View</Button>
            <Button size="small">Download</Button>
            <IconButton>
              <Delete />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    ))}
  </Grid>

  <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
    <DialogTitle>Upload BIM Model</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Name"
        fullWidth
        value={newBim.name}
        onChange={(e) => setNewBim({ ...newBim, name: e.target.value })}
      />
      <TextField
        margin="dense"
        label="Description"
        fullWidth
        multiline
        rows={3}
        value={newBim.description}
        onChange={(e) => setNewBim({ ...newBim, description: e.target.value })}
      />
      <Box sx={{ mt: 2 }}>
        <input
          accept=".ifc,.rvt"
          style={{ display: 'none' }}
          id="bim-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="bim-upload">
          <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
            Select File
          </Button>
        </label>
        {newBim.file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected: {newBim.file.name}
          </Typography>
        )}
        {uploadProgress > 0 && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption">{uploadProgress}%</Typography>
          </Box>
        )}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
      <Button onClick={handleUpload} variant="contained" disabled={!newBim.file}>
        Upload
      </Button>
    </DialogActions>
  </Dialog>
</Container>
);
}

