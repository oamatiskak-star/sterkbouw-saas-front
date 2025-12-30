import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress
} from '@mui/material';
import { exportDocuments } from '../../services/exportService';

const ExportManager = ({ documents = [] }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'word', label: 'Word' },
    { value: 'zip', label: 'ZIP Archive' }
  ];

  const handleSelectDocument = (docId) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map(doc => doc.id));
    }
  };

  const handleExport = async () => {
    if (selectedDocuments.length === 0) {
      setError('Please select at least one document');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await exportDocuments(selectedDocuments, selectedFormat);
      setSuccess(`Export successful! ${result.message}`);
      
      // Reset selection after successful export
      setSelectedDocuments([]);
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        Export Manager
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Select Documents:
        </Typography>
        <Button onClick={handleSelectAll} size="small" sx={{ mb: 1 }}>
          {selectedDocuments.length === documents.length ? 'Deselect All' : 'Select All'}
        </Button>
        
        <List dense>
          {documents.map((doc) => (
            <ListItem
              key={doc.id}
              button
              onClick={() => handleSelectDocument(doc.id)}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selectedDocuments.includes(doc.id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={doc.name}
                secondary={`Type: ${doc.type} • Size: ${doc.size}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Export Format</InputLabel>
        <Select
          value={selectedFormat}
          label="Export Format"
          onChange={(e) => setSelectedFormat(e.target.value)}
        >
          {formats.map((format) => (
            <MenuItem key={format.value} value={format.value}>
              {format.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleExport}
        disabled={loading || selectedDocuments.length === 0}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Export Selected Documents'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
        Selected: {selectedDocuments.length} document(s) • Format: {selectedFormat.toUpperCase()}
      </Typography>
    </Box>
  );
};

export default ExportManager;
