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
  Tag,
  Badge,
  Tooltip,
  Switch,
  Card,
  Row,
  Col,
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
  PlusCircleOutlined,
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

// Simpele route mapping voor hoofdmenu's
const MAIN_ROUTES = {
  'dashboard': '/dashboard',
  'administratie': '/administratie',
  'bim': '/bim',
  'bouwplaats': 'https://bouwplaats.sterkbouw.nl',
  'calculatie': '/calculaties/nieuw',
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

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  
  const router = useRouter();
  const { token } = theme.useToken();

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // SIMPELE click handler
  const handleMenuClick = ({ key }) => {
    console.log('Menu clicked:', key);
    
    // Check of het een hoofdmenu item is
    if (MAIN_ROUTES[key]) {
      const target = MAIN_ROUTES[key];
      if (target.startsWith('http')) {
        window.open(target, '_blank');
      } else {
        router.push(target);
      }
      return;
    }
    
    // Submenu items
    const subRoutes = {
      // Administratie subitems
      'administratie-contracten': '/administratie/contracten',
      'administratie-klanten': '/administratie/klanten',
      'administratie-dossiers': '/administratie/dossiers',
      'administratie-auditlog': '/administratie/auditlog',
      'administratie-compliance': '/administratie/compliance',
      
      // BIM subitems
      'bim-modellen': '/bim/modellen',
      'bim-versiebeheer': '/bim/versiebeheer',
      'bim-clash-detection': '/bim/clash-detection',
      'bim-export': '/bim/export',
      
      // Bouwplaats subitems
      'bouwplaats-projecten': 'https://bouwplaats.sterkbouw.nl/projecten',
      'bouwplaats-taken': 'https://bouwplaats.sterkbouw.nl/taken',
      'bouwplaats-opleverpunten': 'https://bouwplaats.sterkbouw.nl/opleverpunten',
      'bouwplaats-fotos': 'https://bouwplaats.sterkbouw.nl/fotos',
      'bouwplaats-veiligheid': 'https://bouwplaats.sterkbouw.nl/veiligheid',
      'bouwplaats-meerwerk': 'https://bouwplaats.sterkbouw.nl/meerwerk',
      
      // Calculatie subitems
      'calculatie-overzicht': '/calculaties',
      'calculatie-nieuw': '/calculaties/nieuw',
      'calculatie-meerwerk': '/calculaties/meerwerk',
      'calculatie-offertes': '/calculaties/offertes',
      'calculatie-historie': '/calculaties/historie',
      
      // Andere subitems blijven werken zoals voorheen
    };
    
    if (subRoutes[key]) {
      const target = subRoutes[key];
      if (target.startsWith('http')) {
        window.open(target, '_blank');
      } else {
        router.push(target);
      }
    }
  };

  // SIMPELE menu items
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
        { key: 'administratie-klanten', label: 'Klant- en bedrijfsgegevens' },
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
        { key: 'calculatie-overzicht', label: 'Calculaties' },
        { key: 'calculatie-nieuw', label: 'Nieuwe Calculatie' },
        { key: 'calculatie-meerwerk', label: 'Meer- en minderwerk' },
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

  // SIMPELE breadcrumb
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
      items.push({
        title: title,
        onClick: () => router.push(`/${part}`)
      });
    });
    
    return items;
  };

  // SIMPELE selected keys
  const getSelectedKeys = () => {
    const path = router.pathname;
    
    if (path === '/dashboard') return ['dashboard'];
    if (path.startsWith('/administratie')) return ['administratie'];
    if (path.startsWith('/bim')) return ['bim'];
    if (path.startsWith('/calculaties')) return ['calculatie'];
    if (path.startsWith('/constructie')) return ['constructie'];
    if (path.startsWith('/documenten')) return ['documenten'];
    if (path.startsWith('/financien')) return ['financien'];
    if (path.startsWith('/financiering')) return ['financieringen'];
    if (path.startsWith('/inkoop')) return ['inkoop'];
    if (path.startsWith('/kopersportaal')) return ['kopersportaal'];
    if (path.startsWith('/mail')) return ['mail'];
    if (path.startsWith('/planning')) return ['planning'];
    if (path.startsWith('/projecten')) return ['projecten'];
    if (path.startsWith('/projectportaal')) return ['projectportaal'];
    if (path.startsWith('/instellingen')) return ['instellingen'];
    
    return [];
  };

  // Loading state
  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f2f5'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
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
            background: darkTheme ? '#141414' : '#fff',
            borderRight: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`
          }}
        >
          {/* Logo */}
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
              justifyContent: 'center'
            }}>
              <ProjectOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            {!collapsed && (
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '18px',
                color: darkTheme ? '#fff' : token.colorPrimary,
                marginLeft: 12
              }}>
                Sterkbouw
              </span>
            )}
          </div>

          {/* Menu */}
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={['administratie', 'bim', 'calculatie']}
            style={{
              borderRight: 0,
              background: darkTheme ? '#141414' : '#fff',
              marginTop: '16px'
            }}
            items={menuItems}
            onClick={handleMenuClick}
            theme={darkTheme ? 'dark' : 'light'}
          />
        </Sider>

        {/* Main Layout */}
        <Layout>
          {/* Header */}
          <Header style={{
            padding: '0 24px',
            background: darkTheme ? '#1f1f1f' : '#fff',
            borderBottom: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '18px' }}
              />
              
              <Breadcrumb
                items={getBreadcrumbItems()}
                style={{ marginLeft: '16px' }}
              />
            </div>

            <Space>
              <Tooltip title="Search">
                <Button 
                  type="text" 
                  icon={<SearchOutlined />}
                />
              </Tooltip>
              
              <Tooltip title="Notifications">
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
                    { key: 'profile', label: 'Profile' },
                    { key: 'settings', label: 'Settings' },
                    { type: 'divider' },
                    { key: 'logout', label: 'Logout' }
                  ]
                }}
              >
                <Avatar icon={<UserOutlined />} />
              </Dropdown>
            </Space>
          </Header>

          {/* Content */}
          <Content style={{ 
            margin: '24px 16px', 
            padding: 24,
            background: darkTheme ? '#141414' : '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)'
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
