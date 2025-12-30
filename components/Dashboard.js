// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Timeline, Table, Tag, Button, Space } from 'antd';
import {
  ProjectOutlined, FileTextOutlined, PictureOutlined,
  TeamOutlined, RiseOutlined, DollarOutlined,
  CalendarOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined,
  ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 24,
    activeContracts: 18,
    drawings: 156,
    teamMembers: 42,
    budgetUsed: 68,
    onSchedule: 85
  });

  const recentActivities = [
    {
      id: 1,
      action: 'Nieuw project aangemaakt',
      user: 'Johan de Vries',
      time: '10 minuten geleden',
      icon: <ProjectOutlined />,
      color: 'green'
    },
    {
      id: 2,
      action: 'Contract goedgekeurd',
      user: 'Peter Jansen',
      time: '1 uur geleden',
      icon: <CheckCircleOutlined />,
      color: 'blue'
    },
    {
      id: 3,
      action: 'Tekening geüpload',
      user: 'Lisa de Vries',
      time: '2 uur geleden',
      icon: <PictureOutlined />,
      color: 'orange'
    },
    {
      id: 4,
      action: 'Deadline nadert',
      user: 'Systeem',
      time: '5 uur geleden',
      icon: <ExclamationCircleOutlined />,
      color: 'red'
    }
  ];

  const projectStatus = [
    {
      key: '1',
      name: 'Main Tower',
      progress: 85,
      status: 'on-track',
      deadline: '2024-06-30',
      budget: '€ 2.5M'
    },
    {
      key: '2',
      name: 'Park Plaza',
      progress: 62,
      status: 'delayed',
      deadline: '2024-08-15',
      budget: '€ 1.8M'
    },
    {
      key: '3',
      name: 'Sunset Residence',
      progress: 45,
      status: 'on-track',
      deadline: '2024-09-30',
      budget: '€ 3.2M'
    }
  ];

  const columns = [
    {
      title: 'Project',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Voortgang',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          'on-track': { color: 'green', text: 'Op Schema' },
          'delayed': { color: 'orange', text: 'Vertraagd' },
          'at-risk': { color: 'red', text: 'Risico' }
        }[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
  ];

  return (
    <div className="dashboard">
      {/* Welkomstboodschap */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Welkom terug, {user?.name || 'Gebruiker'}!
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Hier is een overzicht van jouw projectportaal
        </p>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Actieve Projecten"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Contracten"
              value={stats.activeContracts}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tekeningen"
              value={stats.drawings}
              prefix={<PictureOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Teamleden"
              value={stats.teamMembers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Voortgang en Activiteiten */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Project Voortgang" style={{ height: '100%' }}>
            <Table
              dataSource={projectStatus}
              columns={columns}
              pagination={false}
              size="small"
            />
            
            <div style={{ marginTop: 24 }}>
              <h4>Budget Overzicht</h4>
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Totaal Budget</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>€ 7.5M</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Gebruikt</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                      {stats.budgetUsed}%
                      <Progress percent={stats.budgetUsed} size="small" />
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Op Schema</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                      {stats.onSchedule}%
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Recente Activiteiten">
            <Timeline>
              {recentActivities.map((activity) => (
                <Timeline.Item
                  key={activity.id}
                  color={activity.color}
                  dot={activity.icon}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{activity.action}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      door {activity.user}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {activity.time}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
            <Button type="link" block style={{ marginTop: 16 }}>
              Bekijk alle activiteiten
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Snelle Acties */}
      <Card title="Snelle Acties" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div>Nieuw Contract</div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <PictureOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <div>Upload Tekening</div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <TeamOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                <div>Team Toevoegen</div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <CalendarOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                <div>Afspraak Maken</div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
