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

  // 🔥 ALLE JUISTE ROUTES volgens je laatste update
  const ALL_ROUTES = {
    // Hoofdmenu items - navigeren naar index pagina's
    'dashboard': '/dashboard',
    'administratie': '/administratie',
    'bim': '/bim',
    'bouwplaats': 'https://github.com/oamatiskak-star/bouwplaatsweb/blob/main/pages/bouwplaatsApp/index.js',
    'calculatie': '/calculaties', // 🔥 NAAR /calculaties
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
    'instellingen': '/instellingen',
    
    // Submenu items (optioneel, als je die pagina's hebt)
    'administratie-contracten': '/administratie/contracten',
    'administratie-klanten': '/administratie/klanten',
    'administratie-dossiers': '/administratie/dossiers',
    'administratie-auditlog': '/administratie/auditlog',
    'administratie-compliance': '/administratie/compliance',
    
    'bim-modellen': '/bim/modellen',
    'bim-versiebeheer': '/bim/versiebeheer',
    'bim-clash-detection': '/bim/clash-detection',
    'bim-export': '/bim/export',
    
    'calculatie-nieuw': '/calculaties/nieuw',
    'calculatie-meerwerk': '/calculaties/meerwerk',
    'calculatie-offertes': '/calculaties/offertes',
    'calculatie-historie': '/calculaties/historie'
  };

  // Simpele click handler voor ALLES
  const handleMenuClick = ({ key }) => {
    console.log('Menu clicked:', key);
    
    const target = ALL_ROUTES[key];
    if (!target) {
      console.warn('Geen route gevonden voor:', key);
      return;
    }
    
    console.log('Navigating to:', target);
    
    if (target.startsWith('http')) {
      window.open(target, '_blank');
    } else {
      router.push(target);
    }
  };

  // 🔥 Menu items - ALLEEN voor hoofdmenu's die submenu's hebben
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
      children: [
        { key: 'administratie-contracten', label: 'Contractbeheer' },
        { key: 'administratie-klanten', label: 'Klantgegevens' },
        { key: 'administratie-dossiers', label: 'Dossierstructuur' },
        { key: 'administratie-auditlog', label: 'Auditlog' },
        { key: 'administratie-compliance', label: 'Compliance' }
      ]
    },
    {
      key: 'bim',
      icon: <ApartmentOutlined />,
      label: 'BIM',
      children: [
        { key: 'bim-modellen', label: 'BIM-modellen' },
        { key: 'bim-versiebeheer', label: 'Versiebeheer' },
        { key: 'bim-clash-detection', label: 'Clash detection' },
        { key: 'bim-export', label: 'Export' }
      ]
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
      children: [
        { key: 'calculatie-nieuw', label: 'Nieuwe Calculatie' },
        { key: 'calculatie-meerwerk', label: 'Meerwerk' },
        { key: 'calculatie-offertes', label: 'Offertegeneratie' },
        { key: 'calculatie-historie', label: 'Historie' }
      ]
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
      key: 'financieringen',
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

  // Simpele breadcrumb
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

  // Simpele logout
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
        {/* Sidebar */}
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
          {/* Logo */}
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

          {/* Menu */}
          <Menu
            mode="inline"
            selectedKeys={[router.pathname.split('/')[1] || 'dashboard']}
            defaultOpenKeys={[]} // 🔥 GEEN uitgeklapte submenu's
            style={{
              borderRight: 0,
              background: '#fff',
              marginTop: '16px'
            }}
            items={menuItems}
            onClick={handleMenuClick}
            expandIcon={null} // 🔥 Verberg pijltjes
            inlineIndent={16}
          />
        </Sider>

        {/* Main Layout */}
        <Layout style={{ marginLeft: collapsed ? 80 : 250 }}>
          {/* Header */}
          <Header style={{
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
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

          {/* Content */}
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
