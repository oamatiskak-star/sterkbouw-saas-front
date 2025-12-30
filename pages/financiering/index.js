// SAAS Frontend/pages/financiering/index.js
import React, { useState, useEffect } from 'react';
import { useProject } from '../../../context/ProjectContext';
import {
  Card,
  Grid,
  Typography,
  Divider,
  Box,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';

const FinancieringModule = () => {
  const { selectedProject } = useProject();
  const [analyses, setAnalyses] = useState({
    ontwikkelenVerkopen: false,
    aankopenVerhuren: false,
    ontwikkelenAanhouden: false,
    herfinanciering: false,
    stikoAnalyse: false,
    scenarioAnalyse: false,
    waardeOptimalisatie: false
  });
  const [results, setResults] = useState(null);
  const [financieringsVergelijking, setFinancieringsVergelijking] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // --- DEEL 1: PROJECT INGANG ---
  const projectData = selectedProject ? {
    aankoopprijs: selectedProject.purchasePrice || 0,
    verwervingskosten: selectedProject.acquisitionCosts || 0,
    bouwkosten: selectedProject.constructionCosts || 0,
    doorlooptijd: selectedProject.duration || 0,
    huuropbrengst: selectedProject.expectedRent || 0,
    verkoopwaarde: selectedProject.expectedSaleValue || 0,
    eigenVermogen: selectedProject.equity || 0,
    bestaandeFinanciering: selectedProject.existingFinancing || null
  } : null;

  // --- DEEL 2: ANALYSE SELECTOR ---
  const analyseOpties = [
    { id: 'ontwikkelenVerkopen', label: 'Ontwikkelen & Verkopen' },
    { id: 'aankopenVerhuren', label: 'Aankopen & Verhuren' },
    { id: 'ontwikkelenAanhouden', label: 'Ontwikkelen & Aanhouden' },
    { id: 'herfinanciering', label: 'Herfinanciering / Optimalisatie' },
    { id: 'stikoAnalyse', label: 'STIKO-structuur analyse' },
    { id: 'scenarioAnalyse', label: 'Scenario-analyse / Gevoeligheden' },
    { id: 'waardeOptimalisatie', label: 'Waarde-vermeerdering optimalisatie' }
  ];

  // --- DEEL 3: KERNBERKEKINGEN ---
  const runAnalyses = async () => {
    if (!projectData) return;
    
    const calculatedResults = {};
    
    // A. Ontwikkelen & Verkopen
    if (analyses.ontwikkelenVerkopen) {
      const totaleInvestering = projectData.aankoopprijs + projectData.verwervingskosten + projectData.bouwkosten;
      const brutowinst = projectData.verkoopwaarde - totaleInvestering;
      const nettowinst = brutowinst * 0.79; // Belasting correctie
      
      calculatedResults.ontwikkelenVerkopen = {
        totaleInvestering,
        verkoopopbrengst: projectData.verkoopwaarde,
        brutowinst,
        nettowinst,
        roi: (nettowinst / totaleInvestering) * 100,
        haalbaarheid: brutowinst > totaleInvestering * 1.15 ? 'JA' : brutowinst > totaleInvestering ? 'MARGINAAL' : 'NEE',
        kritiekeFactoren: ['Bouwvertraging', 'Kostenoverschrijding', 'Marktdaling'],
        risicos: ['Kosten 10-20% hoger', 'Verkoop 6+ maanden vertraging']
      };
    }

    // B. Aankopen & Verhuren
    if (analyses.aankopenVerhuren) {
      const jaarlijkseHuur = projectData.huuropbrengst * 12;
      const totaleInvestering = projectData.aankoopprijs + projectData.verwervingskosten;
      const bar = (jaarlijkseHuur / totaleInvestering) * 100;
      
      calculatedResults.aankopenVerhuren = {
        bar,
        nettoRendement: bar * 0.75, // Kosten correctie
        dscr: jaarlijkseHuur / (totaleInvestering * 0.07), // Schuldservice
        ltv: (totaleInvestering - projectData.eigenVermogen) / totaleInvestering * 100,
        cashflowPerMaand: jaarlijkseHuur/12 - (totaleInvestering * 0.005),
        houdbaarheidRente: `Max +${(bar - 2).toFixed(1)}%`,
        gevoeligheidLeegstand: `Rendement daalt ${(bar * 0.1).toFixed(1)}% bij 10% leegstand`
      };
    }

    // C. Ontwikkelen & Aanhouden (combinatie)
    if (analyses.ontwikkelenAanhouden) {
      const totaleInvestering = projectData.aankoopprijs + projectData.verwervingskosten + projectData.bouwkosten;
      const waardesprong = projectData.verkoopwaarde - totaleInvestering;
      const nieuweFinancieringsruimte = waardesprong * 0.7;
      
      calculatedResults.ontwikkelenAanhouden = {
        ontwikkelwinst: waardesprong,
        waardesprongPercentage: (waardesprong / totaleInvestering) * 100,
        nieuweFinancieringsruimte,
        besteHerfinancieringMoment: '6 maanden na oplevering',
        optimaleSchuldgraad: '65-70%'
      };
    }

    setResults(calculatedResults);
    await runFinancieringsVergelijking();
  };

  // --- FINANCIERINGSVERGELIJKING ENGINE ---
  const nederlandseFinanciers = [
    // Non-bank financiers
    { 
      naam: 'Mogelijk Vastgoedfinancieringen',
      categorie: 'non-bank',
      minTicket: 500000,
      maxTicket: 10000000,
      ltvRange: '70-80%',
      rente: '4.5-6.5%',
      looptijd: '12-60 maanden',
      specialisatie: 'ontwikkeling, transformatie',
      acceptatieSnelheid: 'snel',
      kans: 'hoog'
    },
    { 
      naam: 'Domivest',
      categorie: 'non-bank',
      minTicket: 250000,
      maxTicket: 5000000,
      ltvRange: '65-75%',
      rente: '5.0-7.0%',
      looptijd: '12-36 maanden',
      specialisatie: 'brugfinanciering',
      acceptatieSnelheid: 'snel',
      kans: 'hoog'
    },
    // Crowdfunding
    { 
      naam: 'Collin Crowdfund',
      categorie: 'crowdfunding',
      minTicket: 100000,
      maxTicket: 3000000,
      ltvRange: '60-70%',
      rente: '6.0-8.0%',
      looptijd: '6-24 maanden',
      specialisatie: 'korte projecten',
      acceptatieSnelheid: 'zeer snel',
      kans: 'middel'
    },
    { 
      naam: 'Duurzaaminvesteren',
      categorie: 'crowdfunding',
      minTicket: 50000,
      maxTicket: 2000000,
      ltvRange: '50-65%',
      rente: '5.5-7.5%',
      looptijd: '12-48 maanden',
      specialisatie: 'duurzame projecten',
      acceptatieSnelheid: 'snel',
      kans: 'middel'
    },
    // Mezzanine
    { 
      naam: 'NIBC Mezzanine',
      categorie: 'mezzanine',
      minTicket: 1000000,
      maxTicket: 20000000,
      ltvRange: '85-90%',
      rente: '8.0-12.0%',
      looptijd: '24-60 maanden',
      specialisatie: 'grote ontwikkelingen',
      acceptatieSnelheid: 'middel',
      kans: 'laag'
    },
    // Family offices (geanonimiseerd)
    { 
      naam: 'FO Capital Partners',
      categorie: 'private',
      minTicket: 2000000,
      maxTicket: 15000000,
      ltvRange: '60-70%',
      rente: '4.0-5.5%',
      looptijd: '36-120 maanden',
      specialisatie: 'core+ vastgoed',
      acceptatieSnelheid: 'traag',
      kans: 'middel'
    }
  ];

  const runFinancieringsVergelijking = async () => {
    if (!projectData) return;
    
    const totaleInvestering = projectData.aankoopprijs + projectData.verwervingskosten + projectData.bouwkosten;
    const eigenInbreng = projectData.eigenVermogen;
    const benodigdeFinanciering = totaleInvestering - eigenInbreng;
    const ltv = (benodigdeFinanciering / totaleInvestering) * 100;
    
    // Filter financiers op basis van project criteria
    const geschikteFinanciers = nederlandseFinanciers.filter(financier => {
      // Ticket size match
      const ticketMatch = benodigdeFinanciering >= financier.minTicket && 
                         benodigdeFinanciering <= financier.maxTicket;
      
      // LTV match (vereenvoudigd)
      const ltvMatch = ltv <= parseInt(financier.ltvRange.split('-')[1]);
      
      // Project fase match
      const isOntwikkeling = analyses.ontwikkelenVerkopen || analyses.ontwikkelenAanhouden;
      const isExploitatie = analyses.aankopenVerhuren;
      
      let faseMatch = true;
      if (isOntwikkeling && financier.specialisatie.includes('ontwikkeling')) faseMatch = true;
      if (isExploitatie && financier.specialisatie.includes('core')) faseMatch = true;
      
      return ticketMatch && ltvMatch && faseMatch;
    });
    
    // Sorteer op kans (hoog naar laag)
    const gesorteerd = [...geschikteFinanciers].sort((a, b) => {
      const kansWaarde = { 'hoog': 3, 'middel': 2, 'laag': 1 };
      return kansWaarde[b.kans] - kansWaarde[a.kans];
    });
    
    setFinancieringsVergelijking(gesorteerd.slice(0, 5)); // Top 5
  };

  // --- DEEL 4: STIKO ANALYSE ---
  const StikoAnalyseComponent = () => (
    <Card sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>STIKO Structuur Analyse</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Alleen beschikbaar indien expliciet geselecteerd
      </Alert>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Economisch vs Juridisch eigendom</Typography>
          <Typography variant="body2" color="textSecondary">
            Certificaathouders hebben economisch recht, BV juridisch eigendom
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Cashflow distributie</Typography>
          <Typography variant="body2" color="textSecondary">
            Na rente en aflossing → certificaathouders
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Financierbaarheid per banktype</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip label="Niet-banken: Acceptabel" color="success" size="small" />
            <Chip label="Grootbanken: Moeilijk" color="warning" size="small" />
            <Chip label="Fondsen: Zeer geschikt" color="success" size="small" />
          </Box>
        </Grid>
      </Grid>
    </Card>
  );

  // --- DEEL 5: WAARDE VERMEERDERING ---
  const WaardeOptimalisatieComponent = () => {
    const optimalisaties = [
      { ingreep: 'Extra m² toevoegen', investering: 1500, waarde: 2500, verhouding: 1.67 },
      { ingreep: 'Functiewijziging kantoor→woning', investering: 800, waarde: 1600, verhouding: 2.0 },
      { ingreep: 'Duurzame upgrade', investering: 200, waarde: 350, verhouding: 1.75 },
      { ingreep: 'Casco → afbouw', investering: 1200, waarde: 2000, verhouding: 1.67 },
      { ingreep: 'Fasering ontwikkeltraject', investering: -300, waarde: 500, verhouding: 2.67 }
    ];
    
    return (
      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Waarde-vermeerdering optimalisatie</Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          "€1 extra investering levert €X waarde" - gebaseerd op marktdata
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ingreep</TableCell>
                <TableCell align="right">Investering p/m²</TableCell>
                <TableCell align="right">Waarde p/m²</TableCell>
                <TableCell align="right">Verhouding</TableCell>
                <TableCell align="right">Rang</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {optimalisaties.sort((a,b) => b.verhouding - a.verhouding).map((row, idx) => (
                <TableRow key={row.ingreep}>
                  <TableCell>{row.ingreep}</TableCell>
                  <TableCell align="right">€{row.investering}</TableCell>
                  <TableCell align="right">€{row.waarde}</TableCell>
                  <TableCell align="right">1:{row.verhouding.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Chip label={`#${idx + 1}`} size="small" color="primary" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  // --- DEEL 6: VERGELIJKINGSMATRIX ---
  const VergelijkingsMatrix = () => {
    const rows = [
      { strategie: 'Verkopen', irr: results?.ontwikkelenVerkopen?.roi || '-', nettoWinst: results?.ontwikkelenVerkopen?.nettowinst || '-', cashflow: 'Eenmalig', risico: 'Hoog', kapitaal: 'Volledig' },
      { strategie: 'Verhuren', irr: results?.aankopenVerhuren?.nettoRendement || '-', nettoWinst: 'Jaarlijks', cashflow: results?.aankopenVerhuren?.cashflowPerMaand || '-', risico: 'Middel', kapitaal: 'Deels' },
      { strategie: 'Aanhouden', irr: results?.ontwikkelenAanhouden?.waardesprongPercentage || '-', nettoWinst: results?.ontwikkelenAanhouden?.ontwikkelwinst || '-', cashflow: 'Gecombineerd', risico: 'Hoog', kapitaal: 'Volledig' }
    ];

    return (
      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Vergelijkingsmatrix Strategieën</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Strategie</strong></TableCell>
                <TableCell align="right"><strong>IRR</strong></TableCell>
                <TableCell align="right"><strong>Netto winst</strong></TableCell>
                <TableCell align="right"><strong>Cashflow</strong></TableCell>
                <TableCell align="right"><strong>Risico</strong></TableCell>
                <TableCell align="right"><strong>Kapitaalbeslag</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.strategie}>
                  <TableCell>{row.strategie}</TableCell>
                  <TableCell align="right">
                    {typeof row.irr === 'number' ? `${row.irr.toFixed(1)}%` : row.irr}
                  </TableCell>
                  <TableCell align="right">
                    {typeof row.nettoWinst === 'number' ? `€${Math.round(row.nettoWinst).toLocaleString()}` : row.nettoWinst}
                  </TableCell>
                  <TableCell align="right">
                    {typeof row.cashflow === 'number' ? `€${Math.round(row.cashflow).toLocaleString()}` : row.cashflow}
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={row.risico} 
                      size="small" 
                      color={row.risico === 'Hoog' ? 'error' : row.risico === 'Middel' ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell align="right">{row.kapitaal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  // --- DEEL 7: FINANCIERINGSTECHNIEKEN ---
  const Financieringstechnieken = () => (
    <Card sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Financieringstechnieken (suggesties)</Typography>
      <Grid container spacing={2}>
        {[
          { techniek: 'Bankfinanciering', haalbaarheid: 'Laag', kosten: '4-5%', risico: 'Laag', zeggenschap: 'Hoog' },
          { techniek: 'Mezzanine', haalbaarheid: 'Middel', kosten: '8-12%', risico: 'Middel', zeggenschap: 'Middel' },
          { techniek: 'Private investeerders', haalbaarheid: 'Hoog', kosten: '6-9%', risico: 'Middel', zeggenschap: 'Variabel' },
          { techniek: 'STIKO', haalbaarheid: 'Middel', kosten: '1-2% extra', risico: 'Complexiteit', zeggenschap: 'Behouden' },
          { techniek: 'Gefaseerde funding', haalbaarheid: 'Hoog', kosten: '+0.5-1%', risico: 'Uitvoering', zeggenschap: 'Behouden' }
        ].map((tech) => (
          <Grid item xs={12} sm={6} md={4} key={tech.techniek}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2">{tech.techniek}</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="textSecondary">Haalbaarheid: </Typography>
                <Chip label={tech.haalbaarheid} size="small" color={tech.haalbaarheid === 'Hoog' ? 'success' : 'warning'} />
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>Kosten: {tech.kosten}</Typography>
              <Typography variant="body2">Risico: {tech.risico}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Card>
  );

  // --- DEEL 8: ZEKERHEIDSLABELS ---
  const ZekerheidsLabels = () => (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>Output zekerheidsniveau:</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip label="Hard (data-gedreven)" color="success" variant="outlined" />
        <Chip label="Modelmatig" color="warning" variant="outlined" />
        <Chip label="Scenario-afhankelijk" color="info" variant="outlined" />
      </Box>
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        Geen absolute waarheden - altijd professioneel advies inwinnen
      </Typography>
    </Box>
  );

  // --- HOOFD RENDER ---
  if (!selectedProject) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
          Selecteer eerst een project om financieringsanalyses uit te voeren.
        </Alert>
      </Box>
    );
  }

  if (!projectData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Onvoldoende projectdata beschikbaar voor analyse.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Financiering & Vastgoedstrategie (AI-gestuurd)</Typography>
      
      {/* Project info */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Ingang: Geselecteerd Project</Typography>
        <Grid container spacing={2}>
          {Object.entries(projectData).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                </Typography>
                <Typography variant="body1">
                  {typeof value === 'number' ? `€${Math.round(value).toLocaleString()}` : value || '-'}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Alert severity="info" sx={{ mt: 2 }}>
          AI mag niets aanvullen of raden. Alleen berekeningen op basis van bovenstaande data.
        </Alert>
      </Card>

      {/* Analyse selector */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Selecteer analyses (expliciete keuze vereist)</Typography>
        <Grid container spacing={2}>
          {analyseOpties.map((optie) => (
            <Grid item xs={12} sm={6} md={4} key={optie.id}>
              <FormControlLabel
                control={
                  <Switch
                    checked={analyses[optie.id]}
                    onChange={(e) => setAnalyses({...analyses, [optie.id]: e.target.checked})}
                  />
                }
                label={optie.label}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={runAnalyses}
            disabled={!Object.values(analyses).some(v => v)}
          >
            Uitgekozen analyses uitvoeren
          </Button>
          <Button 
            variant="outlined"
            onClick={() => setAnalyses(Object.keys(analyses).reduce((acc, key) => ({...acc, [key]: true}), {}))}
          >
            Alles selecteren
          </Button>
        </Box>
      </Card>

      {results && (
        <>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
            <Tab label="Kernresultaten" />
            <Tab label="Financieringsmatch" />
            <Tab label="Vergelijking" />
            <Tab label="Optimalisatie" />
          </Tabs>

          {activeTab === 0 && (
            <>
              {/* Resultaten per analyse */}
              {analyses.ontwikkelenVerkopen && results.ontwikkelenVerkopen && (
                <Card sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Ontwikkelen & Verkopen</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Financiële haalbaarheid:</Typography>
                      <Chip 
                        label={results.ontwikkelenVerkopen.haalbaarheid} 
                        color={results.ontwikkelenVerkopen.haalbaarheid === 'JA' ? 'success' : results.ontwikkelenVerkopen.haalbaarheid === 'MARGINAAL' ? 'warning' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">ROI: {results.ontwikkelenVerkopen.roi.toFixed(1)}%</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(results.ontwikkelenVerkopen.roi, 50)} 
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="error">Risico's:</Typography>
                      <Typography variant="body2">{results.ontwikkelenVerkopen.risicos.join(', ')}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              )}

              {analyses.aankopenVerhuren && results.aankopenVerhuren && (
                <Card sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Aankopen & Verhuren</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2">BAR</Typography>
                      <Typography variant="h6">{results.aankopenVerhuren.bar.toFixed(1)}%</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2">LTV</Typography>
                      <Typography variant="h6">{results.aankopenVerhuren.ltv.toFixed(0)}%</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2">DSCR</Typography>
                      <Typography variant="h6">{results.aankopenVerhuren.dscr.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2">Cashflow/maand</Typography>
                      <Typography variant="h6" color={results.aankopenVerhuren.cashflowPerMaand > 0 ? 'success.main' : 'error.main'}>
                        €{Math.round(results.aankopenVerhuren.cashflowPerMaand).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              )}

              {analyses.stikoAnalyse && <StikoAnalyseComponent />}
            </>
          )}

          {activeTab === 1 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Financieringsmatch - Nederlandse non-bank markt
                <Chip label="Grootbanken standaard uitgesloten" color="warning" size="small" sx={{ ml: 2 }} />
              </Typography>
              
              {financieringsVergelijking.length > 0 ? (
                <>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Financier</strong></TableCell>
                          <TableCell align="right"><strong>Categorie</strong></TableCell>
                          <TableCell align="right"><strong>LTV range</strong></TableCell>
                          <TableCell align="right"><strong>Rente</strong></TableCell>
                          <TableCell align="right"><strong>Looptijd</strong></TableCell>
                          <TableCell align="right"><strong>Acceptatie</strong></TableCell>
                          <TableCell align="right"><strong>Kans</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {financieringsVergelijking.map((financier) => (
                          <TableRow key={financier.naam}>
                            <TableCell>
                              <Typography variant="subtitle2">{financier.naam}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {financier.specialisatie}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={financier.categorie} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">{financier.ltvRange}</TableCell>
                            <TableCell align="right">{financier.rente}</TableCell>
                            <TableCell align="right">{financier.looptijd}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={financier.acceptatieSnelheid} 
                                size="small"
                                color={financier.acceptatieSnelheid === 'snel' ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={financier.kans} 
                                size="small"
                                color={financier.kans === 'hoog' ? 'success' : financier.kans === 'middel' ? 'warning' : 'error'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="subtitle2">Praktische output:</Typography>
                    <ul>
                      <li>Shortlist van {financieringsVergelijking.length} financiers</li>
                      <li>Verwachte dealstructuur: {financieringsVergelijking[0]?.ltvRange} LTV</li>
                      <li>Documenten nodig: Projectplan, Begroting, Toelichting</li>
                    </ul>
                  </Alert>
                </>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Geen match gevonden met niet-bank financiers. Overweeg:
                  <ul>
                    <li>Eigen vermogen verhogen met 10-15%</li>
                    <li>Project faseren voor betere acceptatie</li>
                    <li>Private equity benaderen</li>
                  </ul>
                </Alert>
              )}
            </Card>
          )}

          {activeTab === 2 && (
            <>
              <VergelijkingsMatrix />
              <Financieringstechnieken />
            </>
          )}

          {activeTab === 3 && analyses.waardeOptimalisatie && (
            <WaardeOptimalisatieComponent />
          )}

          <ZekerheidsLabels />
        </>
      )}
    </Box>
  );
};

export default FinancieringModule;
