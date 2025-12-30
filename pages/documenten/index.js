import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  PictureAsPdf,
  Description,
  Archive,
  CloudDownload,
  Share,
  Visibility,
  Edit,
  CheckCircle,
  Warning,
  Schedule,
  Timeline,
  AttachMoney,
  Assessment,
  FileCopy,
  Home,
  Construction,
  PhotoCamera,
  ExpandMore,
  ExpandLess,
  Refresh,
  LockOpen,
  Download
} from '@mui/icons-material';
import { useProject } from '../../context/ProjectContext';
import { useLiveDeliveryPoints } from '../../hooks/useLiveDeliveryPoints';
import DocumentGenerator from '../../components/documenten/DocumentGenerator';
import AIReportGenerator from '../../components/documenten/AIReportGenerator';
import AuditTrail from '../../components/documenten/AuditTrail';
import ExportManager from '../../components/documenten/ExportManager';

const DocumentenPage = () => {
  const { projects, activeProject, setActiveProject } = useProject();
  const { 
    deliveryPoints, 
    buildingNumbers, 
    spaces, 
    refreshData, 
    generateDeliveryReport,
    isLoading 
  } = useLiveDeliveryPoints(activeProject?.id);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedBuilding, setExpandedBuilding] = useState({});
  const [generatingDocument, setGeneratingDocument] = useState(null);
  const [documentStatus, setDocumentStatus] = useState({});

  // Realtime statusberekening
  const calculateDeliveryStatus = () => {
    if (!deliveryPoints || !activeProject) return null;
    
    const points = deliveryPoints.filter(dp => dp.projectId === activeProject.id);
    const total = points.length;
    const open = points.filter(p => p.status === 'open').length;
    const inProgress = points.filter(p => p.status === 'in_uitvoering').length;
    const ready = points.filter(p => p.status === 'gereed').length;
    const approved = points.filter(p => p.status === 'akkoord').length;
    
    return {
      total,
      open,
      inProgress,
      ready,
      approved,
      completionRate: total > 0 ? (approved / total) * 100 : 0,
      isDeliveryReady: total > 0 && approved === total
    };
  };

  const deliveryStatus = calculateDeliveryStatus();

  // Tabpanelen
  const TabPanel = ({ children, value, index }) => {
    return value === index ? <Box sx={{ mt: 3 }}>{children}</Box> : null;
  };

  // Project selector sectie
  const renderProjectSelector = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Selecteer Project</InputLabel>
              <Select
                value={activeProject?.id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value);
                  setActiveProject(project);
                  refreshData(project?.id);
                }}
                label="Selecteer Project"
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name} - {project.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {activeProject && (
            <>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="textSecondary">
                      Projectstatus
                    </Typography>
                    <Chip 
                      label={activeProject.status}
                      color={
                        activeProject.status === 'opleverfase' ? 'success' :
                        activeProject.status === 'vertraging' ? 'warning' :
                        'info'
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="textSecondary">
                      Laatste update
                    </Typography>
                    <Typography variant="body2">
                      {new Date(activeProject.lastUpdated).toLocaleDateString('nl-NL')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="textSecondary">
                      Documentstatus
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {deliveryStatus?.completionRate === 100 ? (
                        <Chip icon={<CheckCircle />} label="Compleet" color="success" size="small" />
                      ) : (
                        <Chip icon={<Warning />} label="Incompleet" color="warning" size="small" />
                      )}
                      <IconButton size="small" onClick={() => refreshData(activeProject.id)}>
                        <Refresh />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="textSecondary">
                      Opleverpunten
                    </Typography>
                    <Typography variant="body2">
                      {deliveryStatus?.approved}/{deliveryStatus?.total} akkoord
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  // Sectie A: Formele projectdocumenten
  const renderFormalDocuments = () => (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Formele Projectdocumenten" 
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Button 
            startIcon={<PictureAsPdf />}
            onClick={() => setGeneratingDocument('delivery_package')}
            disabled={!activeProject}
          >
            Genereer Opleverpakket
          </Button>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Opleverdocumenten */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
              Opleverdocumenten (Live vanuit Bouwplaats)
            </Typography>
            
            {!activeProject ? (
              <Alert severity="info">
                Selecteer een project om de opleverstatus te zien
              </Alert>
            ) : (
              <>
                {/* Opleverstatus overzicht */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Real-time Opleverstatus
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6">{deliveryStatus?.open || 0}</Typography>
                          <Typography variant="caption" color="error">Open</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6">{deliveryStatus?.inProgress || 0}</Typography>
                          <Typography variant="caption" color="warning">In uitvoering</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6">{deliveryStatus?.ready || 0}</Typography>
                          <Typography variant="caption">Gereed</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6">{deliveryStatus?.approved || 0}</Typography>
                          <Typography variant="caption" color="success">Akkoord</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <LinearProgress 
                      variant="determinate" 
                      value={deliveryStatus?.completionRate || 0} 
                      sx={{ mt: 2 }}
                      color={deliveryStatus?.completionRate === 100 ? 'success' : 'primary'}
                    />
                  </CardContent>
                </Card>

                {/* Per bouwnummer overzicht */}
                <Typography variant="subtitle2" gutterBottom>
                  Per Bouwnummer:
                </Typography>
                {buildingNumbers.map((buildingNumber) => {
                  const buildingPoints = deliveryPoints.filter(
                    dp => dp.buildingNumber === buildingNumber
                  );
                  const approvedPoints = buildingPoints.filter(p => p.status === 'akkoord').length;
                  const totalPoints = buildingPoints.length;
                  
                  return (
                    <Card key={buildingNumber} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Grid container alignItems="center">
                          <Grid item xs={8}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton 
                                size="small" 
                                onClick={() => setExpandedBuilding(prev => ({
                                  ...prev,
                                  [buildingNumber]: !prev[buildingNumber]
                                }))}
                              >
                                {expandedBuilding[buildingNumber] ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                              <Typography>
                                Bouwnummer {buildingNumber}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4} textAlign="right">
                            <Chip 
                              label={`${approvedPoints}/${totalPoints}`}
                              size="small"
                              color={approvedPoints === totalPoints ? 'success' : 'warning'}
                            />
                          </Grid>
                        </Grid>
                        
                        <Collapse in={expandedBuilding[buildingNumber]}>
                          <Divider sx={{ my: 1 }} />
                          <List dense>
                            {spaces
                              .filter(space => space.buildingNumber === buildingNumber)
                              .map((space) => {
                                const spacePoints = deliveryPoints.filter(
                                  dp => dp.buildingNumber === buildingNumber && dp.space === space.name
                                );
                                const spaceApproved = spacePoints.filter(p => p.status === 'akkoord').length;
                                
                                return (
                                  <ListItem key={space.id} sx={{ pl: 4 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <Home fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={space.name}
                                      secondary={`${spaceApproved}/${spacePoints.length} punten akkoord`}
                                    />
                                    <Box>
                                      {spacePoints.some(p => p.photos?.length > 0) && (
                                        <PhotoCamera color="action" fontSize="small" />
                                      )}
                                    </Box>
                                  </ListItem>
                                );
                              })}
                          </List>
                        </Collapse>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
            
            {/* Opleverdocumenten generatie */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Beschikbare opleverdocumenten:
              </Typography>
              <Grid container spacing={1}>
                {['Opleverformulier', 'Proces-verbaal', 'Restpuntenlijst', 'Garantieoverzicht', 'As-built verklaring'].map((doc) => (
                  <Grid item key={doc}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Description />}
                      onClick={() => generateDeliveryReport(doc)}
                      disabled={!activeProject}
                    >
                      {doc}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Contractdocumenten */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#2196f3', fontWeight: 'bold' }}>
              <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
              Contract- & Verplichtingsdocumenten
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Document</TableCell>
                    <TableCell>Leverancier</TableCell>
                    <TableCell>Datum</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Acties</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Hoofdcontract</TableCell>
                    <TableCell>Opdrachtgever</TableCell>
                    <TableCell>15-01-2024</TableCell>
                    <TableCell><Chip label="Definitief" color="success" size="small" /></TableCell>
                    <TableCell>
                      <IconButton size="small"><Visibility /></IconButton>
                      <IconButton size="small"><Download /></IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Meerwerk overeenkomst</TableCell>
                    <TableCell>Leverancier X</TableCell>
                    <TableCell>20-01-2024</TableCell>
                    <TableCell><Chip label="Concept" color="warning" size="small" /></TableCell>
                    <TableCell>
                      <IconButton size="small"><Visibility /></IconButton>
                      <IconButton size="small"><Edit /></IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Sectie B: AI-rapportages
  const renderAIReports = () => (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="AI Rapportages" 
        titleTypographyProps={{ variant: 'h6' }}
        subheader="Gestructureerde input van AI-rollen"
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* AI Uitvoerder */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Construction sx={{ color: '#ff9800' }} />
                    <Typography variant="subtitle1">AI Uitvoerder</Typography>
                  </Box>
                }
                subheader="Bouw & voortgang"
              />
              <CardContent>
                <AIReportGenerator
                  role="uitvoerder"
                  projectId={activeProject?.id}
                  deliveryPoints={deliveryPoints}
                  onGenerate={(report) => console.log('Generated:', report)}
                />
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Afwijkingen planning"
                      secondary="3 punten achter op schema"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Vertragingen"
                      secondary="Badkamers 2-4 dagen vertraging"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Projectmanager */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment sx={{ color: '#9c27b0' }} />
                    <Typography variant="subtitle1">AI Projectmanager</Typography>
                  </Box>
                }
                subheader="Overzicht & beslissingen"
              />
              <CardContent>
                <AIReportGenerator
                  role="projectmanager"
                  projectId={activeProject?.id}
                  onGenerate={(report) => console.log('Generated:', report)}
                />
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Kritiek: Materiaallevering 5 dagen vertraagd
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Inkoop */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileCopy sx={{ color: '#f44336' }} />
                    <Typography variant="subtitle1">AI Inkoop</Typography>
                  </Box>
                }
                subheader="Werkvoorbereiding"
              />
              <CardContent>
                <AIReportGenerator
                  role="inkoop"
                  projectId={activeProject?.id}
                  onGenerate={(report) => console.log('Generated:', report)}
                />
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Leveringsstatus"
                      secondary="4 bestellingen onderweg"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Sectie C: Technische & financiële rapportages
  const renderTechnicalReports = () => (
    <Card sx={{ mb: 3 }}>
      <CardHeader title="Technische & Financiële Rapportages" />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#00bcd4' }}>
              <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
              Financiële Projectrapportage
            </Typography>
            {/* Financiële rapportage component */}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#795548' }}>
              <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
              Planning & Vertraging
            </Typography>
            {/* Planning rapportage component */}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Sectie D: Documentarchief
  const renderArchive = () => (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Documentarchief & Audit Trail" 
        action={<AuditTrail projectId={activeProject?.id} />}
      />
      <CardContent>
        <Archive projectId={activeProject?.id} />
      </CardContent>
    </Card>
  );

  // Sectie E: Export
  const renderExportSection = () => (
    <Card>
      <CardHeader title="Acties & Exports" />
      <CardContent>
        <ExportManager 
          projectId={activeProject?.id}
          deliveryPoints={deliveryPoints}
          disabled={!activeProject}
        />
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Documenten & Rapportages
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Centraal geheugen en verantwoordingscentrum voor project {activeProject?.name || ''}
      </Typography>

      {/* Projectselector */}
      {renderProjectSelector()}

      {!activeProject ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          Selecteer een project om documenten en rapportages te bekijken
        </Alert>
      ) : (
        <>
          {/* Tabs voor verschillende secties */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              <Tab label="Formele Documenten" />
              <Tab label="AI Rapportages" />
              <Tab label="Technisch & Financieel" />
              <Tab label="Archief" />
              <Tab label="Exports" />
            </Tabs>
          </Box>

          {/* Tab inhoud */}
          <TabPanel value={selectedTab} index={0}>
            {renderFormalDocuments()}
          </TabPanel>
          
          <TabPanel value={selectedTab} index={1}>
            {renderAIReports()}
          </TabPanel>
          
          <TabPanel value={selectedTab} index={2}>
            {renderTechnicalReports()}
          </TabPanel>
          
          <TabPanel value={selectedTab} index={3}>
            {renderArchive()}
          </TabPanel>
          
          <TabPanel value={selectedTab} index={4}>
            {renderExportSection()}
          </TabPanel>
        </>
      )}

      {/* Document generatie dialoog */}
      <Dialog 
        open={!!generatingDocument} 
        onClose={() => setGeneratingDocument(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Document Genereren</DialogTitle>
        <DialogContent>
          <DocumentGenerator
            type={generatingDocument}
            projectId={activeProject?.id}
            deliveryPoints={deliveryPoints}
            onComplete={() => setGeneratingDocument(null)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGeneratingDocument(null)}>Annuleren</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentenPage;
