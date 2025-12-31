import React from 'react';
import { Card, Row, Col, Statistic, Alert, Button, Progress, Tag, List, Avatar } from 'antd';
import { 
  ProjectOutlined, 
  CalculatorOutlined, 
  WarningOutlined, 
  EuroCircleOutlined,
  PlusOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  DashboardOutlined,
  BankOutlined,
  ShopOutlined,
  MailOutlined,
  CalendarOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons';

const Dashboard = () => {
  // Mock data - vervang dit met je echte API calls
  const kpiData = {
    activeProjects: 12,
    ongoingCalculations: 8,
    openChangeOrders: 5,
    pendingApprovals: 3,
    financialExposure: '€2.8M',
    alerts: 2,
    blocks: 1,
  };

  const moduleStatus = [
    { name: 'Administratie', status: 'success', color: 'green' },
    { name: 'BIM', status: 'warning', color: 'orange' },
    { name: 'Bouwplaats', status: 'success', color: 'green' },
    { name: 'Calculatie', status: 'error', color: 'red' },
    { name: 'Constructie', status: 'success', color: 'green' },
    { name: 'Documenten', status: 'success', color: 'green' },
    { name: 'Financiën', status: 'warning', color: 'orange' },
    { name: 'Financieringen', status: 'success', color: 'green' },
    { name: 'Inkoop', status: 'success', color: 'green' },
    { name: 'Kopersportaal', status: 'success', color: 'green' },
    { name: 'Mail', status: 'success', color: 'green' },
    { name: 'Planning', status: 'warning', color: 'orange' },
    { name: 'Projecten', status: 'success', color: 'green' },
    { name: 'Projectportaal', status: 'success', color: 'green' },
  ];

  const recentEvents = [
    { id: 1, title: 'Calculatie goedgekeurd', project: 'Project Alpha', time: '10 min geleden', user: 'Executor' },
    { id: 2, title: 'Bouwplaats gestart', project: 'Project Beta', time: '1 uur geleden', user: 'Builder' },
    { id: 3, title: 'Meerwerk gesignaleerd', project: 'Project Gamma', time: '2 uur geleden', user: 'Builder' },
    { id: 4, title: 'Financiering rond', project: 'Project Delta', time: '5 uur geleden', user: 'Executor' },
  ];

  const quickActions = [
    { icon: <PlusOutlined />, label: 'Nieuw project', link: '/projects/new' },
    { icon: <CalculatorOutlined />, label: 'Nieuwe calculatie', link: '/calculations/new' },
    { icon: <SafetyOutlined />, label: 'Open bouwplaats', link: '/construction-site' },
    { icon: <BankOutlined />, label: 'Financiering', link: '/financing' },
    { icon: <CheckCircleOutlined />, label: 'Bouwinspectie', link: '/inspections' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          <DashboardOutlined /> Dashboard
        </h1>
        <p style={{ color: '#666' }}>
          Totaaloverzicht en directe sturing van het SterkBouw platform
        </p>
      </div>

      {/* Alerts & Blokkades */}
      {(kpiData.alerts > 0 || kpiData.blocks > 0) && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {kpiData.alerts > 0 && (
            <Col xs={24} sm={12}>
              <Alert
                message={`${kpiData.alerts} actieve alert(s)`}
                type="warning"
                showIcon
                action={<Button size="small">Bekijken</Button>}
              />
            </Col>
          )}
          {kpiData.blocks > 0 && (
            <Col xs={24} sm={12}>
              <Alert
                message={`${kpiData.blocks} blokkade(s)`}
                type="error"
                showIcon
                action={<Button size="small">Oplossen</Button>}
              />
            </Col>
          )}
        </Row>
      )}

      {/* KPI Tegels */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Actieve projecten"
              value={kpiData.activeProjects}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Lopende calculaties"
              value={kpiData.ongoingCalculations}
              prefix={<CalculatorOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Open meerwerk"
              value={kpiData.openChangeOrders}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Openstaande akkoorden"
              value={kpiData.pendingApprovals}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Financiële exposure"
              value={kpiData.financialExposure}
              prefix={<EuroCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Systeemevents (laatste 24u)"
              value={recentEvents.length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Snelle Acties */}
      <Card title="Snelle acties" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={12} sm={8} md={6} lg={4} key={index}>
              <Button 
                type="primary" 
                icon={action.icon} 
                block
                style={{ height: '80px' }}
                onClick={() => window.location.href = action.link}
              >
                {action.label}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Twee kolommen onderaan */}
      <Row gutter={[16, 16]}>
        {/* Laatste systeemevents */}
        <Col xs={24} lg={12}>
          <Card 
            title="Laatste systeemevents (executor / builder)" 
            style={{ height: '100%' }}
          >
            <List
              dataSource={recentEvents}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} />}
                    title={item.title}
                    description={`${item.project} • ${item.time} • Door: ${item.user}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Status per module */}
        <Col xs={24} lg={12}>
          <Card title="Status per module" style={{ height: '100%' }}>
            <Row gutter={[8, 8]}>
              {moduleStatus.map((module, index) => (
                <Col xs={12} sm={8} key={index}>
                  <Card 
                    size="small"
                    style={{ 
                      borderLeft: `4px solid ${module.color}`,
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{module.name}</span>
                      <Tag color={module.color}>
                        {module.status === 'success' ? '✓' : 
                         module.status === 'warning' ? '⚠' : '✗'}
                      </Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Tag color="green">Actief</Tag>
              <Tag color="orange">Waarschuwing</Tag>
              <Tag color="red">Probleem</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Navigatie naar andere modules */}
      <Card title="Direct naar modules" style={{ marginTop: '24px' }}>
        <Row gutter={[8, 8]}>
          {[
            { name: 'Administratie', icon: <FileTextOutlined />, link: '/administration' },
            { name: 'BIM', icon: <ProjectOutlined />, link: '/bim' },
            { name: 'Bouwplaats', icon: <SafetyOutlined />, link: '/construction-site' },
            { name: 'Calculatie', icon: <CalculatorOutlined />, link: '/calculation' },
            { name: 'Constructie', icon: <ProjectOutlined />, link: '/construction' },
            { name: 'Documenten', icon: <FileTextOutlined />, link: '/documents' },
            { name: 'Financiën', icon: <EuroCircleOutlined />, link: '/finance' },
            { name: 'Financieringen', icon: <BankOutlined />, link: '/financing' },
            { name: 'Inkoop', icon: <ShopOutlined />, link: '/procurement' },
            { name: 'Kopersportaal', icon: <TeamOutlined />, link: '/buyer-portal' },
            { name: 'Mail', icon: <MailOutlined />, link: '/mail' },
            { name: 'Planning', icon: <CalendarOutlined />, link: '/planning' },
            { name: 'Projecten', icon: <ProjectOutlined />, link: '/projects' },
            { name: 'Projectportaal', icon: <TeamOutlined />, link: '/client-portal' },
            { name: 'Instellingen', icon: <SettingOutlined />, link: '/settings' },
          ].map((module, index) => (
            <Col xs={12} sm={8} md={6} lg={4} key={index}>
              <Button 
                icon={module.icon}
                block
                style={{ marginBottom: '8px' }}
                onClick={() => window.location.href = module.link}
              >
                {module.name}
              </Button>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
