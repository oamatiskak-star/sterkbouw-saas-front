// pages/financiering/index.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Tag,
  Alert,
  Table,
  Switch,
  Button,
  Progress,
  Tabs,
  Form,
  List,
  Space,
  Modal,
  Input,
  Select,
  Spin
} from 'antd';
import {
  CalculatorOutlined,
  BankOutlined,
  LineChartOutlined,
  StarOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  SettingOutlined,
  SyncOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const FinancieringModule = () => {
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
  const [activeTab, setActiveTab] = useState('0');
  const [loading, setLoading] = useState(false);
  
  // Demo project data
  const selectedProject = {
    id: 1,
    name: 'Demo Project',
    purchasePrice: 500000,
    acquisitionCosts: 25000,
    constructionCosts: 300000,
    duration: 12,
    expectedRent: 2000,
    expectedSaleValue: 900000,
    equity: 200000,
    existingFinancing: null
  };

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

  const analyseOpties = [
    { id: 'ontwikkelenVerkopen', label: 'Ontwikkelen & Verkopen' },
    { id: 'aankopenVerhuren', label: 'Aankopen & Verhuren' },
    { id: 'ontwikkelenAanhouden', label: 'Ontwikkelen & Aanhouden' },
    { id: 'herfinanciering', label: 'Herfinanciering / Optimalisatie' },
    { id: 'stikoAnalyse', label: 'STIKO-structuur analyse' },
    { id: 'scenarioAnalyse', label: 'Scenario-analyse / Gevoeligheden' },
    { id: 'waardeOptimalisatie', label: 'Waarde-vermeerdering optimalisatie' }
  ];

  const runAnalyses = async () => {
    if (!projectData) return;
    setLoading(true);
    
    const calculatedResults = {};
    
    // A. Ontwikkelen & Verkopen
    if (analyses.ontwikkelenVerkopen) {
      const totaleInvestering = projectData.aankoopprijs + projectData.verwervingskosten + projectData.bouwkosten;
      const brutowinst = projectData.verkoopwaarde - totaleInvestering;
      const nettowinst = brutowinst * 0.79;
      
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
        nettoRendement: bar * 0.75,
        dscr: jaarlijkseHuur / (totaleInvestering * 0.07),
        ltv: (totaleInvestering - projectData.eigenVermogen) / totaleInvestering * 100,
        cashflowPerMaand: jaarlijkseHuur/12 - (totaleInvestering * 0.005),
        houdbaarheidRente: `Max +${(bar - 2).toFixed(1)}%`,
        gevoeligheidLeegstand: `Rendement daalt ${(bar * 0.1).toFixed(1)}% bij 10% leegstand`
      };
    }

    // C. Ontwikkelen & Aanhouden
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
    setLoading(false);
  };

  const runFinancieringsVergelijking = async () => {
    if (!projectData) return;
    
    const totaleInvestering = projectData.aankoopprijs + projectData.verwervingskosten + projectData.bouwkosten;
    const eigenInbreng = projectData.eigenVermogen;
    const benodigdeFinanciering = totaleInvestering - eigenInbreng;
    
    const nederlandseFinanciers = [
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
      }
    ];
    
    const ltv = (benodigdeFinanciering / totaleInvestering) * 100;
    
    const geschikteFinanciers = nederlandseFinanciers.filter(financier => {
      const ticketMatch = benodigdeFinanciering >= financier.minTicket && 
                         benodigdeFinanciering <= financier.maxTicket;
      const ltvMatch = ltv <= parseInt(financier.ltvRange.split('-')[1]);
      return ticketMatch && ltvMatch;
    });
    
    const gesorteerd = [...geschikteFinanciers].sort((a, b) => {
      const kansWaarde = { 'hoog': 3, 'middel': 2, 'laag': 1 };
      return kansWaarde[b.kans] - kansWaarde[a.kans];
    });
    
    setFinancieringsVergelijking(gesorteerd.slice(0, 5));
  };

  const StikoAnalyseComponent = () => (
    <Card style={{ marginTop: 16 }}>
      <Title level={5}><SettingOutlined /> STIKO Structuur Analyse</Title>
      <Alert 
        message="Alleen beschikbaar indien expliciet geselecteerd" 
        type="info" 
        showIcon 
        style={{ marginBottom: 16 }}
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Text strong>Economisch vs Juridisch eigendom</Text>
          <br />
          <Text type="secondary">Certificaathouders hebben economisch recht, BV juridisch eigendom</Text>
        </Col>
        <Col xs={24} md={12}>
          <Text strong>Cashflow distributie</Text>
          <br />
          <Text type="secondary">Na rente en aflossing → certificaathouders</Text>
        </Col>
        <Col xs={24}>
          <Divider />
          <Text strong>Financierbaarheid per banktype</Text>
          <Space style={{ marginTop: 8 }}>
            <Tag color="green">Niet-banken: Acceptabel</Tag>
            <Tag color="orange">Grootbanken: Moeilijk</Tag>
            <Tag color="green">Fondsen: Zeer geschikt</Tag>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const WaardeOptimalisatieComponent = () => {
    const optimalisaties = [
      { ingreep: 'Extra m² toevoegen', investering: 1500, waarde: 2500, verhouding: 1.67 },
      { ingreep: 'Functiewijziging kantoor→woning', investering: 800, waarde: 1600, verhouding: 2.0 },
      { ingreep: 'Duurzame upgrade', investering: 200, waarde: 350, verhouding: 1.75 },
      { ingreep: 'Casco → afbouw', investering: 1200, waarde: 2000, verhouding: 1.67 },
      { ingreep: 'Fasering ontwikkeltraject', investering: -300, waarde: 500, verhouding: 2.67 }
    ];
    
    const columns = [
      {
        title: 'Ingreep',
        dataIndex: 'ingreep',
        key: 'ingreep',
      },
      {
        title: 'Investering p/m²',
        dataIndex: 'investering',
        key: 'investering',
        render: (value) => `€${value.toLocaleString()}`,
        align: 'right',
      },
      {
        title: 'Waarde p/m²',
        dataIndex: 'waarde',
        key: 'waarde',
        render: (value) => `€${value.toLocaleString()}`,
        align: 'right',
      },
      {
        title: 'Verhouding',
        dataIndex: 'verhouding',
        key: 'verhouding',
        render: (value) => `1:${value.toFixed(2)}`,
        align: 'right',
      },
      {
        title: 'Rang',
        key: 'rang',
        render: (_, record, index) => (
          <Tag color="blue">#{index + 1}</Tag>
        ),
        align: 'right',
      },
    ];

    return (
      <Card style={{ marginTop: 16 }}>
        <Title level={5}><LineChartOutlined /> Waarde-vermeerdering optimalisatie</Title>
        <Paragraph type="secondary">
          "€1 extra investering levert €X waarde" - gebaseerd op marktdata
        </Paragraph>
        <Table 
          columns={columns}
          dataSource={optimalisaties.sort((a,b) => b.verhouding - a.verhouding)}
          size="small"
          rowKey="ingreep"
          pagination={false}
        />
      </Card>
    );
  };

  const VergelijkingsMatrix = () => {
    const dataSource = [
      { 
        key: '1',
        strategie: 'Verkopen', 
        irr: results?.ontwikkelenVerkopen?.roi || '-', 
        nettoWinst: results?.ontwikkelenVerkopen?.nettowinst || '-', 
        cashflow: 'Eenmalig', 
        risico: 'Hoog', 
        kapitaal: 'Volledig' 
      },
      { 
        key: '2',
        strategie: 'Verhuren', 
        irr: results?.aankopenVerhuren?.nettoRendement || '-', 
        nettoWinst: 'Jaarlijks', 
        cashflow: results?.aankopenVerhuren?.cashflowPerMaand || '-', 
        risico: 'Middel', 
        kapitaal: 'Deels' 
      },
      { 
        key: '3',
        strategie: 'Aanhouden', 
        irr: results?.ontwikkelenAanhouden?.waardesprongPercentage || '-', 
        nettoWinst: results?.ontwikkelenAanhouden?.ontwikkelwinst || '-', 
        cashflow: 'Gecombineerd', 
        risico: 'Hoog', 
        kapitaal: 'Volledig' 
      }
    ];

    const columns = [
      {
        title: 'Strategie',
        dataIndex: 'strategie',
        key: 'strategie',
      },
      {
        title: 'IRR',
        dataIndex: 'irr',
        key: 'irr',
        render: (value) => typeof value === 'number' ? `${value.toFixed(1)}%` : value,
        align: 'right',
      },
      {
        title: 'Netto winst',
        dataIndex: 'nettoWinst',
        key: 'nettoWinst',
        render: (value) => typeof value === 'number' ? `€${Math.round(value).toLocaleString()}` : value,
        align: 'right',
      },
      {
        title: 'Cashflow',
        dataIndex: 'cashflow',
        key: 'cashflow',
        render: (value) => typeof value === 'number' ? `€${Math.round(value).toLocaleString()}` : value,
        align: 'right',
      },
      {
        title: 'Risico',
        dataIndex: 'risico',
        key: 'risico',
        render: (value) => (
          <Tag 
            color={value === 'Hoog' ? 'red' : value === 'Middel' ? 'orange' : 'green'}
          >
            {value}
          </Tag>
        ),
        align: 'right',
      },
      {
        title: 'Kapitaalbeslag',
        dataIndex: 'kapitaal',
        key: 'kapitaal',
        align: 'right',
      },
    ];

    return (
      <Card style={{ marginTop: 16 }}>
        <Title level={5}>Vergelijkingsmatrix Strategieën</Title>
        <Table 
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />
      </Card>
    );
  };

  const Financieringstechnieken = () => (
    <Card style={{ marginTop: 16 }}>
      <Title level={5}>Financieringstechnieken (suggesties)</Title>
      <Row gutter={[16, 16]}>
        {[
          { techniek: 'Bankfinanciering', haalbaarheid: 'Laag', kosten: '4-5%', risico: 'Laag', zeggenschap: 'Hoog' },
          { techniek: 'Mezzanine', haalbaarheid: 'Middel', kosten: '8-12%', risico: 'Middel', zeggenschap: 'Middel' },
          { techniek: 'Private investeerders', haalbaarheid: 'Hoog', kosten: '6-9%', risico: 'Middel', zeggenschap: 'Variabel' },
          { techniek: 'STIKO', haalbaarheid: 'Middel', kosten: '1-2% extra', risico: 'Complexiteit', zeggenschap: 'Behouden' },
          { techniek: 'Gefaseerde funding', haalbaarheid: 'Hoog', kosten: '+0.5-1%', risico: 'Uitvoering', zeggenschap: 'Behouden' }
        ].map((tech, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card size="small">
              <Text strong>{tech.techniek}</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Haalbaarheid: </Text>
                <Tag color={tech.haalbaarheid === 'Hoog' ? 'green' : 'orange'}>{tech.haalbaarheid}</Tag>
              </div>
              <Text style={{ display: 'block', marginTop: 8 }}>Kosten: {tech.kosten}</Text>
              <Text style={{ display: 'block' }}>Risico: {tech.risico}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );

  if (!selectedProject) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Alert 
          message="Selecteer eerst een project" 
          description="Selecteer eerst een project om financieringsanalyses uit te voeren."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (!projectData) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Alert 
          message="Onvoldoende projectdata" 
          description="Onvoldoende projectdata beschikbaar voor analyse."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 16 }}>
        <BankOutlined /> Financiering & Vastgoedstrategie (AI-gestuurd)
      </Title>
      
      {/* Project info */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Ingang: Geselecteerd Project</Title>
        <Row gutter={[16, 16]}>
          {Object.entries(projectData).map(([key, value]) => (
            <Col xs={24} sm={12} md={8} lg={6} key={key}>
              <Card size="small">
                <Text type="secondary" style={{ display: 'block' }}>
                  {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                </Text>
                <Text strong style={{ fontSize: '16px' }}>
                  {typeof value === 'number' ? `€${Math.round(value).toLocaleString()}` : value || '-'}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
        <Alert 
          message="AI mag niets aanvullen of raden" 
          description="Alleen berekeningen op basis van bovenstaande data."
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* Analyse selector */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Selecteer analyses (expliciete keuze vereist)</Title>
        <Row gutter={[16, 16]}>
          {analyseOpties.map((optie) => (
            <Col xs={24} sm={12} md={8} key={optie.id}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  checked={analyses[optie.id]}
                  onChange={(checked) => setAnalyses({...analyses, [optie.id]: checked})}
                  style={{ marginRight: 8 }}
                />
                <Text>{optie.label}</Text>
              </div>
            </Col>
          ))}
        </Row>
        <Space style={{ marginTop: 16 }}>
          <Button 
            type="primary" 
            onClick={runAnalyses}
            disabled={!Object.values(analyses).some(v => v) || loading}
            loading={loading}
            icon={<CalculatorOutlined />}
          >
            Uitgekozen analyses uitvoeren
          </Button>
          <Button 
            onClick={() => setAnalyses(Object.keys(analyses).reduce((acc, key) => ({...acc, [key]: true}), {}))}
            icon={<CheckCircleOutlined />}
          >
            Alles selecteren
          </Button>
        </Space>
      </Card>

      {results && (
        <>
          <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }}>
            <TabPane tab="Kernresultaten" key="0" />
            <TabPane tab="Financieringsmatch" key="1" />
            <TabPane tab="Vergelijking" key="2" />
            <TabPane tab="Optimalisatie" key="3" />
          </Tabs>

          {activeTab === '0' && (
            <>
              {analyses.ontwikkelenVerkopen && results.ontwikkelenVerkopen && (
                <Card style={{ marginBottom: 16 }}>
                  <Title level={5}>Ontwikkelen & Verkopen</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Text strong>Financiële haalbaarheid:</Text>
                      <br />
                      <Tag 
                        color={results.ontwikkelenVerkopen.haalbaarheid === 'JA' ? 'green' : 
                               results.ontwikkelenVerkopen.haalbaarheid === 'MARGINAAL' ? 'orange' : 'red'}
                        style={{ marginTop: 8 }}
                      >
                        {results.ontwikkelenVerkopen.haalbaarheid}
                      </Tag>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text strong>ROI: {results.ontwikkelenVerkopen.roi.toFixed(1)}%</Text>
                      <br />
                      <Progress 
                        percent={Math.min(results.ontwikkelenVerkopen.roi, 50)} 
                        style={{ marginTop: 8 }}
                      />
                    </Col>
                    <Col xs={24}>
                      <Text strong type="danger">Risico's:</Text>
                      <br />
                      <Text>{results.ontwikkelenVerkopen.risicos.join(', ')}</Text>
                    </Col>
                  </Row>
                </Card>
              )}

              {analyses.aankopenVerhuren && results.aankopenVerhuren && (
                <Card style={{ marginBottom: 16 }}>
                  <Title level={5}>Aankopen & Verhuren</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={12} md={6}>
                      <Text strong>BAR</Text>
                      <br />
                      <Title level={3} style={{ margin: 0 }}>
                        {results.aankopenVerhuren.bar.toFixed(1)}%
                      </Title>
                    </Col>
                    <Col xs={12} md={6}>
                      <Text strong>LTV</Text>
                      <br />
                      <Title level={3} style={{ margin: 0 }}>
                        {results.aankopenVerhuren.ltv.toFixed(0)}%
                      </Title>
                    </Col>
                    <Col xs={12} md={6}>
                      <Text strong>DSCR</Text>
                      <br />
                      <Title level={3} style={{ margin: 0 }}>
                        {results.aankopenVerhuren.dscr.toFixed(2)}
                      </Title>
                    </Col>
                    <Col xs={12} md={6}>
                      <Text strong>Cashflow/maand</Text>
                      <br />
                      <Title level={3} style={{ 
                        margin: 0,
                        color: results.aankopenVerhuren.cashflowPerMaand > 0 ? '#52c41a' : '#f5222d'
                      }}>
                        €{Math.round(results.aankopenVerhuren.cashflowPerMaand).toLocaleString()}
                      </Title>
                    </Col>
                  </Row>
                </Card>
              )}

              {analyses.stikoAnalyse && <StikoAnalyseComponent />}
            </>
          )}

          {activeTab === '1' && (
            <Card>
              <Title level={4}>
                Financieringsmatch - Nederlandse non-bank markt
                <Tag color="orange" style={{ marginLeft: 8 }}>Grootbanken standaard uitgesloten</Tag>
              </Title>
              
              {financieringsVergelijking.length > 0 ? (
                <>
                  <Table 
                    dataSource={financieringsVergelijking}
                    columns={[
                      {
                        title: 'Financier',
                        dataIndex: 'naam',
                        key: 'naam',
                        render: (text, record) => (
                          <div>
                            <Text strong>{text}</Text>
                            <br />
                            <Text type="secondary">{record.specialisatie}</Text>
                          </div>
                        ),
                      },
                      {
                        title: 'Categorie',
                        dataIndex: 'categorie',
                        key: 'categorie',
                        render: (text) => <Tag>{text}</Tag>,
                        align: 'center',
                      },
                      {
                        title: 'LTV range',
                        dataIndex: 'ltvRange',
                        key: 'ltvRange',
                        align: 'center',
                      },
                      {
                        title: 'Rente',
                        dataIndex: 'rente',
                        key: 'rente',
                        align: 'center',
                      },
                      {
                        title: 'Looptijd',
                        dataIndex: 'looptijd',
                        key: 'looptijd',
                        align: 'center',
                      },
                      {
                        title: 'Acceptatie',
                        dataIndex: 'acceptatieSnelheid',
                        key: 'acceptatieSnelheid',
                        render: (text) => (
                          <Tag color={text === 'snel' ? 'green' : 'default'}>{text}</Tag>
                        ),
                        align: 'center',
                      },
                      {
                        title: 'Kans',
                        dataIndex: 'kans',
                        key: 'kans',
                        render: (text) => (
                          <Tag 
                            color={text === 'hoog' ? 'green' : text === 'middel' ? 'orange' : 'red'}
                          >
                            {text}
                          </Tag>
                        ),
                        align: 'center',
                      },
                    ]}
                    rowKey="naam"
                    style={{ marginTop: 16 }}
                  />
                  
                  <Alert 
                    type="info"
                    message="Praktische output:"
                    description={
                      <div>
                        <ul>
                          <li>Shortlist van {financieringsVergelijking.length} financiers</li>
                          <li>Verwachte dealstructuur: {financieringsVergelijking[0]?.ltvRange} LTV</li>
                          <li>Documenten nodig: Projectplan, Begroting, Toelichting</li>
                        </ul>
                      </div>
                    }
                    style={{ marginTop: 16 }}
                  />
                </>
              ) : (
                <Alert 
                  type="warning"
                  message="Geen match gevonden"
                  description={
                    <div>
                      Geen match gevonden met niet-bank financiers. Overweeg:
                      <ul>
                        <li>Eigen vermogen verhogen met 10-15%</li>
                        <li>Project faseren voor betere acceptatie</li>
                        <li>Private equity benaderen</li>
                      </ul>
                    </div>
                  }
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          )}

          {activeTab === '2' && (
            <>
              <VergelijkingsMatrix />
              <Financieringstechnieken />
            </>
          )}

          {activeTab === '3' && analyses.waardeOptimalisatie && (
            <WaardeOptimalisatieComponent />
          )}

          <div style={{ 
            marginTop: 24, 
            padding: 16, 
            backgroundColor: '#f6ffed', 
            borderRadius: 8,
            border: '1px solid #b7eb8f'
          }}>
            <Text strong>Output zekerheidsniveau:</Text>
            <Space style={{ marginTop: 8 }}>
              <Tag color="green">Hard (data-gedreven)</Tag>
              <Tag color="orange">Modelmatig</Tag>
              <Tag color="blue">Scenario-afhankelijk</Tag>
            </Space>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Geen absolute waarheden - altijd professioneel advies inwinnen
            </Text>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancieringModule;
