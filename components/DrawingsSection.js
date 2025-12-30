// components/DrawingsSection.js
import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Table, Button, Space, Tag, Input, Modal,
  Upload, message, Progress, Avatar, Dropdown, Timeline,
  Select, DatePicker, Tree, Badge, Tooltip, Popconfirm,
  Descriptions, List, Divider, Statistic, Switch, Image
} from 'antd';
import {
  SearchOutlined, UploadOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, DownloadOutlined,
  FolderOutlined, FileOutlined, PictureOutlined,
  HistoryOutlined, ShareAltOutlined, CopyOutlined,
  CheckCircleOutlined, SyncOutlined, ExclamationCircleOutlined,
  FilterOutlined, PlusOutlined, TeamOutlined,
  CommentOutlined, TagOutlined, StarOutlined,
  ZoomInOutlined, RotateRightOutlined, CloudUploadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './DrawingsSection.css';

dayjs.extend(relativeTime);
const { Search } = Input;
const { Option } = Select;
const { DirectoryTree } = Tree;
const { TextArea } = Input;

const DrawingsSection = () => {
  const [drawings, setDrawings] = useState([]);
  const [filteredDrawings, setFilteredDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Drawing status en kleuren
  const statusConfig = {
    approved: { color: 'success', text: 'Goedgekeurd', icon: <CheckCircleOutlined /> },
    pending: { color: 'warning', text: 'In Review', icon: <SyncOutlined spin /> },
    rejected: { color: 'error', text: 'Afgewezen', icon: <ExclamationCircleOutlined /> },
    draft: { color: 'default', text: 'Concept', icon: <FileOutlined /> },
    archived: { color: 'gray', text: 'Gearchiveerd', icon: <FolderOutlined /> }
  };

  // Voorbeeld tekeningen data
  const mockDrawings = [
    {
      id: 'DWG-2024-001',
      title: 'Architectuur Plan - Hoofdgebouw',
      fileName: 'arc_main_building_v2.pdf',
      fileSize: '4.2 MB',
      category: 'architecture',
      version: '2.1',
      status: 'approved',
      uploadedBy: 'Jan Smit',
      uploadDate: '2024-02-15',
      lastModified: '2024-02-18',
      revisions: 3,
      project: 'Main Tower',
      tags: ['architectuur', 'hoofdgebouw', 'definitief'],
      thumbnail: '/api/placeholder/300/200',
      views: 142,
      downloads: 45
    },
    {
      id: 'DWG-2024-002',
      title: 'Constructie Details Fundering',
      fileName: 'struct_foundation_v1.dwg',
      fileSize: '8.7 MB',
      category: 'structural',
      version: '1.0',
      status: 'pending',
      uploadedBy: 'Peter Jansen',
      uploadDate: '2024-02-18',
      lastModified: '2024-02-19',
      revisions: 1,
      project: 'Main Tower',
      tags: ['constructie', 'fundering', 'wip'],
      thumbnail: '/api/placeholder/300/200',
      views: 89,
      downloads: 12
    },
    {
      id: 'DWG-2024-003',
      title: 'Elektrische Schema Level 3',
      fileName: 'electrical_level3_v3.pdf',
      fileSize: '3.1 MB',
      category: 'electrical',
      version: '3.0',
      status: 'approved',
      uploadedBy: 'Lisa de Vries',
      uploadDate: '2024-02-10',
      lastModified: '2024-02-12',
      revisions: 2,
      project: 'Park Plaza',
      tags: ['elektra', 'schema', 'definitief'],
      thumbnail: '/api/placeholder/300/200',
      views: 203,
      downloads: 67
    },
    {
      id: 'DWG-2024-004',
      title: 'Sanitair Installatie Overzicht',
      fileName: 'plumbing_overview_v1.dwg',
      fileSize: '5.6 MB',
      category: 'plumbing',
      version: '1.2',
      status: 'draft',
      uploadedBy: 'Mark Peters',
      uploadDate: '2024-02-19',
      lastModified: '2024-02-19',
      revisions: 0,
      project: 'Main Tower',
      tags: ['sanitair', 'installatie', 'concept'],
      thumbnail: '/api/placeholder/300/200',
      views: 34,
      downloads: 5
    },
    {
      id: 'DWG-2023-012',
      title: 'Oude Mechanische Tekening',
      fileName: 'mech_old_v1.pdf',
      fileSize: '2.8 MB',
      category: 'mechanical',
      version: '1.0',
      status: 'archived',
      uploadedBy: 'System',
      uploadDate: '2023-11-15',
      lastModified: '2023-11-20',
      revisions: 1,
      project: 'Sunset Residence',
      tags: ['oud', 'mechanisch', 'vervangen'],
      thumbnail: '/api/placeholder/300/200',
      views: 156,
      downloads: 28
    }
  ];

  // Tree data voor folder structuur
  const mockTreeData = [
    {
      title: 'Projecten',
      key: '0',
      icon: <FolderOutlined />,
      children: [
        {
          title: 'Main Tower',
          key: '0-0',
          icon: <FolderOutlined />,
          children: [
            { title: 'Architectuur', key: '0-0-0', icon: <FolderOutlined /> },
            { title: 'Constructie', key: '0-0-1', icon: <FolderOutlined /> },
            { title: 'Installaties', key: '0-0-2', icon: <FolderOutlined /> },
          ],
        },
        {
          title: 'Park Plaza',
          key: '0-1',
          icon: <FolderOutlined />,
          children: [
            { title: 'Elektra', key: '0-1-0', icon: <FolderOutlined /> },
            { title: 'Sanitair', key: '0-1-1', icon: <FolderOutlined /> },
          ],
        },
        {
          title: 'Sunset Residence',
          key: '0-2',
          icon: <FolderOutlined />,
          isLeaf: true,
        },
      ],
    },
    {
      title: 'Templates',
      key: '1',
      icon: <FolderOutlined />,
      children: [
        { title: 'Standaard Details', key: '1-0', icon: <FileOutlined /> },
        { title: 'Legenda', key: '1-1', icon: <FileOutlined /> },
      ],
    },
    {
      title: 'Gearchiveerd',
      key: '2',
      icon: <FolderOutlined />,
      isLeaf: true,
    },
  ];

  useEffect(() => {
    fetchDrawings();
    setTreeData(mockTreeData);
  }, []);

  const fetchDrawings = () => {
    setLoading(true);
    setTimeout(() => {
      setDrawings(mockDrawings);
      setFilteredDrawings(mockDrawings);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = drawings.filter(drawing =>
      drawing.title.toLowerCase().includes(value.toLowerCase()) ||
      drawing.fileName.toLowerCase().includes(value.toLowerCase()) ||
      drawing.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredDrawings(filtered);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    if (category === 'all') {
      setFilteredDrawings(drawings);
    } else {
      const filtered = drawings.filter(drawing => drawing.category === category);
      setFilteredDrawings(filtered);
    }
  };

  const handleUpload = () => {
    setUploading(true);
    // Simuleer upload
    setTimeout(() => {
      setUploading(false);
      setUploadModalVisible(false);
      setFileList([]);
      message.success('Tekening succesvol geüpload!');
      fetchDrawings();
    }, 2000);
  };

  const handleViewDrawing = (drawing) => {
    setSelectedDrawing(drawing);
    setViewModalVisible(true);
  };

  const handleDeleteDrawing = (drawingId) => {
    setDrawings(drawings.filter(d => d.id !== drawingId));
    setFilteredDrawings(filteredDrawings.filter(d => d.id !== drawingId));
    message.success('Tekening verwijderd');
  };

  const handleDownload = (drawing) => {
    message.success(`Download gestart: ${drawing.fileName}`);
    // Hier zou de download logica komen
  };

  const getCategoryLabel = (category) => {
    const categories = {
      architecture: 'Architectuur',
      structural: 'Constructie',
      electrical: 'Elektra',
      plumbing: 'Sanitair',
      mechanical: 'Mechanisch',
      hvac: 'HVAC',
      general: 'Algemeen'
    };
    return categories[category] || category;
  };

  const columns = [
    {
      title: 'Titel',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            shape="square"
            icon={<PictureOutlined />}
            src={record.thumbnail}
            style={{ width: 40, height: 40 }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.fileName} • {record.fileSize}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Categorie',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => (
        <Tag color="blue">{getCategoryLabel(category)}</Tag>
      ),
    },
    {
      title: 'Versie',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (version) => (
        <Badge count={`v${version}`} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
      width: 150,
    },
    {
      title: 'Laatst gewijzigd',
      dataIndex: 'lastModified',
      key: 'lastModified',
      width: 150,
      render: (date) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm')}>
          <span>{dayjs(date).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Statistieken',
      key: 'stats',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Bekeken">
            <span style={{ fontSize: '12px' }}>
              <EyeOutlined /> {record.views}
            </span>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="Downloads">
            <span style={{ fontSize: '12px' }}>
              <DownloadOutlined /> {record.downloads}
            </span>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="Revisies">
            <span style={{ fontSize: '12px' }}>
              <HistoryOutlined /> {record.revisions}
            </span>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Acties',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Bekijken">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDrawing(record)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="Bewerken">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => message.info(`Bewerk ${record.title}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Tekening verwijderen?"
            description="Weet u zeker dat u deze tekening wilt verwijderen?"
            onConfirm={() => handleDeleteDrawing(record.id)}
            okText="Ja"
            cancelText="Nee"
          >
            <Tooltip title="Verwijderen">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getStats = () => {
    const totalSize = drawings.reduce((sum, d) => {
      return sum + parseFloat(d.fileSize.replace(' MB', ''));
    }, 0);
    
    const pendingCount = drawings.filter(d => d.status === 'pending').length;
    const todayUploads = drawings.filter(d => 
      dayjs(d.uploadDate).isSame(dayjs(), 'day')
    ).length;

    return {
      totalDrawings: drawings.length,
      totalSize: `${totalSize.toFixed(1)} MB`,
      pendingCount,
      todayUploads
    };
  };

  const stats = getStats();

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isDwg = file.name.endsWith('.dwg');
      const isPdf = file.name.endsWith('.pdf');
      const isImage = ['image/png', 'image/jpeg', 'image/gif'].includes(file.type);
      
      if (!isDwg && !isPdf && !isImage) {
        message.error('Alleen DWG, PDF of afbeeldingsbestanden zijn toegestaan!');
        return false;
      }
      
      const isLt100M = file.size / 1024 / 1024 < 100;
      if (!isLt100M) {
        message.error('Bestand mag maximaal 100MB zijn!');
        return false;
      }
      
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <div className="drawings-section">
      {/* Statistieken */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Totaal Tekeningen"
              value={stats.totalDrawings}
              prefix={<PictureOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Totale Grootte"
              value={stats.totalSize}
              suffix="MB"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="In Review"
              value={stats.pendingCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Vandaag Geüpload"
              value={stats.todayUploads}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CloudUploadOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Hoofd content met tree en tabel */}
      <Row gutter={[16, 16]}>
        {/* Linkerzijde - Folder structuur */}
        <Col xs={24} md={8} lg={6}>
          <Card 
            title="Folder Structuur" 
            extra={<Button type="text" icon={<PlusOutlined />} size="small" />}
            style={{ height: '100%' }}
          >
            <DirectoryTree
              treeData={treeData}
              onSelect={(keys) => setSelectedKeys(keys)}
              selectedKeys={selectedKeys}
              expandAction="doubleClick"
              defaultExpandAll
            />
            
            <Divider />
            
            <div style={{ marginTop: 16 }}>
              <h4>Snelle Acties</h4>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  block 
                  icon={<UploadOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                >
                  Upload Tekening
                </Button>
                <Button 
                  block 
                  icon={<FolderOutlined />}
                >
                  Nieuwe Map
                </Button>
                <Button 
                  block 
                  icon={<TeamOutlined />}
                >
                  Deel Map
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Rechterzijde - Tekeningen lijst */}
        <Col xs={24} md={16} lg={18}>
          <Card
            title="Tekeningen Overzicht"
            extra={
              <Space>
                <Search
                  placeholder="Zoek tekeningen..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  style={{ width: 200 }}
                />
                <Select
                  placeholder="Filter categorie"
                  style={{ width: 150 }}
                  onChange={handleCategoryFilter}
                  value={categoryFilter}
                >
                  <Option value="all">Alle Categorieën</Option>
                  <Option value="architecture">Architectuur</Option>
                  <Option value="structural">Constructie</Option>
                  <Option value="electrical">Elektra</Option>
                  <Option value="plumbing">Sanitair</Option>
                  <Option value="mechanical">Mechanisch</Option>
                </Select>
                <Button icon={<FilterOutlined />}>Filters</Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredDrawings}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
              }}
            />
          </Card>

          {/* Recente activiteiten */}
          <Card title="Recente Activiteiten" style={{ marginTop: 16 }}>
            <Timeline>
              <Timeline.Item color="green">
                <Space direction="vertical" size={0}>
                  <span>Nieuwe versie geüpload: Architectuur Plan</span>
                  <small>2 uur geleden door Jan Smit</small>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Space direction="vertical" size={0}>
                  <span>Review goedgekeurd: Constructie Details</span>
                  <small>Vandaag 10:30 door Peter Jansen</small>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <Space direction="vertical" size={0}>
                  <span>Opmerking toegevoegd: Elektrische Schema</span>
                  <small>Gisteren 16:45 door Lisa de Vries</small>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="gray">
                <Space direction="vertical" size={0}>
                  <span>Tekening gearchiveerd: Oude Mechanische</span>
                  <small>5 dagen geleden door System</small>
                </Space>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Upload Modal */}
      <Modal
        title="Tekening Uploaden"
        open={uploadModalVisible}
        onOk={handleUpload}
        onCancel={() => {
          setUploadModalVisible(false);
          setFileList([]);
        }}
        okText={uploading ? 'Uploaden...' : 'Uploaden'}
        cancelText="Annuleren"
        okButtonProps={{ loading: uploading }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Upload.Dragger {...uploadProps} style={{ padding: 20 }}>
            <p className="ant-upload-drag-icon">
              <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">
              Klik of sleep bestanden naar dit gebied om te uploaden
            </p>
            <p className="ant-upload-hint">
              Ondersteunde formaten: DWG, PDF, PNG, JPG, GIF
            </p>
          </Upload.Dragger>

          <div>
            <h4>Upload Details</h4>
            <Row gutter={16}>
              <Col span={12}>
                <Input placeholder="Titel" />
              </Col>
              <Col span={12}>
                <Select placeholder="Categorie" style={{ width: '100%' }}>
                  <Option value="architecture">Architectuur</Option>
                  <Option value="structural">Constructie</Option>
                  <Option value="electrical">Elektra</Option>
                  <Option value="plumbing">Sanitair</Option>
                </Select>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Select placeholder="Project" style={{ width: '100%' }}>
                  <Option value="main-tower">Main Tower</Option>
                  <Option value="park-plaza">Park Plaza</Option>
                  <Option value="sunset-res">Sunset Residence</Option>
                </Select>
              </Col>
              <Col span={12}>
                <Input placeholder="Versie (bijv. 1.0)" />
              </Col>
            </Row>
            <TextArea
              placeholder="Beschrijving (optioneel)"
              rows={3}
              style={{ marginTop: 12 }}
            />
          </div>

          {fileList.length > 0 && (
            <div>
              <h4>Selected Files:</h4>
              <List
                size="small"
                dataSource={fileList}
                renderItem={(file) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<FileOutlined />}
                      title={file.name}
                      description={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </Space>
      </Modal>

      {/* View Drawing Modal */}
      <Modal
        title={selectedDrawing?.title}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={1000}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => selectedDrawing && handleDownload(selectedDrawing)}>
            Download
          </Button>,
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Sluiten
          </Button>,
        ]}
      >
        {selectedDrawing && (
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card
                title="Preview"
                extra={
                  <Space>
                    <Tooltip title="Zoom in">
                      <Button icon={<ZoomInOutlined />} />
                    </Tooltip>
                    <Tooltip title="Draai">
                      <Button icon={<RotateRightOutlined />} />
                    </Tooltip>
                  </Space>
                }
              >
                <div style={{
                  height: 500,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <PictureOutlined style={{ fontSize: 64, color: '#999' }} />
                    <div style={{ marginTop: 16 }}>
                      {selectedDrawing.fileName}
                    </div>
                    <div style={{ color: '#666', marginTop: 8 }}>
                      {selectedDrawing.fileSize} • PDF/DWG Viewer zou hier zijn
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Details" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Bestandsnaam">
                    {selectedDrawing.fileName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Grootte">
                    {selectedDrawing.fileSize}
                  </Descriptions.Item>
                  <Descriptions.Item label="Categorie">
                    <Tag>{getCategoryLabel(selectedDrawing.category)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Versie">
                    v{selectedDrawing.version}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={statusConfig[selectedDrawing.status].color}>
                      {statusConfig[selectedDrawing.status].text}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Geüpload door">
                    {selectedDrawing.uploadedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Upload datum">
                    {dayjs(selectedDrawing.uploadDate).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Laatst gewijzigd">
                    {dayjs(selectedDrawing.lastModified).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Tags" size="small" style={{ marginTop: 16 }}>
                <Space wrap>
                  {selectedDrawing.tags.map((tag, index) => (
                    <Tag key={index} icon={<TagOutlined />}>
                      {tag}
                    </Tag>
                  ))}
                  <Button type="dashed" size="small">+ Tag</Button>
                </Space>
              </Card>

              <Card title="Statistieken" size="small" style={{ marginTop: 16 }}>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Statistic title="Bekeken" value={selectedDrawing.views} prefix={<EyeOutlined />} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Downloads" value={selectedDrawing.downloads} prefix={<DownloadOutlined />} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Revisies" value={selectedDrawing.revisions} prefix={<HistoryOutlined />} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Favorieten" value={8} prefix={<StarOutlined />} />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default DrawingsSection;
