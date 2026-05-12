// components/AdminLayout.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Breadcrumb,
  theme,
  Badge,
  Tooltip,
  ConfigProvider
} from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  HomeOutlined,
  ApartmentOutlined,
  BuildOutlined,
  CalculatorOutlined,
  FolderOutlined,
  WalletOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  MailOutlined,
  ScheduleOutlined,
  ContainerOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { token } = theme.useToken();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuClick = ({ key }) => {
    const routes = {
      'dashboard': '/dashboard',
      'administratie': '/administratie',
      'bim': '/bim',
      'bouwplaats': 'https://github.com/oamatiskak-star/bouwplaatsweb/blob/main/pages/bouwplaatsApp/index.js',
      'calculatie': '/calculaties',
      'constructie': '/constructie',
      'documenten': '/documenten',
      'financien': '/financien',
      'financieringen': '/financiering',
      'inkoop': '/inkoop',
      'kopersportaal': '/kopersportaal',
      'mail': '/mail',
      'planning': '/planning',
      'projecten': '/projecten',
      'projectportaal': '/projectportaal',
      'instellingen': '/instellingen'
    };
    
    const target = routes[key];
    if (!target) {
      console.warn('No route found for key:', key);
      return;
    }
    
    console.log('Navigating to:', target);
    
    if (target.startsWith('http')) {
      window.open(target, '_blank');
    } else {
      router.push(target);
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: 'administratie',
      icon: <FileTextOutlined />,
      label: 'Administratie',
    },
    {
      key: 'bim',
      icon: <ApartmentOutlined />,
      label: 'BIM',
    },
    {
      key: 'bouwplaats',
      icon: <BuildOutlined />,
      label: 'Bouwplaats'
    },
    {
      key: 'calculatie',
      icon: <CalculatorOutlined />,
      label: 'Calculatie',
    },
    {
      key: 'constructie',
      icon: <SettingOutlined />,
      label: 'Constructie'
    },
    {
      key: 'documenten',
      icon: <FolderOutlined />,
      label: 'Documenten'
    },
    {
      key: 'financien',
      icon: <WalletOutlined />,
      label: 'Financiën'
    },
    {
      key: 'financiering',
      icon: <PercentageOutlined />,
      label: 'Financieringen'
    },
    {
      key: 'inkoop',
      icon: <ShoppingOutlined />,
      label: 'Inkoop'
    },
    {
      key: 'kopersportaal',
      icon: <UserOutlined />,
      label: 'Kopersportaal'
    },
    {
      key: 'mail',
      icon: <MailOutlined />,
      label: 'Mail'
    },
    {
      key: 'planning',
      icon: <ScheduleOutlined />,
      label: 'Planning'
    },
    {
      key: 'projecten',
      icon: <ProjectOutlined />,
      label: 'Projecten'
    },
    {
      key: 'projectportaal',
      icon: <ContainerOutlined />,
      label: 'Projectportaal'
    },
    {
      key: 'instellingen',
      icon: <SettingOutlined />,
      label: 'Instellingen'
    }
  ];

 const getBreadcrumbItems = () => {
    const path = router.pathname;
    const parts = path.split('/').filter(p => p);
    
    const items = [
      {
        title: <HomeOutlined />,
        onClick: () => router.push('/dashboard')
      }
    ];
    
    parts.forEach(part => {
      const title = part.charAt(0).toUpperCase() + part.slice(1);
      items.push({ title });
    });
    
    return items;
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f2f5'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6
        }
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          width={250}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            position: 'fixed',
            height: '100vh',
            zIndex: 1000,
            overflow: 'auto'
          }}
        >
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
              width: 36,
              height: 36,
              background: token.colorPrimary,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ProjectOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            {!collapsed && (
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '18px',
                color: token.colorPrimary,
                marginLeft: 12
              }}>
                Sterkbouw Admin
              </span>
            )}
          </div>

          <Menu
            mode="inline"
            selectedKeys={[router.pathname.split('/')[1] || 'dashboard']}
            defaultOpenKeys={[]}
            style={{
              borderRight: 0,
              background: '#fff',
              marginTop: '16px'
            }}
            items={menuItems}
            onClick={handleMenuClick}
            expandIcon={null}
            inlineIndent={16}
          />
        </Sider>

        <Layout style={{ marginLeft: collapsed ? 80 : 250 }}>
          <Header style={{
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: '-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '18px', width: 48, height: 48 }}
              />
              
              <Breadcrumb
                items={getBreadcrumbItems()}
                style={{ marginLeft: '16px' }}
              />
            </div>

            <Space>
              <Tooltip title="Zoeken">
                <Button 
                  type="text" 
                  icon={<SearchOutlined />}
                />
              </Tooltip>
              
              <Tooltip title="Notificaties">
                <Badge count={3}>
                  <Button 
                    type="text" 
                    icon={<BellOutlined />}
                  />
                </Badge>
              </Tooltip>
              
              <Dropdown
                menu={{
                  items: [
                    { key: 'profile', label: 'Profiel', icon: <UserOutlined /> },
                    { key: 'settings', label: 'Instellingen', icon: <SettingOutlined /> },
                    { type: 'divider' },
                    { 
                      key: 'logout', 
                      label: 'Uitloggen', 
                      icon: <LogoutOutlined />,
                      onClick: handleLogout
                    }
                  ]
                }}
              >
                <Avatar 
                  icon={<UserOutlined />}
                  style={{ cursor: 'pointer', background: token.colorPrimary }}
                />
              </Dropdown>
            </Space>
          </Header>

          <Content style={{ 
            margin: '24px 16px', 
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
            overflow: 'auto'
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
