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
  CalculatorOutlined, CustomerServiceOutlined, BankOutlined,
  BuildOutlined, FileDoneOutlined, ContainerOutlined,
  ShopOutlined, MailOutlined, ScheduleOutlined,
  WalletOutlined, PercentageOutlined, ShoppingOutlined,
  SolutionOutlined, CheckCircleOutlined, SafetyCertificateOutlined,
  FileProtectOutlined, CloudServerOutlined, EnvironmentOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState('ADMIN');
  const [darkTheme, setDarkTheme] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nieuw project aangemaakt', time: '10 min geleden', read: false, type: 'project' },
    { id: 2, message: 'Calculatie #2345 vereist goedkeuring', time: '1 uur geleden', read: false, type: 'calculatie' },
    { id: 3, message: 'Meerwerk gesignaleerd op bouwplaats', time: '2 uur geleden', read: true, type: 'bouwplaats' },
  ]);
  
  const router = useRouter();
  const { pathname, query } = router;
  const { token } = theme.useToken();
  
  // DEBUG logging
  useEffect(() => {
    console.log("✅ AdminLayout wordt gerenderd");
    console.log("📍 Huidige route:", router.pathname);
    console.log("📏 Collapsed:", collapsed);
  }, [router.pathname, collapsed]);
  
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
  
  const handleMenuClick = ({ key }) => {
    console.log('Menu clicked:', key);
    
    const routes = {
      // 1. Dashboard
      'dashboard': '/dashboard',
      
      // 2. Administratie
      'administratie': '/administratie',
      'administratie-contracten': '/administratie/contracten',
      'administratie-klanten': '/administratie/klanten',
      'administratie-dossiers': '/administratie/dossiers',
      'administratie-auditlog': '/administratie/auditlog',
      'administratie-compliance': '/administratie/compliance',
      
      // 3. BIM
      'bim': '/bim',
      'bim-modellen': '/bim/modellen',
      'bim-versiebeheer': '/bim/versiebeheer',
      'bim-clash-detection': '/bim/clash-detection',
      'bim-export': '/bim/export',
      
      // 4. Bouwplaats - EXTERNE LINK
      'bouwplaats': 'https://bouwplaats.sterkbouw.nl',
      'bouwplaats-projecten': 'https://bouwplaats.sterkbouw.nl/projecten',
      'bouwplaats-taken': 'https://bouwplaats.sterkbouw.nl/taken',
      'bouwplaats-opleverpunten': 'https://bouwplaats.sterkbouw.nl/opleverpunten',
      'bouwplaats-fotos': 'https://bouwplaats.sterkbouw.nl/fotos',
      'bouwplaats-veiligheid': 'https://bouwplaats.sterkbouw.nl/veiligheid',
      'bouwplaats-meerwerk': 'https://bouwplaats.sterkbouw.nl/meerwerk',
      
      // 5. Calculatie
      'calculatie': '/calculaties',
      'calculatie-overzicht': '/calculaties',
      'calculatie-nieuw': '/calculaties/nieuw',
      'calculatie-meerwerk': '/calculaties/meerwerk',
      'calculatie-offertes': '/calculaties/offertes',
      'calculatie-historie': '/calculaties/historie',
      
      // 6. Constructie
      'constructie': '/constructie',
      'constructie-berekeningen': '/constructie/berekeningen',
      'constructie-rapportages': '/constructie/rapportages',
      'constructie-revisies': '/constructie/revisies',
      'constructie-goedkeuring': '/constructie/goedkeuring',
      
      // 7. Documenten
      'documenten': '/documenten',
      'documenten-overzicht': '/documenten',
      'documenten-versiebeheer': '/documenten/versiebeheer',
      'documenten-rechten': '/documenten/rechten',
      'documenten-zoeken': '/documenten/zoeken',
      'documenten-export': '/documenten/export',
      
      // 8. Financiën
      'financien': '/financien',
      'financien-overzicht': '/financien',
      'financien-projectresultaten': '/financien/projectresultaten',
      'financien-kosten': '/financien/kosten',
      'financien-meerwerk': '/financien/meerwerk',
      'financien-facturen': '/financien/facturen',
      
      // 9. Financieringen
      'financieringen': '/financiering',
      'financieringen-leningen': '/financiering/leningen',
      'financieringen-ltv': '/financiering/ltv',
      'financieringen-rente': '/financiering/rente',
      'financieringen-zekerheden': '/financiering/zekerheden',
      'financieringen-rapportages': '/financiering/rapportages',
      
      // 10. Inkoop
      'inkoop': '/inkoop',
      'inkoop-orders': '/inkoop/orders',
      'inkoop-leveranciers': '/inkoop/leveranciers',
      'inkoop-prijsafspraken': '/inkoop/prijsafspraken',
      'inkoop-leveringen': '/inkoop/leveringen',
      'inkoop-afwijkingen': '/inkoop/afwijkingen',
      
      // 11. Kopersportaal
      'kopersportaal': '/kopersportaal',
      'kopersportaal-projecten': '/kopersportaal/projecten',
      'kopersportaal-status': '/kopersportaal/status',
      'kopersportaal-meerwerk': '/kopersportaal/meerwerk',
      'kopersportaal-oplevering': '/kopersportaal/oplevering',
      'kopersportaal-nazorg': '/kopersportaal/nazorg',
      'kopersportaal-communicatie': '/kopersportaal/communicatie',
      
      // 12. Mail
      'mail': '/mail',
      'mail-overzicht': '/mail',
      'mail-notificaties': '/mail/notificaties',
      'mail-akkoorden': '/mail/akkoorden',
      'mail-communicatie': '/mail/communicatie',
      
      // 13. Planning
      'planning': '/planning',
      'planning-overzicht': '/planning',
      'planning-projecten': '/planning/projecten',
      'planning-mijlpalen': '/planning/mijlpalen',
      'planning-fases': '/planning/fases',
      'planning-afwijkingen': '/planning/afwijkingen',
      
      // 14. Projecten
      'projecten': '/projecten',
      'projecten-overzicht': '/projecten',
      'projecten-status': '/projecten/status',
      'projecten-instellingen': '/projecten/instellingen',
      'projecten-koppelingen': '/projecten/koppelingen',
      'projecten-archief': '/projecten/archief',
      
      // 15. Projectportaal
      'projectportaal': '/projectportaal',
      'projectportaal-overzicht': '/projectportaal',
      'projectportaal-akkoorden': '/projectportaal/akkoorden',
      'projectportaal-documenten': '/projectportaal/documenten',
      'projectportaal-meerwerk': '/projectportaal/meerwerk',
      'projectportaal-planning': '/projectportaal/planning',
      'projectportaal-communicatie': '/projectportaal/communicatie',
      
      // 16. Instellingen
      'instellingen': '/instellingen',
      'instellingen-gebruikers': '/instellingen/gebruikers',
      'instellingen-rollen': '/instellingen/rollen',
      'instellingen-modules': '/instellingen/modules',
      'instellingen-templates': '/instellingen/templates',
      'instellingen-notificaties': '/instellingen/notificaties',
      'instellingen-systeem': '/instellingen/systeem',
      'instellingen-profiel': '/instellingen/profiel',
    };
    
    // Check of het een externe link is (begint met http)
    if (routes[key] && routes[key].startsWith('http')) {
      window.open(routes[key], '_blank');
      return;
    }
    
    if (routes[key]) {
      router.push(routes[key]);
    }
  };
  
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mijn Profiel',
      onClick: () => router.push('/instellingen/profiel')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Instellingen',
      onClick: () => router.push('/instellingen')
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
          notification.type === 'calculatie' ? <CalculatorOutlined /> : 
          <BuildOutlined />
  }));
  
  const getBreadcrumbItems = () => {
    const pathSnippets = pathname.split('/').filter(i => i);
    
    const breadcrumbItems = pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      let title = snippet.charAt(0).toUpperCase() + snippet.slice(1);
      
      const titleMap = {
        'dashboard': 'Dashboard',
        'administratie': 'Administratie',
        'bim': 'BIM',
        'calculaties': 'Calculaties',
        'nieuw': 'Nieuwe Calculatie',
        'constructie': 'Constructie',
        'documenten': 'Documenten',
        'financien': 'Financiën',
        'financiering': 'Financieringen',
        'inkoop': 'Inkoop',
        'kopersportaal': 'Kopersportaal',
        'mail': 'Mail',
        'planning': 'Planning',
        'projecten': 'Projecten',
        'projectportaal': 'Projectportaal',
        'instellingen': 'Instellingen',
        'profiel': 'Profiel'
      };
      
      title = titleMap[snippet] || title;
      
      return {
        title: title,
        onClick: () => router.push(url)
      };
    });
    
    return [{ title: <HomeOutlined />, onClick: () => router.push('/dashboard') }, ...breadcrumbItems];
  };
  
  const getSelectedKeys = () => {
    const path = pathname;
    
    if (path === '/dashboard') return ['dashboard'];
    if (path.startsWith('/administratie')) return ['administratie'];
    if (path.startsWith('/bim')) return ['bim'];
    if (path.startsWith('/calculaties/nieuw')) return ['calculatie-nieuw'];
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
    if (path.startsWith('/instellingen/profiel')) return ['profile'];
    if (path.startsWith('/instellingen')) return ['instellingen'];
    
    return ['dashboard'];
  };
  
  const menuItems = [
    // 1. Dashboard
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    
    // 2. Administratie
    {
      key: 'administratie',
      icon: <FileDoneOutlined />,
      label: 'Administratie',
      children: [
        { key: 'administratie-contracten', label: 'Contractbeheer' },
        { key: 'administratie-klanten', label: 'Klant- en bedrijfsgegevens' },
        { key: 'administratie-dossiers', label: 'Dossierstructuur' },
        { key: 'administratie-auditlog', label: 'Auditlog' },
        { key: 'administratie-compliance', label: 'Compliance / vastlegging' },
      ]
    },
    
    // 3. BIM
    {
      key: 'bim',
      icon: <ApartmentOutlined />,
      label: 'BIM',
      children: [
        { key: 'bim-modellen', label: 'BIM-modellen (viewer)' },
        { key: 'bim-versiebeheer', label: 'Versiebeheer' },
        { key: 'bim-clash-detection', label: 'Clash detection (status)' },
        { key: 'bim-export', label: 'Export (IFC / PDF)' },
      ]
    },
    
    // 4. Bouwplaats
    {
      key: 'bouwplaats',
      icon: <BuildOutlined />,
      label: 'Bouwplaats',
      children: [
        { 
          key: 'bouwplaats-projecten', 
          label: 'Actieve projecten',
          onClick: () => window.open('https://bouwplaats.sterkbouw.nl/projecten', '_blank')
        },
        { 
          key: 'bouwplaats-taken', 
          label: 'Taken & ruimtes',
          onClick: () => window.open('https://bouwplaats.sterkbouw.nl/taken', '_blank')
        },
        { 
          key: 'bouwplaats-opleverpunten', 
          label: 'Opleverpunten',
          onClick: () => window.open('https://bouwplaats.sterkbouw.nl/opleverpunten', '_blank')
        },
        { 
          key: 'bouwplaats-fotos', 
          label: 'Foto\'s & rapportages',
          onClick: () => window.open('https://bouwplaats.sterkbouw.nl/fotos', '_blank')
        },
        { 
          key: 'bouwplaats-veiligheid', 
          label: 'Veiligheidsmeldingen',
          onClick: () => window.open('https://bouwplaats.sterkbouw.nl/veiligheid', '_blank')
        },
        { 
          key: 'bouwplaats-meerwerk', 
          label: 'Meerwerksignalen',
          onClick: () => window.open('https://bouwplaats.sterkbouw.nl/meerwerk', '_blank')
        },
      ]
    },
    
    // 5. Calculatie
    {
      key: 'calculatie',
      icon: <CalculatorOutlined />,
      label: 'Calculatie',
      children: [
        { key: 'calculatie-overzicht', label: 'Calculaties per project' },
        { key: 'calculatie-nieuw', label: 'Nieuwe Calculatie' },
        { key: 'calculatie-meerwerk', label: 'Meer- en minderwerk' },
        { key: 'calculatie-offertes', label: 'Offertegeneratie' },
        { key: 'calculatie-historie', label: 'Historie & versies' },
      ]
    },
    
    // 6. Constructie
    {
      key: 'constructie',
      icon: <SafetyCertificateOutlined />,
      label: 'Constructie',
      children: [
        { key: 'constructie-berekeningen', label: 'Constructieberekeningen' },
        { key: 'constructie-rapportages', label: 'Rapportages' },
        { key: 'constructie-revisies', label: 'Revisies' },
        { key: 'constructie-goedkeuring', label: 'Status goedkeuring' },
      ]
    },
    
    // 7. Documenten
    {
      key: 'documenten',
      icon: <FolderOutlined />,
      label: 'Documenten',
      children: [
        { key: 'documenten-overzicht', label: 'Alle projectdocumenten' },
        { key: 'documenten-versiebeheer', label: 'Versiebeheer' },
        { key: 'documenten-rechten', label: 'Rechten & rollen' },
        { key: 'documenten-zoeken', label: 'Zoek & filters' },
        { key: 'documenten-export', label: 'PDF-exports' },
      ]
    },
    
    // 8. Financiën
    {
      key: 'financien',
      icon: <WalletOutlined />,
      label: 'Financiën',
      children: [
        { key: 'financien-overzicht', label: 'Projectresultaten' },
        { key: 'financien-kosten', label: 'Kosten vs begroting' },
        { key: 'financien-meerwerk', label: 'Meerwerkimpact' },
        { key: 'financien-termijnen', label: 'Termijnen' },
        { key: 'financien-facturen', label: 'Factuurstatus (inzicht)' },
      ]
    },
    
    // 9. Financieringen
    {
      key: 'financieringen',
      icon: <PercentageOutlined />,
      label: 'Financieringen',
      children: [
        { key: 'financieringen-leningen', label: 'Leningen' },
        { key: 'financieringen-ltv', label: 'LTV per project' },
        { key: 'financieringen-rente', label: 'Rente & looptijd' },
        { key: 'financieringen-zekerheden', label: 'Zekerheden' },
        { key: 'financieringen-rapportages', label: 'Rapportages voor financiers' },
      ]
    },
    
    // 10. Inkoop
    {
      key: 'inkoop',
      icon: <ShoppingOutlined />,
      label: 'Inkoop',
      children: [
        { key: 'inkoop-orders', label: 'Inkooporders' },
        { key: 'inkoop-leveranciers', label: 'Leveranciers' },
        { key: 'inkoop-prijsafspraken', label: 'Prijsafspraken' },
        { key: 'inkoop-leveringen', label: 'Leveringen' },
        { key: 'inkoop-afwijkingen', label: 'Afwijkingen & tekorten' },
      ]
    },
    
    // 11. Kopersportaal
    {
      key: 'kopersportaal',
      icon: <SolutionOutlined />,
      label: 'Kopersportaal',
      children: [
        { key: 'kopersportaal-projecten', label: 'Projecten met kopers/huurders' },
        { key: 'kopersportaal-status', label: 'Status per woning' },
        { key: 'kopersportaal-meerwerk', label: 'Meerwerkflows' },
        { key: 'kopersportaal-oplevering', label: 'Oplevering' },
        { key: 'kopersportaal-nazorg', label: 'Nazorgmeldingen' },
        { key: 'kopersportaal-communicatie', label: 'Communicatie-overzicht' },
      ]
    },
    
    // 12. Mail
    {
      key: 'mail',
      icon: <MailOutlined />,
      label: 'Mail',
      children: [
        { key: 'mail-overzicht', label: 'Projectgebonden mails' },
        { key: 'mail-notificaties', label: 'Automatische notificaties' },
        { key: 'mail-akkoorden', label: 'Akkoordmails' },
        { key: 'mail-communicatie', label: 'Vastgelegde communicatie' },
      ]
    },
    
    // 13. Planning
    {
      key: 'planning',
      icon: <ScheduleOutlined />,
      label: 'Planning',
      children: [
        { key: 'planning-overzicht', label: 'Projectplanningen' },
        { key: 'planning-mijlpalen', label: 'Mijlpalen' },
        { key: 'planning-fases', label: 'Fase-overzichten' },
        { key: 'planning-afwijkingen', label: 'Afwijkingen' },
      ]
    },
    
    // 14. Projecten
    {
      key: 'projecten',
      icon: <ProjectOutlined />,
      label: 'Projecten',
      children: [
        { key: 'projecten-overzicht', label: 'Alle projecten' },
        { key: 'projecten-status', label: 'Projectstatus' },
        { key: 'projecten-instellingen', label: 'Projectinstellingen' },
        { key: 'projecten-koppelingen', label: 'Koppelingen' },
        { key: 'projecten-archief', label: 'Projectarchief' },
      ]
    },
    
    // 15. Projectportaal
    {
      key: 'projectportaal',
      icon: <ContainerOutlined />,
      label: 'Projectportaal',
      children: [
        { key: 'projectportaal-overzicht', label: 'Actieve opdrachtgever-projecten' },
        { key: 'projectportaal-akkoorden', label: 'Akkoorden' },
        { key: 'projectportaal-documenten', label: 'Documenten' },
        { key: 'projectportaal-meerwerk', label: 'Meerwerk' },
        { key: 'projectportaal-planning', label: 'Planning & financiën (inzicht)' },
        { key: 'projectportaal-communicatie', label: 'Communicatie' },
      ]
    },
    
    // 16. Instellingen
    {
      key: 'instellingen',
      icon: <SettingOutlined />,
      label: 'Instellingen',
      children: [
        { key: 'instellingen-gebruikers', label: 'Gebruikers & rollen' },
        { key: 'instellingen-rollen', label: 'Rechtenstructuur' },
        { key: 'instellingen-modules', label: 'Module-instellingen' },
        { key: 'instellingen-templates', label: 'Standaard templates' },
        { key: 'instellingen-notificaties', label: 'Notificaties' },
        { key: 'instellingen-systeem', label: 'Systeemstatus' },
      ]
    }
  ];
  
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
          width={280}
          style={{
            background: darkTheme ? '#141414' : '#fff',
            borderRight: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`,
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            height: '100vh',
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
                Sterkbouw Admin
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
              onClick={() => router.push('/instellingen/profiel')}
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
          <div style={{ overflowY: 'auto', height: 'calc(100vh - 180px)' }}>
            <Menu
              mode="inline"
              selectedKeys={getSelectedKeys()}
              defaultOpenKeys={collapsed ? [] : menuItems.map(item => item.key)}
              style={{
                borderRight: 0,
                background: darkTheme ? '#141414' : '#fff',
                padding: '8px 0'
              }}
              items={menuItems}
              onClick={handleMenuClick}
              theme={darkTheme ? 'dark' : 'light'}
              inlineIndent={16}
            />
          </div>
          
          {!collapsed && (
            <div style={{ 
              padding: '16px',
              borderTop: `1px solid ${darkTheme ? '#303030' : '#f0f0f0'}`,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: darkTheme ? '#141414' : '#fff'
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
          marginLeft: collapsed ? 80 : 280,
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
            zIndex: 999,
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
                  onClick={() => router.push('/zoeken')}
                />
              </Tooltip>
              
              {/* Snel toevoegen */}
              <Dropdown
                menu={{
                  items: [
                    { 
                      key: 'new-project', 
                      label: 'Nieuw Project', 
                      icon: <ProjectOutlined />,
                      onClick: () => router.push('/projecten')
                    },
                    { 
                      key: 'new-calculatie', 
                      label: 'Nieuwe Calculatie', 
                      icon: <CalculatorOutlined />,
                      onClick: () => router.push('/calculaties/nieuw')
                    },
                    { 
                      key: 'open-bouwplaats', 
                      label: 'Open Bouwplaats', 
                      icon: <BuildOutlined />,
                      onClick: () => window.open('https://bouwplaats.sterkbouw.nl', '_blank')
                    },
                    { 
                      key: 'upload-document', 
                      label: 'Document Uploaden', 
                      icon: <UploadOutlined />,
                      onClick: () => router.push('/documenten')
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
                      onClick: () => router.push('/instellingen/notificaties')
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
                  <span>Laatste update: vandaag 14:30</span>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/instellingen/systeem');
                    }}
                    style={{ color: token.colorPrimary }}
                  >
                    Systeemstatus
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
