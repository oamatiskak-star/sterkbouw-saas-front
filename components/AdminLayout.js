// components/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { 
  Layout, Menu, Button, Avatar, Dropdown, Space, 
  Breadcrumb, theme, Divider, Tag, Badge, Tooltip, Switch,
  Card, Row, Col
} from 'antd';
import { 
  DashboardOutlined, ProjectOutlined, FileTextOutlined, 
  PictureOutlined, TeamOutlined, SettingOutlined, 
  UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  LogoutOutlined, NotificationOutlined, SafetyOutlined,
  LockOutlined, ApartmentOutlined, DatabaseOutlined,
  HomeOutlined, BarChartOutlined, FolderOutlined,
  CalendarOutlined, MessageOutlined, BellOutlined,
  SearchOutlined, PlusCircleOutlined, UploadOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState('ADMIN'); // ADMIN, SUPER_ADMIN, PROJECT_MANAGER
  const [darkTheme, setDarkTheme] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nieuw project aangemaakt', time: '10 min geleden', read: false, type: 'project' },
    { id: 2, message: 'Contract #2345 vereist goedkeuring', time: '1 uur geleden', read: false, type: 'contract' },
    { id: 3, message: 'Tekening revisie beschikbaar', time: '2 uur geleden', read: true, type: 'drawing' },
  ]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  
  // Simuleer gebruikersdata
  useEffect(() => {
    // Hier zou je een API call doen om de gebruikersrol op te halen
    const role = localStorage.getItem('userRole') || 'ADMIN';
    setUserRole(role);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    navigate('/login');
  };
  
  const handleMenuClick = ({ key }) => {
    switch(key) {
      case 'dashboard':
        navigate('/admin/dashboard');
        break;
      case 'projects':
        navigate('/admin/projects');
        break;
      case 'project-overview':
        navigate('/admin/project-overview');
        break;
      case 'contracts':
        navigate('/admin/contracts');
        break;
      case 'drawings':
        navigate('/admin/drawings');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      case 'reports':
        navigate('/admin/reports');
        break;
      case 'calendar':
        navigate('/admin/calendar');
        break;
      default:
        break;
    }
  };
  
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mijn Profiel'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Instellingen'
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
      <div style={{ padding: '8px 0' }}>
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
    const pathSnippets = location.pathname.split('/').filter(i => i);
    
    const breadcrumbItems = pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      let title = snippet.charAt(0).toUpperCase() + snippet.slice(1);
      
      // Vertaal routes naar leesbare titels
      const titleMap = {
        'admin': 'Dashboard',
        'dashboard': 'Dashboard',
        'projects': 'Projecten',
        'project-overview': 'Project Overzicht',
        'contracts': 'Contracten',
        'drawings': 'Tekeningen',
        'users': 'Gebruikers',
        'settings': 'Instellingen'
      };
      
      title = titleMap[snippet] || title;
      
      return {
        title: title,
        href: url
      };
    });
    
    return [{ title: <HomeOutlined />, href: '/' }, ...breadcrumbItems];
  };
  
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'project-overview',
      icon: <ProjectOutlined />,
      label: 'Project Overzicht',
    },
    {
      key: 'projects',
      icon: <FolderOutlined />,
      label: 'Projecten',
      children: [
        { key: 'projects-active', label: 'Actieve Projecten' },
        { key: 'projects-archived', label: 'Gearchiveerd' },
        { key: 'projects-templates', label: 'Templates' },
      ]
    },
    {
      key: 'contracts',
      icon: <FileTextOutlined />,
      label: 'Contracten',
      children: [
        { key: 'contracts-all', label: 'Alle Contracten' },
        { key: 'contracts-pending', label: 'In Afwachting', icon: <BellOutlined /> },
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
      key: 'admin',
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
      ]
    }
  ].filter(Boolean);
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={280}
        style={{
          background: darkTheme ? '#141414' : '#fff',
          borderRight: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`
        }}
      >
        {/* Logo sectie */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 16px',
          borderBottom: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 32,
                height: 32,
                background: token.colorPrimary,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ProjectOutlined style={{ color: '#fff' }} />
              </div>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '18px',
                color: darkTheme ? '#fff' : token.colorPrimary 
              }}>
                ProjectPortaal
              </span>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 32,
              height: 32,
              background: token.colorPrimary,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ProjectOutlined style={{ color: '#fff' }} />
            </div>
          )}
        </div>
        
        {/* Gebruikersinfo */}
        {!collapsed && (
          <Card 
            size="small" 
            style={{ 
              margin: '16px',
              background: darkTheme ? '#1f1f1f' : '#fafafa',
              borderColor: darkTheme ? '#303030' : '#f0f0f0'
            }}
          >
            <Row gutter={[8, 8]} align="middle">
              <Col>
                <Avatar 
                  size="large" 
                  style={{ 
                    background: token.colorPrimary,
                    cursor: 'pointer'
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
          selectedKeys={[location.pathname.split('/').pop() || 'dashboard']}
          style={{
            borderRight: 0,
            background: darkTheme ? '#141414' : '#fff',
          }}
          items={menuItems}
          onClick={handleMenuClick}
          theme={darkTheme ? 'dark' : 'light'}
        />
        
        {!collapsed && (
          <div style={{ 
            padding: '16px',
            borderTop: `1px solid ${darkTheme ? '#303030' : '#f0f0f0}`,
            marginTop: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: darkTheme ? '#fff' : '#000' }}>Donker thema</span>
              <Switch 
                checked={darkTheme} 
                onChange={setDarkTheme}
                size="small"
              />
            </div>
          </div>
        )}
      </Sider>
      
      {/* Hoofd layout */}
      <Layout>
        {/* Header */}
        <Header style={{
          padding: '0 16px',
          background: darkTheme ? '#1f1f1f' : '#fff',
          borderBottom: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px' }}
            />
            
            {/* Breadcrumb */}
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{ marginLeft: '16px' }}
            />
          </div>
          
          {/* Header acties */}
          <Space size="middle">
            {/* Zoekbalk */}
            <Tooltip title="Zoeken">
              <Button 
                type="text" 
                icon={<SearchOutlined />}
                style={{ color: darkTheme ? '#fff' : '#000' }}
              />
            </Tooltip>
            
            {/* Snel toevoegen */}
            <Dropdown
              menu={{
                items: [
                  { key: 'new-project', label: 'Nieuw Project', icon: <PlusCircleOutlined /> },
                  { key: 'new-contract', label: 'Nieuw Contract', icon: <FileTextOutlined /> },
                  { key: 'upload-drawing', label: 'Tekening Uploaden', icon: <UploadOutlined /> },
                ]
              }}
              placement="bottomRight"
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
                  { key: 'view-all', label: 'Alle notificaties bekijken' }
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
            >
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                  icon={<UserOutlined />}
                  style={{ background: token.colorPrimary }}
                />
                {!collapsed && (
                  <span style={{ color: darkTheme ? '#fff' : '#000' }}>
                    Johan
                  </span>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>
        
        {/* Hoofd inhoud */}
        <Content style={{ 
          margin: '16px',
          padding: 24,
          background: darkTheme ? '#141414' : '#fff',
          borderRadius: 8,
          minHeight: 280,
          overflow: 'auto'
        }}>
          {children}
        </Content>
        
        {/* Footer */}
        <div style={{ 
          padding: '16px',
          textAlign: 'center',
          borderTop: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`,
          background: darkTheme ? '#1f1f1f' : '#fafafa',
          color: darkTheme ? '#999' : '#666'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <span>© 2024 ProjectPortaal v2.1</span>
            </Col>
            <Col>
              <Space>
                <span>Laatste update: 15 min geleden</span>
                <Divider type="vertical" />
                <span>Status: <Tag color="green">Online</Tag></span>
              </Space>
            </Col>
          </Row>
        </div>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
