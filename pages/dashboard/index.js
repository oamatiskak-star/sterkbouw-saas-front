// pages/dashboard/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Card, Row, Col, Button, Table, Tag, Progress, 
  Avatar, Statistic, Alert, Space, Divider, Badge,
  Dropdown, Menu, Timeline, Tooltip, Switch,
  Tabs, List, Typography, Modal, Input, Form,
  Select, DatePicker, InputNumber, Radio, Checkbox,
  Upload, message, Popconfirm, Spin, Empty, Result,
  Collapse, Descriptions, Rate, Slider, Tree, Transfer,
  Cascader, AutoComplete, Mentions, TimePicker, Calendar,
  Carousel, Image, BackTop, Anchor, Breadcrumb, Steps,
  PageHeader, Comment, Layout, Skeleton, Affix, Drawer
} from 'antd';
import {
  DashboardOutlined, ProjectOutlined, CalculatorOutlined,
  FileTextOutlined, DollarOutlined, AlertOutlined,
  BellOutlined, PlusOutlined, CheckCircleOutlined,
  WarningOutlined, ClockCircleOutlined, RiseOutlined,
  FallOutlined, TeamOutlined, SafetyOutlined,
  BarChartOutlined, EnvironmentOutlined, BankOutlined,
  SettingOutlined, PrinterOutlined, EyeOutlined,
  BuildOutlined, FileDoneOutlined, ApartmentOutlined,
  FolderOutlined, WalletOutlined, PercentageOutlined,
  ShoppingOutlined, SolutionOutlined, MailOutlined,
  ScheduleOutlined, ContainerOutlined, HomeOutlined,
  SearchOutlined, DownloadOutlined, UploadOutlined,
  EditOutlined, DeleteOutlined, CopyOutlined,
  ShareAltOutlined, StarOutlined, HeartOutlined,
  LikeOutlined, DislikeOutlined, MessageOutlined,
  CameraOutlined, VideoCameraOutlined, PhoneOutlined,
  MailFilled, AppstoreOutlined, DatabaseOutlined,
  CloudOutlined, LaptopOutlined, MobileOutlined,
  TabletOutlined, SoundOutlined, NotificationOutlined,
  CrownOutlined, TrophyOutlined, GiftOutlined,
  FireOutlined, ThunderboltOutlined, RocketOutlined
} from '@ant-design/icons';

const { Meta } = Card;
const { TabPane } = Tabs;
const { Paragraph, Title, Text } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;
const { Header, Footer, Sider, Content } = Layout;

export default function Dashboard() {
  const router = useRouter();
  const [kpiData, setKpiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickStats, setShowQuickStats] = useState(true);
  const [showRecentEvents, setShowRecentEvents] = useState(true);
  const [showModuleStatus, setShowModuleStatus] = useState(true);

  // Initial data
  useEffect(() => {
    setKpiData({
      // KPI data
      activeProjects: 12,
      ongoingCalculations: 8,
      openChangeOrders: 5,
      pendingApprovals: 3,
      financialExposure: 2800000,
      alerts: 2,
      blocks: 1,
      activeBuildSites: 4,
      completedProjects: 24,
      totalRevenue: 8450000,
      profitMargin: '18.5%',
      
      // Module status
      modules: [
        { key: 'dashboard', name: 'Dashboard', status: 'success', color: 'green' },
        { key: 'administratie', name: 'Administratie', status: 'success', color: 'green' },
        { key: 'bim', name: 'BIM', status: 'warning', color: 'orange' },
        { key: 'bouwplaats', name: 'Bouwplaats', status: 'success', color: 'green' },
        { key: 'calculatie', name: 'Calculatie', status: 'error', color: 'red' },
        { key: 'constructie', name: 'Constructie', status: 'success', color: 'green' },
        { key: 'documenten', name: 'Documenten', status: 'success', color: 'green' },
        { key: 'financien', name: 'Financiën', status: 'warning', color: 'orange' },
        { key: 'financieringen', name: 'Financieringen', status: 'success', color: 'green' },
        { key: 'inkoop', name: 'Inkoop', status: 'success', color: 'green' },
        { key: 'kopersportaal', name: 'Kopersportaal', status: 'success', color: 'green' },
        { key: 'mail', name: 'Mail', status: 'success', color: 'green' },
        { key: 'planning', name: 'Planning', status: 'warning', color: 'orange' },
        { key: 'projecten', name: 'Projecten', status: 'success', color: 'green' },
        { key: 'projectportaal', name: 'Projectportaal', status: 'success', color: 'green' },
      ],
      
      // Recent events
      recentEvents: [
        { id: 1, title: 'Calculatie goedgekeurd', project: 'Project Alpha', time: '10 min geleden', user: 'Executor', type: 'success' },
        { id: 2, title: 'Bouwplaats gestart', project: 'Project Beta', time: '1 uur geleden', user: 'Builder', type: 'info' },
        { id: 3, title: 'Meerwerk gesignaleerd', project: 'Project Gamma', time: '2 uur geleden', user: 'Builder', type: 'warning' },
        { id: 4, title: 'Financiering rond', project: 'Project Delta', time: '5 uur geleden', user: 'Executor', type: 'success' },
      ],
      
      // Quick actions
      quickActions: [
        { key: 'new-project', label: 'Nieuw Project', icon: <ProjectOutlined />, link: '/admin/projecten/nieuw' },
        { key: 'new-calculatie', label: 'Nieuwe Calculatie', icon: <CalculatorOutlined />, link: '/admin/calculatie/nieuw' },
        { key: 'open-bouwplaats', label: 'Open Bouwplaats', icon: <BuildOutlined />, link: '/admin/bouwplaats/open' },
        { key: 'upload-document', label: 'Document Uploaden', icon: <UploadOutlined />, link: '/admin/documenten/upload' },
        { key: 'nieuw-meerwerk', label: 'Nieuw Meerwerk', icon: <PlusOutlined />, link: '/admin/bouwplaats/meerwerk/nieuw' },
      ],
      
      // Projects data
      projects: [
        {
          key: '1',
          name: 'Waterfall - Implementation',
          manager: 'Easy Admin',
          status: 'active',
          priority: 'Regular',
          startDate: '08 Jul 2022',
          dueDate: '01 May 2024',
          progress: 75
        },
        {
          key: '2',
          name: 'Client Zone Development',
          manager: 'Easy Admin',
          status: 'active',
          priority: 'High',
          startDate: '15 Mar 2023',
          dueDate: '30 Dec 2023',
          progress: 45
        },
        {
          key: '3',
          name: 'Building a house',
          manager: 'Easy Admin',
          status: 'on-hold',
          priority: 'Medium',
          startDate: '01 Jan 2023',
          dueDate: '01 Jun 2024',
          progress: 30
        },
        {
          key: '4',
          name: 'Company Processes',
          manager: 'V Franzen Finance Director',
          status: 'completed',
          priority: 'Low',
          startDate: '10 Nov 2022',
          dueDate: '15 Sep 2023',
          progress: 100
        },
        {
          key: '5',
          name: 'GDPR Implementation',
          manager: 'Franz Finance Director',
          status: 'active',
          priority: 'High',
          startDate: '05 Feb 2023',
          dueDate: '05 Feb 2024',
          progress: 60
        }
      ],
      
      // Financial data
      financialData: [
        { month: 'Feb', amount: -120000 },
        { month: 'Mar', amount: -352000 },
        { month: 'Apr May', amount: -350000 },
        { month: 'Jun Jul', amount: -400000 },
        { month: 'Aug Sep', amount: -400000 },
        { month: 'Sep Oct', amount: -300000 },
        { month: 'Nov Dec', amount: -300000 },
        { month: 'Jan Feb', amount: -400000 },
        { month: 'Mar Apr', amount: -300000 }
      ]
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Dashboard laden..." />
      </div>
    );
  }

  // Tab content
  const tabItems = [
    {
      key: 'overview',
      label: 'Overzicht',
      icon: <DashboardOutlined />
    },
    {
      key: 'projects',
      label: 'Projecten',
      icon: <ProjectOutlined />
    },
    {
      key: 'finances',
      label: 'Financiën',
      icon: <DollarOutlined />
    },
    {
      key: 'reports',
      label: 'Rapporten',
      icon: <BarChartOutlined />
    },
    {
      key: 'alerts',
      label: (
        <span>
          Alerts
          <Badge count={kpiData.alerts} size="small" style={{ marginLeft: 8 }} />
        </span>
      ),
      icon: <AlertOutlined />
    }
  ];

  // KPI Cards - NU BOVENAAN
  const kpiCards = [
    {
      title: 'Actieve Projecten',
      value: kpiData.activeProjects,
      icon: <ProjectOutlined />,
      color: '#1890ff',
      trend: '+2 deze maand',
      link: '/admin/projecten'
    },
    {
      title: 'Lopende Calculaties',
      value: kpiData.ongoingCalculations,
      icon: <CalculatorOutlined />,
      color: '#52c41a',
      trend: '+1 deze week',
      link: '/admin/calculatie'
    },
    {
      title: 'Open Meerwerk',
      value: kpiData.openChangeOrders,
      icon: <FileTextOutlined />,
      color: '#faad14',
      trend: '3 vereist actie',
      link: '/admin/bouwplaats/meerwerk'
    },
    {
      title: 'Openstaande Akkoorden',
      value: kpiData.pendingApprovals,
      icon: <CheckCircleOutlined />,
      color: '#722ed1',
      trend: '2 hoog prioriteit',
      link: '/admin/administratie/contracten'
    },
    {
      title: 'Financiële Exposure',
      value: `€${(kpiData.financialExposure / 1000000).toFixed(1)}M`,
      icon: <DollarOutlined />,
      color: '#f5222d',
      trend: '-€0.2M deze maand',
      link: '/admin/financien'
    },
    {
      title: 'Actieve Bouwplaatsen',
      value: kpiData.activeBuildSites,
      icon: <BuildOutlined />,
      color: '#13c2c2',
      trend: 'Alle operationeel',
      link: '/admin/bouwplaats'
    }
  ];

  // Module Status cards
  const getModuleStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error': return <AlertOutlined style={{ color: '#f5222d' }} />;
      default: return <ClockCircleOutlined style={{ color: '#bfbfbf' }} />;
    }
  };

  // Quick actions
  const handleQuickAction = (link) => {
    router.push(link);
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Header met titel en acties */}
      <div style={{ 
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard
          </Title>
          <Text type="secondary">
            Totaaloverzicht en directe sturing van het SterkBouw platform
          </Text>
        </div>
        
        <Space>
          <Button 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            Print Rapport
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => message.info('Export gestart')}
          >
            Exporteer
          </Button>
          <Dropdown
            overlay={
              <Menu
                items={[
                  { key: 'refresh', label: 'Vernieuwen', icon: <EyeOutlined /> },
                  { key: 'settings', label: 'Dashboard Instellingen', icon: <SettingOutlined /> },
                  { key: 'help', label: 'Help', icon: <QuestionCircleOutlined /> },
                ]}
              />
            }
            placement="bottomRight"
          >
            <Button icon={<SettingOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* ALERTS EN BLOKKADES - NU DIRECT ONDER HEADER */}
      {(kpiData.alerts > 0 || kpiData.blocks > 0) && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {kpiData.alerts > 0 && (
            <Col xs={24} sm={12}>
              <Alert
                message="Actieve Alerts"
                description={`Er zijn ${kpiData.alerts} actieve alerts die aandacht vereisen.`}
                type="warning"
                showIcon
                action={
                  <Button 
                    size="small" 
                    type="link"
                    onClick={() => router.push('/admin/alerts')}
                  >
                    Bekijken
                  </Button>
                }
              />
            </Col>
          )}
          {kpiData.blocks > 0 && (
            <Col xs={24} sm={12}>
              <Alert
                message="Blokkades Gedetecteerd"
                description={`Er zijn ${kpiData.blocks} blokkades die directe actie vereisen.`}
                type="error"
                showIcon
                action={
                  <Button 
                    size="small" 
                    type="link"
                    onClick={() => router.push('/admin/blocks')}
                  >
                    Oplossen
                  </Button>
                }
              />
            </Col>
          )}
        </Row>
      )}

      {/* KPI TEGELS - NU BOVENAAN IN EIGEN SECTIE */}
      <Card 
        title="KPI Overzicht" 
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            <Text type="secondary">Laatste update: vandaag 14:30</Text>
            <Button 
              type="link" 
              size="small"
              onClick={() => router.push('/admin/reports')}
            >
              Meer statistieken
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {kpiCards.map((kpi, index) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={4} key={index}>
              <Card 
                hoverable
                onClick={() => router.push(kpi.link)}
                style={{ 
                  textAlign: 'center',
                  borderTop: `4px solid ${kpi.color}`,
                  height: '100%'
                }}
              >
                <div style={{ fontSize: 32, color: kpi.color, marginBottom: 8 }}>
                  {kpi.icon}
                </div>
                <Statistic
                  title={kpi.title}
                  value={kpi.value}
                  valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {kpi.trend}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* SNEL ACTIES EN MODULE STATUS - NA KPI'S */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Snelle acties */}
        <Col xs={24} md={12}>
          <Card 
            title="Snelle Acties"
            extra={
              <Button 
                type="link" 
                size="small"
                icon={<PlusOutlined />}
                onClick={() => router.push('/admin/projecten/nieuw')}
              >
                Alle acties
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              {kpiData.quickActions.map((action, index) => (
                <Col xs={12} sm={8} md={12} lg={8} key={index}>
                  <Card
                    hoverable
                    onClick={() => handleQuickAction(action.link)}
                    style={{ 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8, color: '#1890ff' }}>
                      {action.icon}
                    </div>
                    <Text strong>{action.label}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Module Status */}
        <Col xs={24} md={12}>
          <Card 
            title="Module Status"
            extra={
              <Space>
                <Switch 
                  checkedChildren="Toon"
                  unCheckedChildren="Verberg"
                  checked={showModuleStatus}
                  onChange={setShowModuleStatus}
                  size="small"
                />
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => router.push('/admin/instellingen/systeem')}
                >
                  Systeemstatus
                </Button>
              </Space>
            }
          >
            {showModuleStatus ? (
              <Row gutter={[8, 8]}>
                {kpiData.modules.map((module, index) => (
                  <Col xs={12} sm={8} md={8} lg={6} key={index}>
                    <Card
                      size="small"
                      style={{ 
                        textAlign: 'center',
                        borderColor: module.status === 'success' ? '#d9f7be' : 
                                     module.status === 'warning' ? '#fffbe6' : '#ffccc7'
                      }}
                      bodyStyle={{ padding: '8px 4px' }}
                    >
                      <div style={{ marginBottom: 4 }}>
                        {getModuleStatusIcon(module.status)}
                      </div>
                      <Text style={{ fontSize: 12 }}>{module.name}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Module status is verborgen" />
            )}
          </Card>
        </Col>
      </Row>

      {/* TABS VOOR DETAILS */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
        />
        
        {activeTab === 'overview' && (
          <>
            {/* Laatste systeemevents */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title="Laatste Systeemevents"
                  extra={
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => router.push('/admin/system-logs')}
                    >
                      Alle events
                    </Button>
                  }
                >
                  <Timeline>
                    {kpiData.recentEvents.map(event => (
                      <Timeline.Item
                        key={event.id}
                        color={
                          event.type === 'success' ? 'green' :
                          event.type === 'warning' ? 'orange' :
                          event.type === 'error' ? 'red' : 'blue'
                        }
                      >
                        <Text strong>{event.title}</Text>
                        <br />
                        <Text type="secondary">
                          {event.project} • {event.time} • Door: {event.user}
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>

              {/* Project voortgang */}
              <Col xs={24} lg={12}>
                <Card 
                  title="Project Voortgang"
                  extra={
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => router.push('/admin/projecten')}
                    >
                      Alle projecten
                    </Button>
                  }
                >
                  <List
                    dataSource={kpiData.projects.slice(0, 4)}
                    renderItem={project => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text strong>{project.name}</Text>
                              <Tag color={
                                project.status === 'active' ? 'green' :
                                project.status === 'on-hold' ? 'orange' : 'blue'
                              }>
                                {project.status}
                              </Tag>
                            </Space>
                          }
                          description={`Manager: ${project.manager} | ${project.startDate} - ${project.dueDate}`}
                        />
                        <Progress 
                          percent={project.progress} 
                          size="small" 
                          style={{ width: 150 }}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            {/* Financial Overview */}
            <Card 
              title="Financieel Overzicht"
              style={{ marginTop: 24 }}
              extra={
                <Space>
                  <Select defaultValue="months" size="small" style={{ width: 100 }}>
                    <Select.Option value="days">Dagen</Select.Option>
                    <Select.Option value="weeks">Weken</Select.Option>
                    <Select.Option value="months">Maanden</Select.Option>
                    <Select.Option value="quarters">Kwartalen</Select.Option>
                  </Select>
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => router.push('/admin/financien')}
                  >
                    Detailrapport
                  </Button>
                </Space>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Totale Omzet"
                    value={kpiData.totalRevenue}
                    prefix="€"
                    suffix={kpiData.profitMargin}
                  />
                </Col>
                <Col xs={24} md={16}>
                  <div style={{ padding: '20px 0' }}>
                    {kpiData.financialData.map((item, index) => (
                      <div key={index} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 80, textAlign: 'right' }}>
                            <Text type="secondary">{item.month}</Text>
                          </div>
                          <div style={{ flex: 1 }}>
                            <Progress
                              percent={Math.abs(item.amount) / 500000 * 100}
                              strokeColor={item.amount < 0 ? '#f5222d' : '#52c41a'}
                              showInfo={false}
                            />
                          </div>
                          <div style={{ width: 80, textAlign: 'right' }}>
                            <Text type={item.amount < 0 ? 'danger' : 'success'}>
                              €{Math.abs(item.amount / 1000).toFixed(0)}k
                            </Text>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card>
          </>
        )}

        {activeTab === 'projects' && (
          <Table
            columns={[
              { title: 'Projectnaam', dataIndex: 'name', key: 'name' },
              { title: 'Manager', dataIndex: 'manager', key: 'manager' },
              { 
                title: 'Status', 
                dataIndex: 'status', 
                key: 'status',
                render: (status) => (
                  <Tag color={
                    status === 'active' ? 'green' :
                    status === 'on-hold' ? 'orange' : 'blue'
                  }>
                    {status}
                  </Tag>
                )
              },
              { 
                title: 'Prioriteit', 
                dataIndex: 'priority', 
                key: 'priority',
                render: (priority) => (
                  <Tag color={
                    priority === 'High' ? 'red' :
                    priority === 'Medium' ? 'orange' : 'blue'
                  }>
                    {priority}
                  </Tag>
                )
              },
              { title: 'Start Datum', dataIndex: 'startDate', key: 'startDate' },
              { title: 'Eind Datum', dataIndex: 'dueDate', key: 'dueDate' },
              { 
                title: 'Voortgang', 
                dataIndex: 'progress', 
                key: 'progress',
                render: (progress) => <Progress percent={progress} size="small" />
              },
              {
                title: 'Acties',
                key: 'actions',
                render: (_, record) => (
                  <Space>
                    <Button 
                      type="link" 
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => router.push(`/admin/projecten/${record.key}`)}
                    >
                      Bekijk
                    </Button>
                    <Button 
                      type="link" 
                      size="small"
                      icon={<EditOutlined />}
                    >
                      Bewerk
                    </Button>
                  </Space>
                )
              }
            ]}
            dataSource={kpiData.projects}
            pagination={{ pageSize: 10 }}
          />
        )}

        {activeTab === 'finances' && (
          <Card>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Title level={4}>Financiële Dashboard</Title>
                <Text type="secondary">Real-time financiële inzichten en prognoses</Text>
              </Col>
              {/* Voeg hier financiële grafieken en tabellen toe */}
            </Row>
          </Card>
        )}
      </Card>
    </div>
  );
}

// Helper component voor ontbrekende icon
const QuestionCircleOutlined = () => (
  <svg width="1em" height="1em" viewBox="0 0 1024 1024" fill="currentColor">
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
    <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7c-37.3 32.8-46.9 71-46.9 119.9 0 60.3 38 99.7 96.3 99.7 27.3 0 51.5-9.8 70.7-27.3 5.8-5.8 11.1-12.5 15.8-19.7 1.8-3.6 6.1-4.8 9.7-3.1 4.5 2.1 7.5 6.6 7.5 11.6V665c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-53.2c0-21.3-10.6-41.1-28.1-52.8-17.5-11.7-39.5-17.9-62.9-17.9-66.1 0-112.3-44.5-112.3-107.7 0-62.4 44.6-107.7 112.3-107.7 28.6 0 55.4 9.3 77.4 26.6 20.1 16.1 31.4 38.2 31.4 61.6 0 19.7-9.5 37.1-28.4 50.6-5.1 3.7-6.9 10.2-4.4 15.8l19.9 41.4c2.4 5 8.3 7.1 13.4 5.3 35.9-12.2 63.4-44.1 71.3-85.2 7.8-40.6-3.5-81.5-30.9-111.7zM472 734h80c4.4 0 8-3.6 8-8v-80c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8z"/>
  </svg>
);
