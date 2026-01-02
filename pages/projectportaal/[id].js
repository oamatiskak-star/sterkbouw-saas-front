// pages/projectportaal/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Space, 
  Tabs, 
  Spin, 
  Alert, 
  Badge,
  Tag,
  Progress,
  Divider,
  Statistic,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  HomeOutlined, 
  FileTextOutlined, 
  MessageOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
  SettingOutlined,
  TeamOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function ProjectPortaalPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('opdrachtgever'); // 'opdrachtgever' of 'developer'

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    
    // Simuleer API call
    setTimeout(() => {
      setProjectData({
        id: id,
        name: `Project Sterkbouw ${id}`,
        code: `PROJ-${id}`,
        status: 'actief',
        progress: 75,
        client: 'Opdrachtgever BV',
        developer: 'Sterkbouw Development',
        startDate: '2024-01-15',
        endDate: '2024-09-30',
        location: 'Amsterdam Zuid',
        budget: '€ 850.000',
        team: [
          { name: 'Jan Janssen', role: 'Projectleider' },
          { name: 'Marie van Dijk', role: 'Architect' },
          { name: 'Thomas de Vries', role: 'Bouwcoordinator' }
        ],
        overview: {
          tasksCompleted: 42,
          tasksTotal: 56,
          documents: 18,
          messages: 24,
          issues: 3
        },
        contract: {
          status: 'getekend',
          lastUpdate: '2024-02-15',
          documents: 5
        },
        drawings: {
          total: 12,
          approved: 8,
          pending: 4
        },
        delivery: {
          milestones: 8,
          completed: 5,
          next: 'Fundering'
        }
      });
      
      // Bepaal gebruikersrol
      const path = router.asPath;
      if (path.includes('opdrachtgever')) {
        setUserRole('opdrachtgever');
      } else if (path.includes('developer')) {
        setUserRole('developer');
      }
      
      setLoading(false);
    }, 800);
  }, [id, router.asPath]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleAskQuestion = () => {
    message.info('Vraag gesteld aan het team');
  };

  const handleUploadDocument = () => {
    message.success('Document geüpload');
  };

  const handleDownloadReport = () => {
    message.loading({ content: 'Rapport genereren...', key: 'report' });
    setTimeout(() => {
      message.success({ content: 'Rapport gedownload', key: 'report' });
    }, 1500);
  };

  const handleApproveDrawing = () => {
    message.success('Tekening goedgekeurd');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Spin size="large" tip="Projectportaal laden..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header met terugknop */}
      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row gutter={16} align="middle" justify="space-between">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBackToDashboard}
                type="text"
                size="large"
              >
                Terug naar dashboard
              </Button>
              <Divider type="vertical" />
              <Tag color={userRole === 'opdrachtgever' ? 'blue' : 'green'}>
                {userRole === 'opdrachtgever' ? 'Opdrachtgever' : 'Ontwikkelaar'}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleDownloadReport}>
                Exporteer
              </Button>
              <Button type="primary" icon={<UploadOutlined />} onClick={handleUploadDocument}>
                Upload
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Project header */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Row gutter={24}>
          <Col span={16}>
            <Space direction="vertical" size="small">
              <Title level={2} style={{ margin: 0 }}>
                {projectData?.name || `Project ${id}`}
                <Tag color="green" style={{ marginLeft: 12, fontSize: 14 }}>
                  {projectData?.status?.toUpperCase() || 'ACTIEF'}
                </Tag>
              </Title>
              <Text type="secondary" strong>
                Projectcode: {projectData?.code} • {projectData?.location}
              </Text>
              <Space size="middle" split={<Divider type="vertical" />}>
                <Text><CalendarOutlined /> Start: {dayjs(projectData?.startDate).format('DD-MM-YYYY')}</Text>
                <Text><CalendarOutlined /> Eind: {dayjs(projectData?.endDate).format('DD-MM-YYYY')}</Text>
                <Text><EnvironmentOutlined /> {projectData?.location}</Text>
                <Text><TeamOutlined /> {userRole === 'opdrachtgever' ? projectData?.developer : projectData?.client}</Text>
              </Space>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic title="Projectvoortgang" value={projectData?.progress || 0} suffix="%" />
              <Progress percent={projectData?.progress || 0} status="active" strokeWidth={10} />
              <Row gutter={8}>
                <Col span={12}>
                  <Statistic title="Taken" value={`${projectData?.overview?.tasksCompleted || 0}/${projectData?.overview?.tasksTotal || 0}`} />
                </Col>
                <Col span={12}>
                  <Statistic title="Documenten" value={projectData?.overview?.documents || 0} />
                </Col>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Hoofd content met tabs */}
      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 8 }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="large"
          style={{ padding: '0 24px' }}
          tabBarExtraContent={
            <Space style={{ marginRight: 8 }}>
              <Button 
                icon={<MessageOutlined />} 
                onClick={handleAskQuestion}
                title="Stel een vraag"
              >
                Vraag stellen
              </Button>
              {userRole === 'opdrachtgever' && (
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={handleApproveDrawing}
                >
                  Goedkeuren
                </Button>
              )}
            </Space>
          }
        >
          {/* Overzicht tab */}
          <TabPane 
            tab={<span><HomeOutlined /> Overzicht</span>} 
            key="overview"
          >
            <div style={{ padding: 24 }}>
              <Title level={3}>Project Overzicht</Title>
              <Paragraph>
                Welkom in het gedeelde projectportaal. Hier kunt u samenwerken aan het project, 
                documenten delen, voortgang volgen en communiceren.
              </Paragraph>
              
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={8}>
                  <Card 
                    title={<span><FileTextOutlined /> Contract & Documenten</span>}
                    extra={<Badge count={projectData?.contract?.documents || 0} />}
                  >
                    <Text>Contractstatus: <Tag color="green">{projectData?.contract?.status || 'Onbekend'}</Tag></Text>
                    <br />
                    <Text type="secondary">Laatste update: {dayjs(projectData?.contract?.lastUpdate).format('DD-MM-YYYY')}</Text>
                    <br />
                    <Button type="link" style={{ padding: 0, marginTop: 8 }}>
                      <EyeOutlined /> Bekijk documenten
                    </Button>
                  </Card>
                </Col>
                
                <Col span={8}>
                  <Card 
                    title={<span><FileTextOutlined /> Tekeningen & Ontwerpen</span>}
                    extra={<Badge count={projectData?.drawings?.pending || 0} />}
                  >
                    <Text>Goedgekeurd: {projectData?.drawings?.approved || 0}/{projectData?.drawings?.total || 0}</Text>
                    <br />
                    <Progress 
                      percent={Math.round(((projectData?.drawings?.approved || 0) / (projectData?.drawings?.total || 1)) * 100)} 
                      size="small" 
                    />
                    <br />
                    {userRole === 'opdrachtgever' ? (
                      <Button type="primary" size="small" style={{ marginTop: 8 }}>
                        <CheckCircleOutlined /> Keur tekeningen goed
                      </Button>
                    ) : (
                      <Button type="default" size="small" style={{ marginTop: 8 }}>
                        <UploadOutlined /> Upload nieuwe versie
                      </Button>
                    )}
                  </Card>
                </Col>
                
                <Col span={8}>
                  <Card 
                    title={<span><CheckCircleOutlined /> Oplevering</span>}
                  >
                    <Text>Volgende milestone: <strong>{projectData?.delivery?.next || 'Onbekend'}</strong></Text>
                    <br />
                    <Text>Voltooid: {projectData?.delivery?.completed || 0}/{projectData?.delivery?.milestones || 0}</Text>
                    <br />
                    <Progress 
                      percent={Math.round(((projectData?.delivery?.completed || 0) / (projectData?.delivery?.milestones || 1)) * 100)} 
                      size="small" 
                    />
                  </Card>
                </Col>
              </Row>
              
              {/* Team sectie */}
              <Card style={{ marginTop: 24 }} title="Projectteam">
                <Row gutter={[16, 16]}>
                  {projectData?.team?.map((member, index) => (
                    <Col span={8} key={index}>
                      <Card size="small">
                        <Text strong>{member.name}</Text>
                        <br />
                        <Text type="secondary">{member.role}</Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </div>
          </TabPane>
          
          {/* Documenten tab */}
          <TabPane 
            tab={
              <span>
                <FileTextOutlined /> Documenten
                <Badge count={projectData?.overview?.documents || 0} offset={[10, -5]} />
              </span>
            } 
            key="documents"
          >
            <div style={{ padding: 24 }}>
              <Title level={3}>Project Documenten</Title>
              <Alert 
                message="Gedeelde documentenruimte" 
                description={`Beide partijen hebben toegang tot deze documenten. ${userRole === 'opdrachtgever' ? 'U kunt documenten bekijken en goedkeuren.' : 'U kunt documenten uploaden en beheren.'}`}
                type="info" 
                showIcon 
                style={{ marginBottom: 16 }}
              />
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="Contractdocumenten">
                    <Space direction="vertical">
                      <Button icon={<EyeOutlined />} type="text" block style={{ textAlign: 'left' }}>
                        Hoofdcontract.pdf
                      </Button>
                      <Button icon={<EyeOutlined />} type="text" block style={{ textAlign: 'left' }}>
                        Bijlagen.zip
                      </Button>
                      <Button icon={<EyeOutlined />} type="text" block style={{ textAlign: 'left' }}>
                        Voorwaarden.docx
                      </Button>
                    </Space>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="Technische tekeningen">
                    <Space direction="vertical">
                      <Button icon={<EyeOutlined />} type="text" block style={{ textAlign: 'left' }}>
                        Architectuur.pdf
                      </Button>
                      <Button icon={<EyeOutlined />} type="text" block style={{ textAlign: 'left' }}>
                        Constructie.dwg
                      </Button>
                      <Button icon={<EyeOutlined />} type="text" block style={{ textAlign: 'left' }}>
                        Installaties.pdf
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          {/* Communicatie tab */}
          <TabPane 
            tab={
              <span>
                <MessageOutlined /> Communicatie
                <Badge count={projectData?.overview?.messages || 0} offset={[10, -5]} />
              </span>
            } 
            key="communication"
          >
            <div style={{ padding: 24 }}>
              <Title level={3}>Project Communicatie</Title>
              <Alert 
                message="Gedeelde berichten" 
                description="Alle communicatie over het project wordt hier bewaard voor transparantie."
                type="info" 
                showIcon 
                style={{ marginBottom: 16 }}
              />
              
              <Card>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card size="small" type="inner" title="Vandaag">
                    <Text><strong>Sterkbouw:</strong> De fundering is voltooid. Foto's zijn geüpload.</Text>
                    <Text type="secondary" style={{ display: 'block' }}>14:30 • {dayjs().format('DD-MM-YYYY')}</Text>
                  </Card>
                  
                  <Card size="small" type="inner" title="Gisteren">
                    <Text><strong>Opdrachtgever:</strong> Kunnen we de kleur van de gevel nog aanpassen?</Text>
                    <Text type="secondary" style={{ display: 'block' }}>11:15 • {dayjs().subtract(1, 'day').format('DD-MM-YYYY')}</Text>
                  </Card>
                  
                  <Card size="small" type="inner" title="Vorige week">
                    <Text><strong>Sterkbouw:</strong> Offerte voor extra werk is klaar voor goedkeuring.</Text>
                    <Text type="secondary" style={{ display: 'block' }}>{dayjs().subtract(5, 'day').format('DD-MM-YYYY')}</Text>
                  </Card>
                </Space>
              </Card>
            </div>
          </TabPane>
          
          {/* Rapportages tab */}
          <TabPane 
            tab={<span><BarChartOutlined /> Rapportages</span>} 
            key="reports"
          >
            <div style={{ padding: 24 }}>
              <Title level={3}>Project Rapportages</Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card title="Voortgangsrapport">
                    <Text>Wekelijks overzicht van voortgang</Text>
                    <br />
                    <Button type="primary" style={{ marginTop: 8 }}>
                      <DownloadOutlined /> Download
                    </Button>
                  </Card>
                </Col>
                
                <Col span={8}>
                  <Card title="Financieel overzicht">
                    <Text>Budget vs werkelijke kosten</Text>
                    <br />
                    <Button style={{ marginTop: 8 }}>
                      <EyeOutlined /> Bekijk
                    </Button>
                  </Card>
                </Col>
                
                <Col span={8}>
                  <Card title="Kwaliteitscontrole">
                    <Text>Inspectierapporten en kwaliteit</Text>
                    <br />
                    <Button style={{ marginTop: 8 }}>
                      <DownloadOutlined /> Download
                    </Button>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
          
          {/* Instellingen tab (alleen voor ontwikkelaar) */}
          {userRole === 'developer' && (
            <TabPane 
              tab={<span><SettingOutlined /> Beheer</span>} 
              key="admin"
            >
              <div style={{ padding: 24 }}>
                <Title level={3}>Project Beheer</Title>
                <Alert 
                  message="Beheerdersfuncties" 
                  description="Alleen beschikbaar voor Sterkbouw ontwikkelaars."
                  type="warning" 
                  showIcon 
                />
                
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Card title="Toegangsbeheer">
                      <Button block style={{ marginBottom: 8 }}>
                        <TeamOutlined /> Teamleden beheren
                      </Button>
                      <Button block>
                        <EyeOutlined /> Toegangsrechten instellen
                      </Button>
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card title="Projectinstellingen">
                      <Button block style={{ marginBottom: 8 }}>
                        <EditOutlined /> Projectgegevens bewerken
                      </Button>
                      <Button block type="primary">
                        <WarningOutlined /> Noodcommunicatie
                      </Button>
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>
          )}
        </Tabs>
      </Card>

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: 'center', padding: 16 }}>
        <Text type="secondary">
          Project Portaal v1.0 • {projectData?.code} • Laatste update: {dayjs().format('DD-MM-YYYY HH:mm')}
        </Text>
        <br />
        <Text type="secondary">
          {userRole === 'opdrachtgever' ? 'U bent ingelogd als opdrachtgever' : 'U bent ingelogd als ontwikkelaar'}
        </Text>
      </div>
    </AdminLayout>
  );
}
