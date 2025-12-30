import React, { useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { CheckCircle, Warning, PictureAsPdf } from '@mui/icons-material';

const DocumentGenerator = ({ type, projectId, deliveryPoints, onComplete }) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedDocument, setGeneratedDocument] = useState(null);

  const generateDocument = async () => {
    setGenerating(true);
    setProgress(0);
    
    try {
      // Simuleer generatieproces
      const steps = [
        'Projectdata laden...',
        'Opleverpunten analyseren...',
        'Juridische sjablonen toepassen...',
        'PDF genereren...',
        'Archiveren...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Genereer document data
      const document = {
        id: `doc-${Date.now()}`,
        type: type,
        projectId,
        timestamp: new Date().toISOString(),
        deliveryPointsSummary: {
          total: deliveryPoints.length,
          approved: deliveryPoints.filter(p => p.status === 'akkoord').length,
          open: deliveryPoints.filter(p => p.status === 'open').length,
          byBuildingNumber: {}
        },
        downloadUrl: `/api/documents/${projectId}/${type}.pdf`
      };
      
      setGeneratedDocument(document);
      setGenerating(false);
      
    } catch (error) {
      console.error('Generation error:', error);
      setGenerating(false);
    }
  };

  // Toon opleverpunten status
  const renderDeliveryPointsStatus = () => {
    if (!deliveryPoints || deliveryPoints.length === 0) {
      return <Alert severity="info">Geen opleverpunten geregistreerd</Alert>;
    }
    
    const pointsByBuilding = deliveryPoints.reduce((acc, point) => {
      if (!acc[point.buildingNumber]) {
        acc[point.buildingNumber] = [];
      }
      acc[point.buildingNumber].push(point);
      return acc;
    }, {});
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Opleverpunten per bouwnummer:
        </Typography>
        <List dense>
          {Object.entries(pointsByBuilding).map(([buildingNumber, points]) => {
            const approved = points.filter(p => p.status === 'akkoord').length;
            const total = points.length;
            
            return (
              <ListItem key={buildingNumber}>
                <ListItemText 
                  primary={`Bouwnummer ${buildingNumber}`}
                  secondary={`${approved}/${total} punten akkoord`}
                />
                <Chip 
                  label={`${Math.round((approved/total)*100)}%`}
                  color={approved === total ? 'success' : approved/total > 0.5 ? 'warning' : 'error'}
                  size="small"
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {type === 'delivery_package' ? 'Opleverpakket Genereren' : type}
      </Typography>
      
      {generating ? (
        <Box>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Document wordt gegenereerd... ({progress}%)
          </Typography>
        </Box>
      ) : generatedDocument ? (
        <Alert 
          severity="success"
          action={
            <Button 
              color="inherit" 
              size="small"
              startIcon={<PictureAsPdf />}
              href={generatedDocument.downloadUrl}
              target="_blank"
            >
              Download
            </Button>
          }
        >
          Document succesvol gegenereerd!
          {renderDeliveryPointsStatus()}
        </Alert>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Dit document wordt automatisch gevuld met actuele projectgegevens
          </Alert>
          
          {renderDeliveryPointsStatus()}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={generateDocument}
              startIcon={<PictureAsPdf />}
            >
              Nu genereren
            </Button>
            <Button onClick={onComplete}>
              Annuleren
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DocumentGenerator;
