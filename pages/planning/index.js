// Frontend/pages/planning/index.js
import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import {
  Box,
  Grid,
  Card,
  Typography,
  Divider,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Timeline,
  Warning,
  Schedule,
  TrendingDown,
  TrendingUp,
  CalendarToday,
  AttachMoney,
  Inventory,
  AssignmentLate,
  NotificationsActive
} from '@mui/icons-material';

const PlanningModule = () => {
  const { projects, activeProject, setActiveProject } = useProjects();
  const [activeTab, setActiveTab] = useState(0);
  const [showDelayDialog, setShowDelayDialog] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // --- 1. PROJECTPLANNING DATA ---
  const phases = [
    { id: 'design', name: 'Ontwerp / Voorbereiding', duration: 4 },
    { id: 'demolition', name: 'Sloop', duration: 2 },
    { id: 'rough', name: 'Ruwbouw', duration: 8 },
    { id: 'finishing', name: 'Afbouw', duration: 6 },
    { id: 'delivery', name: 'Oplevering', duration: 1 }
  ];

  // --- 2. REAL-TIME VERTRAGING BEWAKING ---
  const calculateDelayScore = (project) => {
    if (!project.planning) return 'green';
    
    const now = new Date();
    const delays = [];
    
    // Controleer feitelijke vertraging
    project.planning.phases?.forEach(phase => {
      if (phase.endDate && new Date(phase.endDate) < now && phase.status !== 'completed') {
        delays.push({ type: 'factual', phase: phase.name, days: Math.floor((now - new Date(phase.endDate)) / (1000*60*60*24)) });
      }
    });
    
    // AI analyse dreigende vertraging
    if (project.planning.progress) {
      const timeUsed = project.planning.progress.timeUsed || 0;
      const timePlanned = project.planning.progress.timePlanned || 1;
      const progressPercent = project.planning.progress.percent || 0;
      
      if (timeUsed > timePlanned * 0.8 && progressPercent < 60) {
        delays.push({ type: 'threatening', reason: 'Voortgang loopt achter op tijdgebruik' });
      }
    }
    
    // Leveranciers vertraging historie
    if (project.suppliers?.some(s => s.reliability < 0.7)) {
      delays.push({ type: 'threatening', reason: 'Leverancier met historische vertraging' });
    }
    
    if (delays.some(d => d.type === 'factual')) return 'red';
    if (delays.some(d => d.type === 'threatening')) return 'orange';
    return 'green';
  };

  // Live updates elke minuut
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      const newNotifications = [];
      
      projects.forEach(project => {
        const score = calculateDelayScore(project);
        
        // Nieuwe feitelijke vertraging detecteren
        if (score === 'red') {
          const existingNotification = notifications.find(n => n.projectId === project.id && n.type === 'delay');
          if (!existingNotification) {
            newNotifications.push({
              id: Date.now(),
              projectId: project.id,
              projectName: project.name,
              type: 'delay',
              message: 'Feitelijke vertraging gedetecteerd',
              timestamp: new Date().toISOString(),
              severity: 'error'
            });
          }
        }
        
        // Dreigende vertraging detecteren
        if (score === 'orange') {
          const existingNotification = notifications.find(n => n.projectId === project.id && n.type === 'risk');
          if (!existingNotification) {
            newNotifications.push({
              id: Date.now(),
              projectId: project.id,
              projectName: project.name,
              type: 'risk',
              message: 'Dreigende vertraging - tijd voor actie',
              timestamp: new Date().toISOString(),
              severity: 'warning'
            });
          }
        }
      });
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev.slice(0, 9)]);
      }
    }, 60000); // Elke minuut
    
    return () => clearInterval(interval);
  }, [projects, autoRefresh]);

  // --- 3. PORTFOLIO OVERZICHT ---
  const portfolioOverview = useMemo(() => {
    const stats = {
      totalProjects: projects.length,
      green: 0,
      orange: 0,
      red: 0,
      totalCashOut4Weeks: 0,
      totalCashIn4Weeks: 0,
      peakCashOutWeek: { week: null, amount: 0 },
      risks: []
    };
    
    projects.forEach(project => {
      const score = calculateDelayScore(project);
      stats[score]++;
      
      // Cashflow analyse komende 4 weken
      if (project.cashflow) {
        const upcomingCashOut = project.cashflow.weekly?.slice(0, 4).reduce((sum, week) => sum + (week.out || 0), 0) || 0;
        const upcomingCashIn = project.cashflow.weekly?.slice(0, 4).reduce((sum, week) => sum + (week.in || 0), 0) || 0;
        stats.totalCashOut4Weeks += upcomingCashOut;
        stats.totalCashIn4Weeks += upcomingCashIn;
        
        // Peak detection
        project.cashflow.weekly?.forEach((week, index) => {
          if (week.out > stats.peakCashOutWeek.amount) {
            stats.peakCashOutWeek = { week: index + 1, amount: week.out };
          }
        });
      }
      
      // Risico projecten
      if (score === 'red' || score === 'orange') {
        stats.risks.push({
          projectName: project.name,
          score,
          impact: project.budget * 0.1, // Geschatte impact
          reason: score === 'red' ? 'Feitelijke vertraging' : 'Dreigende vertraging'
        });
      }
    });
    
    return stats;
  }, [projects]);

  // --- 4. MATERIAAL & INKOOP PLANNING ---
  const MaterialPlanning = ({ project }) => {
    const materials = project.materials || [];
    const today = new Date();
    
    return (
      <Card sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Inventory /> Materiaal- & Inkoopplanning
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Materiaal</TableCell>
                <TableCell align="right">Besteldatum</TableCell>
                <TableCell align="right">Leverdatum</TableCell>
                <TableCell align="center">Fase</TableCell>
                <TableCell align="center">Kritisch</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material, idx) => {
                const deliveryDate = new Date(material.deliveryDate);
                const orderDate = new Date(material.orderDate);
                const isLate = deliveryDate < today && material.status !== 'delivered';
                const isCritical = material.critical;
                
                return (
                  <TableRow key={idx} sx={{ bgcolor: isLate ? 'error.light' : 'transparent' }}>
                    <TableCell>
                      <Typography variant="body2">{material.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{material.supplier}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {orderDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        {deliveryDate.toLocaleDateString()}
                        {isLate && <Warning color="error" fontSize="small" />}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={material.phase} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      {isCritical ? (
                        <Chip label="JA" size="small" color="error" />
                      ) : (
                        <Chip label="NEE" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={material.status} 
                        size="small"
                        color={material.status === 'delivered' ? 'success' : material.status === 'ordered' ? 'warning' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Leveringskalender warnings */}
        {materials.some(m => {
          const delDate = new Date(m.deliveryDate);
          const phaseEnd = new Date(project.planning?.phases?.find(p => p.name === m.phase)?.endDate || delDate);
          return delDate > phaseEnd && m.critical;
        }) && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">AI-signaal: Kritische materialen komen na fase-einde</Typography>
            <Typography variant="body2">
              Dit veroorzaakt stilstandrisico. Overweeg leverdatum aan te passen of buffer in te bouwen.
            </Typography>
          </Alert>
        )}
      </Card>
    );
  };

  // --- 5. CASHFLOW PLANNING ---
  const CashflowPlanning = ({ project }) => {
    const cashflow = project.cashflow || { weekly: [] };
    const weeks = cashflow.weekly || Array.from({ length: 12 }, (_, i) => ({
      week: i + 1,
      out: 0,
      in: 0,
      net: 0
    }));
    
    // Bereken totalen
    const totals = weeks.reduce((acc, week) => ({
      totalOut: acc.totalOut + (week.out || 0),
      totalIn: acc.totalIn + (week.in || 0),
      totalNet: acc.totalNet + ((week.in || 0) - (week.out || 0))
    }), { totalOut: 0, totalIn: 0, totalNet: 0 });
    
    // Identificeer pieken
    const peakOutWeek = weeks.reduce((max, week) => week.out > max.out ? week : max, { week: 0, out: 0 });
    
    return (
      <Card sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney /> Cashflow Planning - {project.name}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="textSecondary">Totaal Uitgaand</Typography>
              <Typography variant="h5" color="error.main">
                €{Math.round(totals.totalOut).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="textSecondary">Totaal Inkomend</Typography>
              <Typography variant="h5" color="success.main">
                €{Math.round(totals.totalIn).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="textSecondary">Netto Cashflow</Typography>
              <Typography variant="h5" color={totals.totalNet >= 0 ? 'success.main' : 'error.main'}>
                €{Math.round(totals.totalNet).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="textSecondary">Piek Uitgaand (Week {peakOutWeek.week})</Typography>
              <Typography variant="h5" color="warning.main">
                €{Math.round(peakOutWeek.out).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Weekly cashflow tabel */}
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Week</TableCell>
                <TableCell align="right">Uitgaand</TableCell>
                <TableCell align="right">Inkomend</TableCell>
                <TableCell align="right">Netto</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.slice(0, 12).map((week) => (
                <TableRow key={week.week} sx={{ 
                  bgcolor: week.net < 0 ? 'error.light' : week.net > 10000 ? 'success.light' : 'transparent'
                }}>
                  <TableCell>Week {week.week}</TableCell>
                  <TableCell align="right">€{Math.round(week.out).toLocaleString()}</TableCell>
                  <TableCell align="right">€{Math.round(week.in).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Typography color={week.net >= 0 ? 'success.main' : 'error.main'}>
                      €{Math.round(week.net).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {week.week <= 4 && week.net < 0 ? (
                      <Chip label="Waarschuwing" size="small" color="warning" />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  // --- 6. GECOMBINEERDE PORTFOLIO CASHFLOW ---
  const PortfolioCashflow = () => {
    const allWeeks = Array.from({ length: 16 }, (_, i) => i + 1);
    
    // Aggregeer cashflow over alle projecten
    const portfolioWeeks = allWeeks.map(week => {
      let totalOut = 0;
      let totalIn = 0;
      
      projects.forEach(project => {
        const projectWeek = project.cashflow?.weekly?.[week - 1];
        if (projectWeek) {
          totalOut += projectWeek.out || 0;
          totalIn += projectWeek.in || 0;
        }
      });
      
      return {
        week,
        out: totalOut,
        in: totalIn,
        net: totalIn - totalOut
      };
    });
    
    const peakWeek = portfolioWeeks.reduce((max, week) => week.out > max.out ? week : max, { week: 0, out: 0 });
    const deficitWeeks = portfolioWeeks.filter(w => w.net < 0);
    
    return (
      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Portfolio Cashflow - Alle Projecten</Typography>
        
        {/* Quick stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Piek Uitgaand</Typography>
              <Typography variant="h5" color="error.main">
                Week {peakWeek.week}: €{Math.round(peakWeek.out).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Tekort Weken</Typography>
              <Typography variant="h5" color="warning.main">
                {deficitWeeks.length} weken
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Max Tekort</Typography>
              <Typography variant="h5" color="error.main">
                €{Math.round(Math.min(...portfolioWeeks.map(w => w.net))).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Totale Netto</Typography>
              <Typography variant="h5" color={portfolioWeeks.reduce((sum, w) => sum + w.net, 0) >= 0 ? 'success.main' : 'error.main'}>
                €{Math.round(portfolioWeeks.reduce((sum, w) => sum + w.net, 0)).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* AI Signalen */}
        {deficitWeeks.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">AI-signaal: Cashflow risico's gedetecteerd</Typography>
            <Typography variant="body2">
              {deficitWeeks.length} weken met negatieve cashflow. Overweeg:
              <ul>
                <li>Project fasering aanpassen</li>
                <li>Betalingstermijnen heronderhandelen</li>
                <li>Brugfinanciering voor piekmomenten</li>
              </ul>
            </Typography>
          </Alert>
        )}
        
        {/* Cashflow chart simplified */}
        <Box sx={{ height: 200, mt: 3, position: 'relative' }}>
          {portfolioWeeks.map((week, index) => (
            <Tooltip key={week.week} title={`Week ${week.week}: €${Math.round(week.net).toLocaleString()}`}>
              <Box
                sx={{
                  position: 'absolute',
                  left: `${(index / portfolioWeeks.length) * 100}%`,
                  bottom: '50%',
                  width: `${100 / portfolioWeeks.length}%`,
                  height: Math.abs(week.net) / Math.max(...portfolioWeeks.map(w => Math.abs(w.net))) * 100,
                  bgcolor: week.net >= 0 ? 'success.main' : 'error.main',
                  opacity: 0.7,
                  cursor: 'pointer',
                  '&:hover': { opacity: 1 }
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Card>
    );
  };

  // --- 7. PROJECT TIMELINE MET VERTRAGING ---
  const ProjectTimeline = ({ project }) => {
    const delayScore = calculateDelayScore(project);
    const phasesWithData = project.planning?.phases || phases.map(p => ({ ...p, status: 'planned' }));
    
    return (
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timeline /> Project Planning - {project.name}
          </Typography>
          <Chip 
            icon={delayScore === 'red' ? <AssignmentLate /> : delayScore === 'orange' ? <Warning /> : <Schedule />}
            label={delayScore === 'red' ? 'VERTRAAGD' : delayScore === 'orange' ? 'RISICO' : 'OP SCHEMA'}
            color={delayScore === 'red' ? 'error' : delayScore === 'orange' ? 'warning' : 'success'}
            size="small"
          />
        </Box>
        
        {phasesWithData.map((phase, index) => {
          const isDelayed = phase.endDate && new Date(phase.endDate) < new Date() && phase.status !== 'completed';
          const isCurrent = phase.status === 'in-progress';
          
          return (
            <Box key={phase.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  bgcolor: isDelayed ? 'error.main' : isCurrent ? 'warning.main' : 'success.main',
                  mr: 2 
                }} />
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {phase.name}
                </Typography>
                <Chip 
                  label={phase.status || 'gepland'} 
                  size="small"
                  color={phase.status === 'completed' ? 'success' : phase.status === 'in-progress' ? 'warning' : 'default'}
                />
              </Box>
              
              <Box sx={{ pl: 4 }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">
                      Gepland: {phase.startDate ? new Date(phase.startDate).toLocaleDateString() : '-'} 
                      → {phase.endDate ? new Date(phase.endDate).toLocaleDateString() : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">
                      Werkelijk: {phase.actualStart ? new Date(phase.actualStart).toLocaleDateString() : '-'}
                      → {phase.actualEnd ? new Date(phase.actualEnd).toLocaleDateString() : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {isDelayed && (
                      <Typography variant="body2" color="error">
                        <Warning fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {Math.floor((new Date() - new Date(phase.endDate)) / (1000*60*60*24))} dagen vertraagd
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                
                {isCurrent && project.planning?.progress && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      Voortgang: {project.planning.progress.percent || 0}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.planning.progress.percent || 0} 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )}
              </Box>
              
              {index < phasesWithData.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          );
        })}
        
        {/* AI Risico analyse */}
        {delayScore === 'orange' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">AI-analyse: Dreigende vertraging</Typography>
            <Typography variant="body2">
              Factoren: {project.suppliers?.filter(s => s.reliability < 0.7).length || 0} onbetrouwbare leveranciers, 
              voortgang {project.planning?.progress?.percent || 0}% vs tijdgebruik {project.planning?.progress?.timeUsed || 0} weken
            </Typography>
          </Alert>
        )}
        
        {delayScore === 'red' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">FEITELIJKE VERTRAGING</Typography>
            <Typography variant="body2">
              Impact: €{Math.round(project.budget * 0.15).toLocaleString()} extra financieringsdruk
            </Typography>
            <Button 
              size="small" 
              variant="outlined" 
              sx={{ mt: 1 }}
              onClick={() => setShowDelayDialog(project)}
            >
              Oplossingen bekijken
            </Button>
          </Alert>
        )}
      </Card>
    );
  };

  // --- 8. NOTIFICATIE PANEL ---
  const NotificationPanel = () => (
    <Card sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsActive /> Live Updates
          <Badge badgeContent={notifications.length} color="error" />
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              size="small"
            />
          }
          label="Auto-refresh"
        />
      </Box>
      
      {notifications.length > 0 ? (
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {notifications.map((notification) => (
            <Alert 
              key={notification.id}
              severity={notification.severity}
              sx={{ mb: 1 }}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            >
              <Typography variant="subtitle2">{notification.projectName}</Typography>
              <Typography variant="body2">{notification.message}</Typography>
              <Typography variant="caption" display="block">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </Typography>
            </Alert>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
          Geen nieuwe meldingen
        </Typography>
      )}
    </Card>
  );

  // --- 9. VERTRAGING DIALOOG ---
  const DelayDialog = ({ project, open, onClose }) => {
    if (!project) return null;
    
    const delayScore = calculateDelayScore(project);
    const impacts = [
      { label: 'Extra financieringskosten', amount: project.budget * 0.1 },
      { label: 'Contractuele boetes', amount: project.budget * 0.02 },
      { label: 'Gemiste huurinkomsten', amount: project.expectedRent * 3 }
    ];
    
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Vertragingsanalyse - {project.name}
          <Chip 
            label={delayScore === 'red' ? 'FEITELIJK' : 'DREIGEND'} 
            color={delayScore === 'red' ? 'error' : 'warning'}
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Financiële Impact</Typography>
              {impacts.map((impact, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{impact.label}</Typography>
                  <Typography variant="body2" color="error.main">
                    €{Math.round(impact.amount).toLocaleString()}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">Totale impact</Typography>
                <Typography variant="subtitle2" color="error.main">
                  €{Math.round(impacts.reduce((sum, i) => sum + i.amount, 0)).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>AI Optimalisatie-voorstellen</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">1. Fase opschuiven</Typography>
                <Typography variant="body2">Verplaats afbouw met 2 weken om materialen af te wachten</Typography>
              </Alert>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">2. Bestelling splitsen</Typography>
                <Typography variant="body2">Kritieke materialen eerder bestellen, rest later</Typography>
              </Alert>
              <Alert severity="info">
                <Typography variant="subtitle2">3. Leverancier switchen</Typography>
                <Typography variant="body2">Overstappen naar betrouwbaardere leverancier (+5% kosten)</Typography>
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Gevolgen voor andere projecten</Typography>
              <Typography variant="body2" color="textSecondary">
                {delayScore === 'red' 
                  ? 'Deze vertraging heeft impact op capaciteitsplanning voor Q3 projecten'
                  : 'Voorkomen van vertraging bespaart €' + Math.round(project.budget * 0.12).toLocaleString() + ' aan cascade-effecten'
                }
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Sluiten</Button>
          <Button variant="contained" onClick={() => {
            // Hier zou de actie voor herplanning komen
            onClose();
          }}>
            Herplanning starten
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // --- HOOFD RENDER ---
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Schedule /> Planning & Cashflow Control
        <Chip 
          label={`${portfolioOverview.green} 🟢 ${portfolioOverview.orange} 🟠 ${portfolioOverview.red} 🔴`}
          variant="outlined"
        />
      </Typography>
      
      {/* Notification Panel */}
      <NotificationPanel />
      
      {/* Portfolio Status Balk */}
      <Card sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Projecten</Typography>
              <Typography variant="h5">{portfolioOverview.totalProjects}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">🟢 Op Schema</Typography>
              <Typography variant="h5" color="success.main">{portfolioOverview.green}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">🟠 Risico</Typography>
              <Typography variant="h5" color="warning.main">{portfolioOverview.orange}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">🔴 Vertraagd</Typography>
              <Typography variant="h5" color="error.main">{portfolioOverview.red}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Cashflow Risico</Typography>
              <Typography variant="h5" color={portfolioOverview.totalCashOut4Weeks > portfolioOverview.totalCashIn4Weeks ? 'error.main' : 'success.main'}>
                €{Math.round(portfolioOverview.totalCashOut4Weeks - portfolioOverview.totalCashIn4Weeks).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={2}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Piek Week</Typography>
              <Typography variant="h5" color="warning.main">
                {portfolioOverview.peakCashOutWeek.week || '-'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>
      
      {/* Tabs voor project selectie */}
      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="Portfolio Overzicht" />
        {projects.map((project, index) => (
          <Tab 
            key={project.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {project.name}
                {calculateDelayScore(project) === 'red' && <Warning color="error" fontSize="small" />}
                {calculateDelayScore(project) === 'orange' && <Warning color="warning" fontSize="small" />}
              </Box>
            }
          />
        ))}
      </Tabs>
      
      {/* Content per tab */}
      {activeTab === 0 ? (
        // Portfolio Overzicht
        <>
          <PortfolioCashflow />
          
          {/* Top Risico Projecten */}
          {portfolioOverview.risks.length > 0 && (
            <Card sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>Top Risico Projecten</Typography>
              <Grid container spacing={2}>
                {portfolioOverview.risks.slice(0, 3).map((risk, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">{risk.projectName}</Typography>
                        <Chip 
                          label={risk.score === 'red' ? 'VERTRAAGD' : 'RISICO'} 
                          size="small"
                          color={risk.score === 'red' ? 'error' : 'warning'}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary">{risk.reason}</Typography>
                      <Typography variant="body1" color="error.main" sx={{ mt: 1 }}>
                        €{Math.round(risk.impact).toLocaleString()} impact
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Card>
          )}
          
          {/* Capaciteitsbewaking */}
          <Card sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Capaciteitsbewaking</Typography>
            <Alert severity="info">
              <Typography variant="body2">
                {projects.filter(p => p.planning?.phases?.some(ph => ph.status === 'in-progress')).length} 
                actieve projecten dit kwartaal
              </Typography>
            </Alert>
          </Card>
        </>
      ) : (
        // Project Detail
        (() => {
          const project = projects[activeTab - 1];
          if (!project) return null;
          
          return (
            <>
              <ProjectTimeline project={project} />
              <MaterialPlanning project={project} />
              <CashflowPlanning project={project} />
              
              {/* Wat-als Scenario */}
              <Card sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>Wat-als Scenario Analyse</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="textSecondary">Vertraging 2 weken</Typography>
                      <Typography variant="body1" color="error.main" sx={{ mt: 1 }}>
                        €{Math.round(project.budget * 0.08).toLocaleString()} extra
                      </Typography>
                      <Button size="small" variant="outlined" sx={{ mt: 1 }} fullWidth>
                        Simuleren
                      </Button>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="textSecondary">Kosten +10%</Typography>
                      <Typography variant="body1" color="error.main" sx={{ mt: 1 }}>
                        €{Math.round(project.budget * 0.1).toLocaleString()} impact
                      </Typography>
                      <Button size="small" variant="outlined" sx={{ mt: 1 }} fullWidth>
                        Simuleren
                      </Button>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="textSecondary">Vroegtijdige oplevering</Typography>
                      <Typography variant="body1" color="success.main" sx={{ mt: 1 }}>
                        €{Math.round(project.expectedRent * 2).toLocaleString()} winst
                      </Typography>
                      <Button size="small" variant="outlined" sx={{ mt: 1 }} fullWidth>
                        Simuleren
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </Card>
            </>
          );
        })()
      )}
      
      {/* Vertraging Dialog */}
      {showDelayDialog && (
        <DelayDialog 
          project={showDelayDialog}
          open={!!showDelayDialog}
          onClose={() => setShowDelayDialog(null)}
        />
      )}
    </Box>
  );
};

export default PlanningModule;
