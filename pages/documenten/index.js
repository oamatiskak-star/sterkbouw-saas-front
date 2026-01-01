// pages/documenten/index.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Select,
  Alert,
  Tag,
  Tabs,
  Table,
  Progress,
  List,
  Collapse,
  Divider,
  Space,
  Modal,
  Form,
  Input,
  Checkbox,
  Spin
} from 'antd';
import {
  FilePdfOutlined,
  FileTextOutlined,
  InboxOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ScheduleOutlined,
  LineChartOutlined,
  DollarOutlined,
  AppstoreOutlined,
  HomeOutlined,
  CameraOutlined,
  DownOutlined,
  UpOutlined,
  SyncOutlined,
  LockOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const DocumentenPage = () => {
  const [activeProject, setActiveProject] = useState(null);
  const [projects, setProjects] = useState([
    { id: 1, name: 'Project A', code: 'PRJ-001', status: 'opleverfase', lastUpdated: '2024-01-15' },
    { id: 2, name: 'Project B', code: 'PRJ-002', status: 'in uitvoering', lastUpdated: '2024-01-10' },
    { id: 3, name: 'Project C', code: 'PRJ-003', status: 'vertraging', lastUpdated: '2024-01-05' }
  ]);
  
  const [selectedTab, setSelectedTab] = useState('0');
  const [expandedBuilding, setExpandedBuilding] = useState({});
  const [loading, setLoading] = useState(false);
  const [deliveryPoints, setDeliveryPoints] = useState([
    { id: 1, buildingNumber: '101', space: 'Badkamer', status: 'akkoord', photos: 3, projectId: 1 },
    { id: 2, buildingNumber: '101', space: 'Keuken', status: 'gereed', photos: 2, projectId: 1 },
    { id: 3, buildingNumber: '102', space: 'Woonkamer', status: 'in_uitvoering', photos: 1, projectId: 1 },
    { id: 4, buildingNumber: '102', space: 'Slaapkamer', status: 'open', photos: 0, projectId: 1 },
  ]);

  const buildingNumbers = ['101', '102'];
  const spaces = [
    { id: 1, buildingNumber: '101', name: 'Badkamer' },
    { id: 2, buildingNumber: '101', name: 'Keuken' },
    { id: 3, buildingNumber: '102', name: 'Woonkamer' },
    { id: 4, buildingNumber: '102', name: 'Slaapkamer' },
  ];

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

  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setActiveProject(project);
    setLoading(true);
    
    // Simuleer data ophalen
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const renderProjectSelector = () => (
    <Card style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={8}>
          <Form.Item label="Selecteer Project">
            <Select
              placeholder="Kies een project"
              value={activeProject?.id}
              onChange={handleProjectChange}
              style={{ width: '100%' }}
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name} - {project.code}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        
        {activeProject && (
          <>
            <Col xs={24} md={16}>
              <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                  <Text type="secondary">Projectstatus</Text>
                  <br />
                  <Tag 
                    color={
                      activeProject.status === 'opleverfase' ? 'success' :
                      activeProject.status === 'vertraging' ? 'orange' :
                      'blue'
                    }
                  >
                    {activeProject.status}
                  </Tag>
                </Col>
                <Col xs={12} md={6}>
                  <Text type="secondary">Laatste update</Text>
                  <br />
                  <Text>{new Date(activeProject.lastUpdated).toLocaleDateString('nl-NL')}</Text>
                </Col>
                <Col xs={12} md={6}>
                  <Text type="secondary">Documentstatus</Text>
                  <br />
                  <Space>
                    {deliveryStatus?.completionRate === 100 ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">Compleet</Tag>
                    ) : (
                      <Tag icon={<WarningOutlined />} color="warning">Incompleet</Tag>
                    )}
                    <Button 
                      type="text" 
                      icon={<SyncOutlined />} 
                      size="small"
                      onClick={() => setLoading(true)}
                    />
                  </Space>
                </Col>
                <Col xs={12} md={6}>
                  <Text type="secondary">Opleverpunten</Text>
                  <br />
                  <Text>{deliveryStatus?.approved || 0}/{deliveryStatus?.total || 0} akkoord</Text>
                </Col>
              </Row>
            </Col>
          </>
        )}
      </Row>
    </Card>
  );

  const renderFormalDocuments = () => (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>Formele Projectdocumenten</Title>
        <Button 
          type="primary" 
          icon={<FilePdfOutlined />}
          disabled={!activeProject}
        >
          Genereer Opleverpakket
        </Button>
      </div>
      
      <Row gutter={[24, 24]}>
        {/* Opleverdocumenten */}
        <Col xs={24} md={12}>
          <Title level={5} style={{ color: '#52c41a', marginBottom: 16 }}>
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            Opleverdocumenten
          </Title>
          
          {!activeProject ? (
            <Alert 
              message="Selecteer een project" 
              description="Selecteer een project om de opleverstatus te zien"
              type="info"
              showIcon
            />
          ) : loading ? (
            <Spin />
          ) : (
            <>
              {/* Opleverstatus overzicht */}
              <Card style={{ marginBottom: 16 }}>
                <Title level={5}>Real-time Opleverstatus</Title>
                <Row gutter={[16, 16]}>
                  <Col span={6} style={{ textAlign: 'center' }}>
                    <Title level={2} type="danger">{deliveryStatus?.open || 0}</Title>
                    <Text type="secondary">Open</Text>
                  </Col>
                  <Col span={6} style={{ textAlign: 'center' }}>
                    <Title level={2} type="warning">{deliveryStatus?.inProgress || 0}</Title>
                    <Text type="secondary">In uitvoering</Text>
                  </Col>
                  <Col span={6} style={{ textAlign: 'center' }}>
                    <Title level={2}>{deliveryStatus?.ready || 0}</Title>
                    <Text type="secondary">Gereed</Text>
                  </Col>
                  <Col span={6} style={{ textAlign: 'center' }}>
                    <Title level={2} type="success">{deliveryStatus?.approved || 0}</Title>
                    <Text type="secondary">Akkoord</Text>
                  </Col>
                </Row>
                <Progress 
                  percent={deliveryStatus?.completionRate || 0} 
                  strokeColor={deliveryStatus?.completionRate === 100 ? '#52c41a' : '#1890ff'}
                  style={{ marginTop: 16 }}
                />
              </Card>

              {/* Per bouwnummer overzicht */}
              <Title level={5}>Per Bouwnummer</Title>
              {buildingNumbers.map((buildingNumber) => {
                const buildingPoints = deliveryPoints.filter(
                  dp => dp.buildingNumber === buildingNumber
                );
                const approvedPoints = buildingPoints.filter(p => p.status === 'akkoord').length;
                const totalPoints = buildingPoints.length;
                
                return (
                  <Collapse 
                    key={buildingNumber}
                    style={{ marginBottom: 8 }}
                    expandIconPosition="start"
                    onChange={() => setExpandedBuilding(prev => ({
                      ...prev,
                      [buildingNumber]: !prev[buildingNumber]
                    }))}
                  >
                    <Panel 
                      header={`Bouwnummer ${buildingNumber}`}
                      key={buildingNumber}
                      extra={
                        <Tag color={approvedPoints === totalPoints ? 'success' : 'orange'}>
                          {approvedPoints}/{totalPoints}
                        </Tag>
                      }
                    >
                      <List
                        dataSource={spaces.filter(space => space.buildingNumber === buildingNumber)}
                        renderItem={(space) => {
                          const spacePoints = deliveryPoints.filter(
                            dp => dp.buildingNumber === buildingNumber && dp.space === space.name
                          );
                          const spaceApproved = spacePoints.filter(p => p.status === 'akkoord').length;
                          
                          return (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<HomeOutlined />}
                                title={space.name}
                                description={`${spaceApproved}/${spacePoints.length} punten akkoord`}
                              />
                              {spacePoints.some(p => p.photos > 0) && (
                                <CameraOutlined style={{ color: '#1890ff' }} />
                              )}
                            </List.Item>
                          );
                        }}
                      />
                    </Panel>
                  </Collapse>
                );
              })}
              
              {/* Opleverdocumenten generatie */}
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Beschikbare opleverdocumenten</Title>
                <Space wrap>
                  {['Opleverformulier', 'Proces-verbaal', 'Restpuntenlijst', 'Garantieoverzicht', 'As-built verklaring'].map((doc) => (
                    <Button key={doc} icon={<FileTextOutlined />}>
                      {doc}
                    </Button>
                  ))}
                </Space>
              </div>
            </>
          )}
        </Col>

        {/* Contractdocumenten */}
        <Col xs={24} md={12}>
          <Title level={5} style={{ color: '#1890ff', marginBottom: 16 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Contract- & Verplichtingsdocumenten
          </Title>
          
          <Table
            dataSource={[
              {
                key: '1',
                document: 'Hoofdcontract',
                leverancier: 'Opdrachtgever',
                datum: '15-01-2024',
                status: 'Definitief',
              },
              {
                key: '2',
                document: 'Meerwerk overeenkomst',
                leverancier: 'Leverancier X',
                datum: '20-01-2024',
                status: 'Concept',
              }
            ]}
            columns={[
              {
                title: 'Document',
                dataIndex: 'document',
                key: 'document',
              },
              {
                title: 'Leverancier',
                dataIndex: 'leverancier',
                key: 'leverancier',
              },
              {
                title: 'Datum',
                dataIndex: 'datum',
                key: 'datum',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={status === 'Definitief' ? 'success' : 'orange'}>
                    {status}
                  </Tag>
                ),
              },
              {
                title: 'Acties',
                key: 'actions',
                render: () => (
                  <Space>
                    <Button type="text" icon={<EyeOutlined />} size="small" />
                    <Button type="text" icon={<DownloadOutlined />} size="small" />
                  </Space>
                ),
              },
            ]}
            size="small"
          />
        </Col>
      </Row>
    </Card>
  );

  const renderAIReports = () => (
    <Card style={{ marginBottom: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>AI Rapportages</Title>
      <Paragraph type="secondary">Gestructureerde input van AI-rollen</Paragraph>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card 
            title={
              <Space>
                <AppstoreOutlined style={{ color: '#ff9800' }} />
                <Text>AI Uitvoerder</Text>
              </Space>
            }
          >
            <Paragraph type="secondary">Bouw & voortgang</Paragraph>
            <List
              dataSource={[
                { title: 'Afwijkingen planning', description: '3 punten achter op schema' },
                { title: 'Vertragingen', description: 'Badkamers 2-4 dagen vertraging' }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            title={
              <Space>
                <LineChartOutlined style={{ color: '#9c27b0' }} />
                <Text>AI Projectmanager</Text>
              </Space>
            }
          >
            <Paragraph type="secondary">Overzicht & beslissingen</Paragraph>
            <Alert 
              message="Kritiek: Materiaallevering 5 dagen vertraagd" 
              type="warning" 
              showIcon 
            />
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            title={
              <Space>
                <InboxOutlined style={{ color: '#f44336' }} />
                <Text>AI Inkoop</Text>
              </Space>
            }
          >
            <Paragraph type="secondary">Werkvoorbereiding</Paragraph>
            <List
              dataSource={[
                { title: 'Leveringsstatus', description: '4 bestellingen onderweg' }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const renderTechnicalReports = () => (
    <Card style={{ marginBottom: 24 }}>
      <Title level={4}>Technische & Financiële Rapportages</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card>
            <Title level={5} style={{ color: '#00bcd4' }}>
              <DollarOutlined style={{ marginRight: 8 }} />
              Financiële Projectrapportage
            </Title>
            <Paragraph>Financiële rapportage component</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Title level={5} style={{ color: '#795548' }}>
              <ScheduleOutlined style={{ marginRight: 8 }} />
              Planning & Vertraging
            </Title>
            <Paragraph>Planning rapportage component</Paragraph>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 16 }}>Documenten & Rapportages</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Centraal geheugen en verantwoordingscentrum voor project {activeProject?.name || ''}
      </Paragraph>

      {/* Projectselector */}
      {renderProjectSelector()}

      {!activeProject ? (
        <Alert 
          message="Selecteer een project" 
          description="Selecteer een project om documenten en rapportages te bekijken"
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      ) : (
        <Tabs activeKey={selectedTab} onChange={setSelectedTab}>
          <TabPane tab="Formele Documenten" key="0">
            {renderFormalDocuments()}
          </TabPane>
          <TabPane tab="AI Rapportages" key="1">
            {renderAIReports()}
          </TabPane>
          <TabPane tab="Technisch & Financieel" key="2">
            {renderTechnicalReports()}
          </TabPane>
          <TabPane tab="Archief" key="3">
            <Card>
              <Title level={4}>Documentarchief & Audit Trail</Title>
              <Paragraph>Archief component</Paragraph>
            </Card>
          </TabPane>
          <TabPane tab="Exports" key="4">
            <Card>
              <Title level={4}>Acties & Exports</Title>
              <Paragraph>Export component</Paragraph>
            </Card>
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default DocumentenPage;
