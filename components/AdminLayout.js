// components/AdminLayout.js
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Avatar, Dropdown, Space, 
  Breadcrumb, theme, Divider, Tag, Badge, Tooltip, Switch,
  Card, Row, Col, ConfigProvider
} from 'antd';
import { 
  DashboardOutlined, ProjectOutlined, FileTextOutlined, 
  PictureOutlined, TeamOutlined, SettingOutlined, 
  UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  LogoutOutlined, NotificationOutlined, SafetyOutlined,
  LockOutlined, ApartmentOutlined, DatabaseOutlined,
  HomeOutlined, BarChartOutlined, FolderOutlined,
  CalendarOutlined, MessageOutlined, BellOutlined,
  SearchOutlined, PlusCircleOutlined, UploadOutlined,
  CalculatorOutlined, CustomerServiceOutlined, BankOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState('ADMIN'); // ADMIN, SUPER_ADMIN, PROJECT_MANAGER
  const [darkTheme, setDarkTheme] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nieuw project aangemaakt', time: '10 min geleden', read: false, type: 'project' },
    { id: 2, message: 'Contract #2345 vereist goedkeuring', time: '1 uur geleden', read: false, type: 'contract' },
    { id: 3, message: 'Tekening revisie beschikbaar', time: '2 uur geleden', read: true, type: 'drawing' },
  ]);
  
  const router = useRouter();
  const { pathname, query } = router;
  const { token } = theme.useToken();
  
  // Fix voor hydration error
  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('userRole') || 'ADMIN';
    setUserRole(role);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    router.push('/login');
  };
  
  const handleMenuClick = ({ key, keyPath }) => {
    console.log('Menu clicked:', key, keyPath);
    
    // Basis routing logica
    const routes = {
      // Dashboard
      'dashboard': '/admin/dashboard',
      
      // Projecten
      'projects': '/admin/projects',
      'projects-active': '/admin/projects?filter=active',
      'projects-archived': '/admin/projects?filter=archived',
      'projects-templates': '/admin/projects?filter=templates',
      
      // Contracten
      'contracts': '/admin/contracts',
      'contracts-all': '/admin/contracts',
      'contracts-pending': '/admin/contracts?status=pending',
      'contracts-expired': '/admin/contracts?status=expired',
      
      // Tekeningen
      'drawings': '/admin/drawings',
      'drawings-all': '/admin/drawings',
      'drawings-revisions': '/admin/drawings?filter=revisions',
      'drawings-uploads': '/admin/drawings?filter=today',
      
      // Calculaties
      'calculaties': '/calculaties',
      'calculaties-all': '/calculaties',
      'calculaties-nieuw': '/calculaties/nieuw',
      'calculaties-pending': '/calculaties?status=pending',
      
      // Klanten
      'customers': '/admin/customers',
      'customers-all': '/admin/customers',
      'customers-new': '/admin/customers/new',
      'customers-vip': '/admin/customers?type=vip',
      
      // Financieel
      'financial': '/admin/financial',
      'invoices': '/admin/invoices',
      'invoices-all': '/admin/invoices',
      'invoices-pending': '/admin/invoices?status=pending',
      'invoices-paid': '/admin/invoices?status=paid',
      
      // Rapportages
      'reports': '/admin/reports',
      
      // Kalender
      'calendar': '/admin/calendar',
      
      // Super Admin items
      'users': '/admin/users',
      'settings': '/admin/settings',
      'database': '/admin/database',
      'system-logs': '/admin/system-logs',
    };
    
    if (routes[key]) {
      router.push(routes[key]);
    }
  };
  
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mijn Profiel',
      onClick: () => router.push('/admin/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Instellingen',
      onClick: () => router.push('/admin/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Uitloggen',
      onClick: handleLogout
    }
  ];
  
  const notificationItems = notifications.map(notification => ({
    key: notification.id,
    label: (
      <div style={{ padding: '8px 0', minWidth: 250 }}>
        <div style={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
          {notification.message}
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          {notification.time}
        </div>
      </div>
    ),
    icon: notification.type === 'project' ? <ProjectOutlined /> : 
          notification.type === 'contract' ? <FileTextOutlined /> : 
          <PictureOutlined />
  }));
  
  const getBreadcrumbItems = () => {
    const pathSnippets = pathname.split('/').filter(i => i);
    
    const breadcrumbItems = pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      let title = snippet.charAt(0).toUpperCase() + snippet.slice(1);
      
      // Vertaal routes naar leesbare titels
      const titleMap = {
        'admin': 'Dashboard',
        'dashboard': 'Dashboard',
        'calculaties': 'Calculaties',
        'nieuw': 'Nieuwe Calculatie',
        'projects': 'Projecten',
        'project-overview': 'Project Overzicht',
        'contracts': 'Contracten',
        'drawings': 'Tekeningen',
        'customers': 'Klanten',
        'financial': 'Financieel',
        'invoices': 'Facturen',
        'users': 'Gebruikers',
        'settings': 'Instellingen',
        'reports': 'Rapportages',
        'calendar': 'Kalender',
        'profile': 'Profiel'
      };
      
      title = titleMap[snippet] || title;
      
      return {
        title: title,
        onClick: () => router.push(url)
      };
    });
    
    return [{ title: <HomeOutlined />, onClick: () => router.push('/') }, ...breadcrumbItems];
  };
  
  const getSelectedKeys = () => {
    const path = pathname;
    
    // Map routes naar menu keys
    if (path.includes('/admin/dashboard')) return ['dashboard'];
    if (path.includes('/calculaties/nieuw')) return ['calculaties-nieuw'];
    if (path.includes('/calculaties')) return ['calculaties'];
    if (path.includes('/admin/projects')) {
      if (query.filter === 'active') return ['projects-active'];
      if (query.filter === 'archived') return ['projects-archived'];
      if (query.filter === 'templates') return ['projects-templates'];
      return ['projects'];
    }
    if (path.includes('/admin/contracts')) {
      if (query.status === 'pending') return ['contracts-pending'];
      if (query.status === 'expired') return ['contracts-expired'];
      return ['contracts'];
    }
    if (path.includes('/admin/drawings')) {
      if (query.filter === 'revisions') return ['drawings-revisions'];
      if (query.filter === 'today') return ['drawings-uploads'];
      return ['drawings'];
    }
    if (path.includes('/admin/customers')) return ['customers'];
    if (path.includes('/admin/invoices')) {
      if (query.status === 'pending') return ['invoices-pending'];
      if (query.status === 'paid') return ['invoices-paid'];
      return ['invoices'];
    }
    if (path.includes('/admin/financial')) return ['financial'];
    if (path.includes('/admin/reports')) return ['reports'];
    if (path.includes('/admin/calendar')) return ['calendar'];
    if (path.includes('/admin/users')) return ['users'];
    if (path.includes('/admin/settings')) return ['settings'];
    if (path.includes('/admin/database')) return ['database'];
    if (path.includes('/admin/system-logs')) return ['system-logs'];
    
    return ['dashboard'];
  };
  
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'Projecten',
      children: [
        { key: 'projects-active', label: 'Actieve Projecten' },
        { key: 'projects-archived', label: 'Gearchiveerd' },
        { key: 'projects-templates', label: 'Templates' },
      ]
    },
    {
      key: 'calculaties',
      icon: <CalculatorOutlined />,
      label: 'Calculaties',
      children: [
        { key: 'calculaties-all', label: 'Alle Calculaties' },
        { key: 'calculaties-nieuw', label: 'Nieuwe Calculatie' },
        { key: 'calculaties-pending', label: 'In Afwachting' },
      ]
    },
    {
      key: 'contracts',
      icon: <FileTextOutlined />,
      label: 'Contracten',
      children: [
        { key: 'contracts-all', label: 'Alle Contracten' },
        { key: 'contracts-pending', label: 'In Afwachting' },
        { key: 'contracts-expired', label: 'Verlopen' },
      ]
    },
    {
      key: 'drawings',
      icon: <PictureOutlined />,
      label: 'Tekeningen',
      children: [
        { key: 'drawings-all', label: 'Alle Tekeningen' },
        { key: 'drawings-revisions', label: 'Revisies' },
        { key: 'drawings-uploads', label: 'Uploads Vandaag' },
      ]
    },
    {
      key: 'customers',
      icon: <CustomerServiceOutlined />,
      label: 'Klanten',
      children: [
        { key: 'customers-all', label: 'Alle Klanten' },
        { key: 'customers-new', label: 'Nieuwe Klant' },
        { key: 'customers-vip', label: 'VIP Klanten' },
      ]
    },
    {
      key: 'financial',
      icon: <BankOutlined />,
      label: 'Financieel',
      children: [
        { key: 'invoices-all', label: 'Facturen' },
        { key: 'invoices-pending', label: 'Openstaand' },
        { key: 'invoices-paid', label: 'Betaald' },
      ]
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Rapportages',
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: 'Kalender',
    },
    // SUPER_ADMIN alleen items
    userRole === 'SUPER_ADMIN' && {
      key: 'super-admin',
      icon: <SafetyOutlined />,
      label: 'Super Admin',
      type: 'group',
      children: [
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: 'Gebruikersbeheer',
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Systeeminstellingen',
        },
        {
          key: 'database',
          icon: <DatabaseOutlined />,
          label: 'Database',
        },
        {
          key: 'system-logs',
          icon: <ApartmentOutlined />,
          label: 'System Logs',
        },
      ]
    }
  ].filter(Boolean);
  
  if (!mounted) {
    return <div style={{ padding: 50, textAlign: 'center' }}>Loading...</div>;
  }
  
  return (
    <ConfigProvider
      theme={{
        algorithm: darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
        components: {
          Layout: {
            headerBg: darkTheme ? '#1f1f1f' : '#fff',
            bodyBg: darkTheme ? '#000' : '#f0f2f5',
            siderBg: darkTheme ? '#141414' : '#fff',
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          width={260}
          style={{
            background: darkTheme ? '#141414' : '#fff',
            borderRight: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`,
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {/* Logo sectie */}
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`
          }}>
            <div style={{
              width: 36,
              height: 36,
              background: token.colorPrimary,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ProjectOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            {!collapsed && (
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '18px',
                color: darkTheme ? '#fff' : token.colorPrimary,
                marginLeft: 12,
                whiteSpace: 'nowrap'
              }}>
                Sterkbouw
              </span>
            )}
          </div>
          
          {/* Gebruikersinfo */}
          {!collapsed && (
            <Card 
              size="small" 
              style={{ 
                margin: '16px',
                background: darkTheme ? '#1f1f1f' : '#fafafa',
                borderColor: darkTheme ? '#303030' : '#f0f0f0',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/admin/profile')}
            >
              <Row gutter={[12, 12]} align="middle">
                <Col>
                  <Avatar 
                    size="large" 
                    style={{ 
                      background: token.colorPrimary,
                    }}
                    icon={<UserOutlined />}
                  />
                </Col>
                <Col flex="auto">
                  <div style={{ fontWeight: 'bold', color: darkTheme ? '#fff' : '#000' }}>
                    Johan de Vries
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {userRole === 'SUPER_ADMIN' ? 'Super Admin' : 
                     userRole === 'ADMIN' ? 'Administrator' : 'Project Manager'}
                  </div>
                  <Tag 
                    color={userRole === 'SUPER_ADMIN' ? 'red' : 
                           userRole === 'ADMIN' ? 'blue' : 'green'}
                    style={{ marginTop: '4px', fontSize: '10px' }}
                  >
                    {userRole}
                  </Tag>
                </Col>
              </Row>
            </Card>
          )}
          
          {/* Navigatie menu */}
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={['projects', 'calculaties', 'contracts', 'drawings', 'customers', 'financial']}
            style={{
              borderRight: 0,
              background: darkTheme ? '#141414' : '#fff',
              padding: '8px 0'
            }}
            items={menuItems}
            onClick={handleMenuClick}
            theme={darkTheme ? 'dark' : 'light'}
            inlineIndent={12}
          />
          
          {!collapsed && (
            <div style={{ 
              padding: '16px',
              borderTop: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`,
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: darkTheme ? '#fff' : '#000', fontSize: '14px' }}>Donker thema</span>
                <Switch 
                  checked={darkTheme} 
                  onChange={setDarkTheme}
                  size="small"
                />
              </div>
            </div>
          )}
        </Sider>
        
        {/* Hoofd layout met margin voor sidebar */}
        <Layout style={{ 
          marginLeft: collapsed ? 80 : 260,
          transition: 'margin-left 0.2s',
          minHeight: '100vh'
        }}>
          {/* Header */}
          <Header style={{
            padding: '0 24px',
            background: darkTheme ? '#1f1f1f' : '#fff',
            borderBottom: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            height: 64
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '18px', width: 48, height: 48 }}
              />
              
              {/* Breadcrumb */}
              <Breadcrumb
                items={getBreadcrumbItems()}
                style={{ marginLeft: '8px' }}
              />
            </div>
            
            {/* Header acties */}
            <Space size="middle" style={{ marginRight: 8 }}>
              {/* Zoekbalk */}
              <Tooltip title="Zoeken">
                <Button 
                  type="text" 
                  icon={<SearchOutlined />}
                  style={{ color: darkTheme ? '#fff' : '#000', fontSize: '18px' }}
                  onClick={() => router.push('/admin/search')}
                />
              </Tooltip>
              
              {/* Snel toevoegen */}
              <Dropdown
                menu={{
                  items: [
                    { 
                      key: 'new-project', 
                      label: 'Nieuw Project', 
                      icon: <PlusCircleOutlined />,
                      onClick: () => router.push('/admin/projects/new')
                    },
                    { 
                      key: 'new-calculatie', 
                      label: 'Nieuwe Calculatie', 
                      icon: <CalculatorOutlined />,
                      onClick: () => router.push('/calculaties/nieuw')
                    },
                    { 
                      key: 'new-contract', 
                      label: 'Nieuw Contract', 
                      icon: <FileTextOutlined />,
                      onClick: () => router.push('/admin/contracts/new')
                    },
                    { 
                      key: 'upload-drawing', 
                      label: 'Tekening Uploaden', 
                      icon: <UploadOutlined />,
                      onClick: () => router.push('/admin/drawings/upload')
                    },
                  ]
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button 
                  type="primary" 
                  icon={<PlusCircleOutlined />}
                  size="middle"
                >
                  Nieuw
                </Button>
              </Dropdown>
              
              {/* Notificaties */}
              <Dropdown
                menu={{
                  items: [
                    ...notificationItems,
                    { type: 'divider' },
                    { 
                      key: 'view-all', 
                      label: 'Alle notificaties bekijken',
                      onClick: () => router.push('/admin/notifications')
                    }
                  ]
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Badge count={notifications.filter(n => !n.read).length} size="small">
                  <Button 
                    type="text" 
                    icon={<BellOutlined />}
                    style={{ fontSize: '18px', color: darkTheme ? '#fff' : '#000' }}
                  />
                </Badge>
              </Dropdown>
              
              {/* Gebruikersmenu */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar 
                    icon={<UserOutlined />}
                    style={{ background: token.colorPrimary }}
                  />
                  {!collapsed && (
                    <span style={{ color: darkTheme ? '#fff' : '#000', fontWeight: 500 }}>
                      Johan
                    </span>
                  )}
                </div>
              </Dropdown>
            </Space>
          </Header>
          
          {/* Hoofd inhoud */}
          <Content style={{ 
            margin: '24px 16px',
            padding: 24,
            background: darkTheme ? '#141414' : '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
            overflow: 'auto'
          }}>
            {children}
          </Content>
          
          {/* Footer */}
          <div style={{ 
            padding: '16px 24px',
            textAlign: 'center',
            borderTop: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`,
            background: darkTheme ? '#1f1f1f' : '#fafafa',
            color: darkTheme ? '#999' : '#666',
            fontSize: '14px'
          }}>
            <Row justify="space-between" align="middle">
              <Col>
                <span>© {new Date().getFullYear()} Sterkbouw Admin v2.1</span>
              </Col>
              <Col>
                <Space split={<Divider type="vertical" />}>
                  <span>
                    Status: <Tag color="green" style={{ marginLeft: 4 }}>Online</Tag>
                  </span>
                  <span>Laatste update: 15 min geleden</span>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/admin/system-status');
                    }}
                    style={{ color: token.colorPrimary }}
                  >
                    System Status
                  </a>
                </Space>
              </Col>
            </Row>
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
