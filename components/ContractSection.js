// components/ContractSection.js
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Tag, Input, Modal, Form, Select,
  Upload, message, Card, Row, Col, Statistic, DatePicker,
  Tooltip, Popconfirm, Dropdown, Badge, Divider, Descriptions
} from 'antd';
import {
  SearchOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, DownloadOutlined,
  UploadOutlined, FilePdfOutlined, FileWordOutlined,
  FileExcelOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined,
  FilterOutlined, MoreOutlined, ShareAltOutlined,
  SignatureOutlined, HistoryOutlined, CopyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './ContractSection.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ContractSection = () => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  const [form] = Form.useForm();

  // Status kleuren mapping
  const statusColors = {
    draft: 'default',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    expired: 'purple',
    signed: 'blue',
    archived: 'gray'
  };

  // Status labels
  const statusLabels = {
    draft: 'Concept',
    pending: 'In Afwachting',
    approved: 'Goedgekeurd',
    rejected: 'Afgewezen',
    expired: 'Verlopen',
    signed: 'Ondertekend',
    archived: 'Gearchiveerd'
  };

  // Voorbeeld data
  const mockContracts = [
    {
      id: 'CT-2024-001',
      title: 'Bouwcontract Main Tower',
      client: 'Van der Valk Bouw',
      value: '€ 2.500.000',
      status: 'approved',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      projectId: 'PRJ-001',
      lastUpdated: '2024-02-20',
      documents: 5,
      assignee: 'Jansen Contracten',
      riskLevel: 'medium',
      signDeadline: '2024-02-28'
    },
    {
      id: 'CT-2024-002',
      title: 'Infrastructuur Overeenkomst',
      client: 'Rijkswaterstaat',
      value: '€ 4.200.000',
      status: 'pending',
      startDate: '2024-02-01',
      endDate: '2025-06-30',
      projectId: 'PRJ-002',
      lastUpdated: '2024-02-18',
      documents: 3,
      assignee: 'De Vries Legal',
      riskLevel: 'low',
      signDeadline: '2024-03-15'
    },
    {
      id: 'CT-2024-003',
      title: 'Onderhoudscontract Faciliteiten',
      client: 'Facility Solutions BV',
      value: '€ 850.000',
      status: 'draft',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      projectId: 'PRJ-003',
      lastUpdated: '2024-02-19',
      documents: 2,
      assignee: 'Peters Beheer',
      riskLevel: 'high',
      signDeadline: '2024-02-25'
    },
    {
      id: 'CT-2024-004',
      title: 'Consultancy Overeenkomst',
      client: 'Engineering Partners',
      value: '€ 1.200.000',
      status: 'signed',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      projectId: 'PRJ-004',
      lastUpdated: '2024-02-10',
      documents: 4,
      assignee: 'Consult Group',
      riskLevel: 'low',
      signDeadline: '2024-01-31'
    },
    {
      id: 'CT-2023-015',
      title: 'Verlopen Test Contract',
      client: 'Testbedrijf BV',
      value: '€ 500.000',
      status: 'expired',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      projectId: 'PRJ-015',
      lastUpdated: '2023-12-15',
      documents: 1,
      assignee: 'Test Manager',
      riskLevel: 'medium',
      signDeadline: '2023-01-15'
    }
  ];

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = () => {
    setLoading(true);
    // Simuleer API call
    setTimeout(() => {
      setContracts(mockContracts);
      setFilteredContracts(mockContracts);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = contracts.filter(contract =>
      contract.title.toLowerCase().includes(value.toLowerCase()) ||
      contract.client.toLowerCase().includes(value.toLowerCase()) ||
      contract.id.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredContracts(filtered);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredContracts(contracts);
    } else {
      const filtered = contracts.filter(contract => contract.status === status);
      setFilteredContracts(filtered);
    }
  };

  const handleCreateContract = () => {
    setCurrentContract(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditContract = (contract) => {
    setCurrentContract(contract);
    form.setFieldsValue({
      title: contract.title,
      client: contract.client,
      value: contract.value.replace('€ ', ''),
      status: contract.status,
      startDate: dayjs(contract.startDate),
      endDate: dayjs(contract.endDate),
      projectId: contract.projectId,
      assignee: contract.assignee,
      riskLevel: contract.riskLevel
    });
    setIsModalVisible(true);
  };

  const handleDeleteContract = (contractId) => {
    setContracts(contracts.filter(c => c.id !== contractId));
    setFilteredContracts(filteredContracts.filter(c => c.id !== contractId));
    message.success('Contract verwijderd');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newContract = {
        id: currentContract ? currentContract.id : `CT-2024-${String(contracts.length + 1).padStart(3, '0')}`,
        title: values.title,
        client: values.client,
        value: `€ ${values.value}`,
        status: values.status,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        projectId: values.projectId,
        lastUpdated: dayjs().format('YYYY-MM-DD'),
        documents: currentContract ? currentContract.documents : 0,
        assignee: values.assignee,
        riskLevel: values.riskLevel,
        signDeadline: values.endDate.subtract(1, 'month').format('YYYY-MM-DD')
      };

      if (currentContract) {
        // Update bestaand contract
        setContracts(contracts.map(c => c.id === currentContract.id ? newContract : c));
        message.success('Contract bijgewerkt');
      } else {
        // Nieuw contract
        setContracts([newContract, ...contracts]);
        message.success('Contract aangemaakt');
      }

      setFilteredContracts([newContract, ...filteredContracts.filter(c => c.id !== newContract.id)]);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const getRiskBadge = (riskLevel) => {
    const riskConfig = {
      low: { color: 'green', text: 'Laag' },
      medium: { color: 'orange', text: 'Medium' },
      high: { color: 'red', text: 'Hoog' }
    };
    const config = riskConfig[riskLevel] || riskConfig.medium;
    return <Badge color={config.color} text={config.text} />;
  };

  const columns = [
    {
      title: 'Contract ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
      width: 150,
    },
    {
      title: 'Titel',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      width: 250,
    },
    {
      title: 'Klant',
      dataIndex: 'client',
      key: 'client',
      width: 200,
    },
    {
      title: 'Waarde',
      dataIndex: 'value',
      key: 'value',
      sorter: (a, b) => parseFloat(a.value.replace(/[^\d.-]/g, '')) - parseFloat(b.value.replace(/[^\d.-]/g, '')),
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      ),
      width: 150,
    },
    {
      title: 'Risico',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (riskLevel) => getRiskBadge(riskLevel),
      width: 120,
    },
    {
      title: 'Documenten',
      dataIndex: 'documents',
      key: 'documents',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      ),
      width: 120,
    },
    {
      title: 'Einddatum',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
      width: 150,
    },
    {
      title: 'Acties',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Bekijken">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => message.info(`Details van ${record.title}`)}
            />
          </Tooltip>
          <Tooltip title="Bewerken">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditContract(record)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => message.success('Download gestart')}
            />
          </Tooltip>
          <Popconfirm
            title="Contract verwijderen?"
            description="Weet u zeker dat u dit contract wilt verwijderen?"
            onConfirm={() => handleDeleteContract(record.id)}
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
          <Dropdown
            menu={{
              items: [
                { key: 'history', label: 'Geschiedenis', icon: <HistoryOutlined /> },
                { key: 'duplicate', label: 'Dupliceren', icon: <CopyOutlined /> },
                { key: 'share', label: 'Delen', icon: <ShareAltOutlined /> },
                { key: 'sign', label: 'Ondertekenen', icon: <SignatureOutlined /> },
              ]
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const getStats = () => {
    const totalValue = contracts.reduce((sum, c) => {
      return sum + parseFloat(c.value.replace(/[^\d.-]/g, ''));
    }, 0);
    
    const pendingCount = contracts.filter(c => c.status === 'pending').length;
    const expiringSoon = contracts.filter(c => {
      const daysUntilEnd = dayjs(c.endDate).diff(dayjs(), 'days');
      return daysUntilEnd > 0 && daysUntilEnd <= 30;
    }).length;

    return {
      totalValue: totalValue.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' }),
      totalContracts: contracts.length,
      pendingCount,
      expiringSoon
    };
  };

  const stats = getStats();

  return (
    <div className="contract-section">
      {/* Statistieken boven */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Totaal Waarde"
              value={stats.totalValue}
              prefix="€"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Aantal Contracten"
              value={stats.totalContracts}
              prefix={<FilePdfOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="In Afwachting"
              value={stats.pendingCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Verlopen binnen 30d"
              value={stats.expiringSoon}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters en zoeken */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={12} lg={8}>
            <Search
              placeholder="Zoek contracten..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Space>
              <Select
                placeholder="Filter op status"
                style={{ width: 200 }}
                onChange={handleStatusFilter}
                value={statusFilter}
                allowClear
              >
                <Option value="all">Alle Statussen</Option>
                <Option value="draft">Concept</Option>
                <Option value="pending">In Afwachting</Option>
                <Option value="approved">Goedgekeurd</Option>
                <Option value="signed">Ondertekend</Option>
                <Option value="expired">Verlopen</Option>
              </Select>
              <Button icon={<FilterOutlined />}>Meer Filters</Button>
            </Space>
          </Col>
          <Col xs={24} md={12} lg={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateContract}
                size="large"
              >
                Nieuw Contract
              </Button>
              <Button
                icon={<UploadOutlined />}
                size="large"
              >
                Importeer
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Contracten tabel */}
      <Card
        title="Contracten Overzicht"
        extra={
          <span>
            Laatste update: {dayjs().format('DD/MM/YYYY HH:mm')}
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredContracts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} van ${total} contracten`
          }}
          expandable={{
            expandedRowRender: (record) => (
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Project ID">{record.projectId}</Descriptions.Item>
                <Descriptions.Item label="Toegewezen aan">{record.assignee}</Descriptions.Item>
                <Descriptions.Item label="Startdatum">
                  {dayjs(record.startDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Onderteken deadline">
                  {dayjs(record.signDeadline).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Laatst bijgewerkt">
                  {dayjs(record.lastUpdated).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Documenten">
                  <Space>
                    <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                    <FileWordOutlined style={{ color: '#1890ff' }} />
                    <FileExcelOutlined style={{ color: '#52c41a' }} />
                    <span>({record.documents})</span>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            ),
            rowExpandable: (record) => record.documents > 0,
          }}
        />
      </Card>

      {/* Contract modal */}
      <Modal
        title={currentContract ? 'Contract Bewerken' : 'Nieuw Contract Aanmaken'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
        okText={currentContract ? 'Bijwerken' : 'Aanmaken'}
        cancelText="Annuleren"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft',
            riskLevel: 'medium'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Contract Titel"
                rules={[{ required: true, message: 'Voer een titel in' }]}
              >
                <Input placeholder="Bijv. Bouwcontract Main Tower" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="client"
                label="Klant"
                rules={[{ required: true, message: 'Selecteer een klant' }]}
              >
                <Select placeholder="Selecteer klant">
                  <Option value="Van der Valk Bouw">Van der Valk Bouw</Option>
                  <Option value="Rijkswaterstaat">Rijkswaterstaat</Option>
                  <Option value="Facility Solutions BV">Facility Solutions BV</Option>
                  <Option value="Engineering Partners">Engineering Partners</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="value"
                label="Contract Waarde"
                rules={[{ required: true, message: 'Voer een waarde in' }]}
              >
                <Input
                  type="number"
                  prefix="€"
                  placeholder="2500000"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="draft">Concept</Option>
                  <Option value="pending">In Afwachting</Option>
                  <Option value="approved">Goedgekeurd</Option>
                  <Option value="signed">Ondertekend</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="riskLevel"
                label="Risico Niveau"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="low">Laag</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">Hoog</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="startDate"
                label="Startdatum"
                rules={[{ required: true, message: 'Selecteer startdatum' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="endDate"
                label="Einddatum"
                rules={[{ required: true, message: 'Selecteer einddatum' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="projectId"
                label="Project ID"
                rules={[{ required: true, message: 'Voer project ID in' }]}
              >
                <Input placeholder="PRJ-001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignee"
                label="Toegewezen aan"
              >
                <Input placeholder="Naam van verantwoordelijke" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="documents"
                label="Document Upload"
              >
                <Upload
                  multiple
                  beforeUpload={() => false}
                  maxCount={5}
                  accept=".pdf,.doc,.docx,.xlsx"
                >
                  <Button icon={<UploadOutlined />}>Selecteer bestanden</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Beschrijving"
          >
            <TextArea rows={4} placeholder="Optionele beschrijving van het contract..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractSection;
