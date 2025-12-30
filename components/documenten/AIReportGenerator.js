import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { generateReport } from '../../services/aiService';

const AIReportGenerator = ({ projectId, onReportGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const report = await generateReport(projectId, prompt);
      setResult(report);
      if (onReportGenerated) {
        onReportGenerated(report);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        AI Report Generator
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what kind of report you need (e.g., 'Generate a weekly progress report for project X')"
        variant="outlined"
        margin="normal"
      />
      
      <Button
        variant="contained"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Report'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {result && (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Generated Report:
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {result}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AIReportGenerator;
