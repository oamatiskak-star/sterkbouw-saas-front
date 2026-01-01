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

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  
  const router = useRouter();
  const { token } = theme.useToken();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Hoofdmenu click handler (voor titels van menu's met children)
  const handleMainMenuTitleClick = (key) => {
    console.log('Hoofdmenu titel geklikt:', key);
    
    const mainRoutes = {
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
    
    const target = mainRoutes[key];
    if (!target) return;
    
    if (target.startsWith('http')) {
      window.open(target, '_blank');
    } else {
      router.push(target);
    }
  };

  // 2. Normale menu click handler (voor leaf items en items zonder children)
  const handleMenuClick = ({ key }) => {
    console.log('Menu item geklikt:', key);
    
    const routes = {
      // Dashboard
      'dashboard': '/dashboard',
      
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
      
      // Constructie (werkt al)
      'constructie': '/constructie',
      
      // Documenten (werkt niet)
      'documenten': '/documenten',
      
      // Financiën (werkt al)
      'financien': '/financien',
      
      // Financieringen (werkt niet)
      'financieringen': '/financiering',
      
      // Inkoop (werkt al)
      'inkoop': '/inkoop',
      
      // Kopersportaal (werkt al)
      'kopersportaal': '/kopersportaal',
      
      // Mail (werkt al)
      'mail': '/mail',
      
      // Planning (werkt niet)
      'planning': '/planning',
      
      // Projecten (werkt al)
      'projecten': '/projecten',
      
      // Projectportaal (werkt niet)
      'projectportaal': '/projectportaal',
      
      // Instellingen (werkt al)
      'instellingen': '/instellingen'
    };
    
    const target = routes[key];
    if (!target) return;
    
    if (target.startsWith('http')) {
      window.open(target, '_blank');
    } else {
      router.push(target);
    }
  };

  // Menu items - VOLLEDIG GECORRIGEERD
  const menuItems = [
    // 1. Dashboard - GEEN CHILDREN, dus onClick
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => handleMenuClick({ key: 'dashboard' })
    },
    
    // 2. Administratie - MET CHILDREN, dus onTitleClick voor de titel
    {
      key: 'administratie',
      icon: <FileTextOutlined />,
      label: 'Administratie',
      onTitleClick: () => handleMainMenuTitleClick('administratie'),
      children: [
        { key: 'administratie-contracten', label: 'Contractbeheer' },
        { key: 'administratie-klanten', label: 'Klant- en bedrijfsgegevens' },
        { key: 'administratie-dossiers', label: 'Dossierstructuur' },
        { key: 'administratie-auditlog', label: 'Auditlog' },
        { key: 'administratie-compliance', label: 'Compliance' }
      ]
    },
    
    // 3. BIM - MET CHILDREN
    {
      key: 'bim',
      icon: <ApartmentOutlined />,
      label: 'BIM',
      onTitleClick: () => handleMainMenuTitleClick('bim'),
      children: [
        { key: 'bim-modellen', label: 'BIM-modellen' },
        { key: 'bim-versiebeheer', label: 'Versiebeheer' },
        { key: 'bim-clash-detection', label: 'Clash detection' },
        { key: 'bim-export', label: 'Export' }
      ]
    },
    
    // 4. Bouwplaats - GEEN CHILDREN in de nieuwe versie, dus onClick
    {
      key: 'bouwplaats',
      icon: <BuildOutlined />,
      label: 'Bouwplaats',
      onClick: () => handleMenuClick({ key: 'bouwplaats' })
    },
    
    // 5. Calculatie - MET CHILDREN
    {
      key: 'calculatie',
      icon: <CalculatorOutlined />,
      label: 'Calculatie',
      onTitleClick: () => handleMainMenuTitleClick('calculatie'),
      children: [
        { key: 'calculatie-overzicht', label: 'Calculaties' },
        { key: 'calculatie-nieuw', label: 'Nieuwe Calculatie' },
        { key: 'calculatie-meerwerk', label: 'Meer- en minderwerk' },
        { key: 'calculatie-offertes', label: 'Offertegeneratie' },
        { key: 'calculatie-historie', label: 'Historie' }
      ]
    },
    
    // 6. Constructie - GEEN CHILDREN (werkt al)
    {
      key: 'constructie',
      icon: <SettingOutlined />,
      label: 'Constructie',
      onClick: () => handleMenuClick({ key: 'constructie' })
    },
    
    // 7. Documenten - GEEN CHILDREN (werkt nu NIET, moet WEL)
    {
      key: 'documenten',
      icon: <FolderOutlined />,
      label: 'Documenten',
      onClick: () => handleMenuClick({ key: 'documenten' })
    },
    
    // 8. Financiën - GEEN CHILDREN (werkt al)
    {
      key: 'financien',
      icon: <WalletOutlined />,
      label: 'Financiën',
      onClick: () => handleMenuClick({ key: 'financien' })
    },
    
    // 9. Financieringen - GEEN CHILDREN (werkt nu NIET, moet WEL)
    {
      key: 'financieringen',
      icon: <PercentageOutlined />,
      label: 'Financieringen',
      onClick: () => handleMenuClick({ key: 'financieringen' })
    },
    
    // 10. Inkoop - GEEN CHILDREN (werkt al)
    {
      key: 'inkoop',
      icon: <ShoppingOutlined />,
      label: 'Inkoop',
      onClick: () => handleMenuClick({ key: 'inkoop' })
    },
    
    // 11. Kopersportaal - GEEN CHILDREN (werkt al)
    {
      key: 'kopersportaal',
      icon: <UserOutlined />,
      label: 'Kopersportaal',
      onClick: () => handleMenuClick({ key: 'kopersportaal' })
    },
    
    // 12. Mail - GEEN CHILDREN (werkt al)
    {
      key: 'mail',
      icon: <MailOutlined />,
      label: 'Mail',
      onClick: () => handleMenuClick({ key: 'mail' })
    },
    
    // 13. Planning - GEEN CHILDREN (werkt nu NIET, moet WEL)
    {
      key: 'planning',
      icon: <ScheduleOutlined />,
      label: 'Planning',
      onClick: () => handleMenuClick({ key: 'planning' })
    },
    
    // 14. Projecten - GEEN CHILDREN (werkt al)
    {
      key: 'projecten',
      icon: <ProjectOutlined />,
      label: 'Projecten',
      onClick: () => handleMenuClick({ key: 'projecten' })
    },
    
    // 15. Projectportaal - GEEN CHILDREN (werkt nu NIET, moet WEL)
    {
      key: 'projectportaal',
      icon: <ContainerOutlined />,
      label: 'Projectportaal',
      onClick: () => handleMenuClick({ key: 'projectportaal' })
    },
    
    // 16. Instellingen - GEEN CHILDREN (werkt al)
    {
      key: 'instellingen',
      icon: <SettingOutlined />,
      label: 'Instellingen',
      onClick: () => handleMenuClick({ key: 'instellingen' })
    }
  ];

  // Breadcrumb
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
        title: title
      });
    });
    
    return items;
  };

  // Selected keys
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
            defaultOpenKeys={collapsed ? [] : ['administratie', 'bim', 'calculatie']}
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
