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
  BuildOutlined, FileSyncOutlined, ContainerOutlined,
  ShopOutlined, MailOutlined, ScheduleOutlined,
  WalletOutlined, PercentageOutlined, ShoppingOutlined,
  SolutionOutlined, CheckCircleOutlined, SafetyCertificateOutlined,
  FileDoneOutlined, FileProtectOutlined, CloudServerOutlined
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
      'dashboard': '/admin/dashboard',
      
      // 2. Administratie
      'administratie': '/admin/administratie',
      'administratie-contracten': '/admin/administratie/contracten',
      'administratie-klanten': '/admin/administratie/klanten',
      'administratie-dossiers': '/admin/administratie/dossiers',
      'administratie-auditlog': '/admin/administratie/auditlog',
      'administratie-compliance': '/admin/administratie/compliance',
      
      // 3. BIM
      'bim': '/admin/bim',
      'bim-modellen': '/admin/bim/modellen',
      'bim-versiebeheer': '/admin/bim/versiebeheer',
      'bim-clash-detection': '/admin/bim/clash-detection',
      'bim-export': '/admin/bim/export',
      
      // 4. Bouwplaats
      'bouwplaats': '/admin/bouwplaats',
      'bouwplaats-projecten': '/admin/bouwplaats/projecten',
      'bouwplaats-taken': '/admin/bouwplaats/taken',
      'bouwplaats-opleverpunten': '/admin/bouwplaats/opleverpunten',
      'bouwplaats-fotos': '/admin/bouwplaats/fotos',
      'bouwplaats-veiligheid': '/admin/bouwplaats/veiligheid',
      'bouwplaats-meerwerk': '/admin/bouwplaats/meerwerk',
      
      // 5. Calculatie
      'calculatie': '/admin/calculatie',
      'calculatie-overzicht': '/admin/calculatie/overzicht',
      'calculatie-stabu': '/admin/calculatie/stabu',
      'calculatie-optimalisatie': '/admin/calculatie/optimalisatie',
      'calculatie-meerwerk': '/admin/calculatie/meerwerk',
      'calculatie-offertes': '/admin/calculatie/offertes',
      'calculatie-historie': '/admin/calculatie/historie',
      
      // 6. Constructie
      'constructie': '/admin/constructie',
      'constructie-berekeningen': '/admin/constructie/berekeningen',
      'constructie-rapportages': '/admin/constructie/rapportages',
      'constructie-revisies': '/admin/constructie/revisies',
      'constructie-goedkeuring': '/admin/constructie/goedkeuring',
      
      // 7. Documenten
      'documenten': '/admin/documenten',
      'documenten-overzicht': '/admin/documenten/overzicht',
      'documenten-versiebeheer': '/admin/documenten/versiebeheer',
      'documenten-rechten': '/admin/documenten/rechten',
      'documenten-zoeken': '/admin/documenten/zoeken',
      'documenten-export': '/admin/documenten/export',
      
      // 8. Financiën
      'financien': '/admin/financien',
      'financien-projectresultaten': '/admin/financien/projectresultaten',
      'financien-kosten': '/admin/financien/kosten',
      'financien-meerwerk-impact': '/admin/financien/meerwerk-impact',
      'financien-termijnen': '/admin/financien/termijnen',
      'financien-factuurstatus': '/admin/financien/factuurstatus',
      
      // 9. Financieringen
      'financieringen': '/admin/financieringen',
      'financieringen-leningen': '/admin/financieringen/leningen',
      'financieringen-ltv': '/admin/financieringen/ltv',
      'financieringen-rente': '/admin/financieringen/rente',
      'financieringen-zekerheden': '/admin/financieringen/zekerheden',
      'financieringen-rapportages': '/admin/financieringen/rapportages',
      
      // 10. Inkoop
      'inkoop': '/admin/inkoop',
      'inkoop-orders': '/admin/inkoop/orders',
      'inkoop-leveranciers': '/admin/inkoop/leveranciers',
      'inkoop-prijsafspraken': '/admin/inkoop/prijsafspraken',
      'inkoop-leveringen': '/admin/inkoop/leveringen',
      'inkoop-afwijkingen': '/admin/inkoop/afwijkingen',
      
      // 11. Kopersportaal
      'kopersportaal': '/admin/kopersportaal',
      'kopersportaal-projecten': '/admin/kopersportaal/projecten',
      'kopersportaal-status': '/admin/kopersportaal/status',
      'kopersportaal-meerwerk': '/admin/kopersportaal/meerwerk',
      'kopersportaal-oplevering': '/admin/kopersportaal/oplevering',
      'kopersportaal-nazorg': '/admin/kopersportaal/nazorg',
      'kopersportaal-communicatie': '/admin/kopersportaal/communicatie',
      
      // 12. Mail
      'mail': '/admin/mail',
      'mail-projecten': '/admin/mail/projecten',
      'mail-notificaties': '/admin/mail/notificaties',
      'mail-akkoorden': '/admin/mail/akkoorden',
      'mail-communicatie': '/admin/mail/communicatie',
      
      // 13. Planning
      'planning': '/admin/planning',
      'planning-projecten': '/admin/planning/projecten',
      'planning-mijlpalen': '/admin/planning/mijlpalen',
      'planning-fases': '/admin/planning/fases',
      'planning-afwijkingen': '/admin/planning/afwijkingen',
      
      // 14. Projecten
      'projecten': '/admin/projecten',
      'projecten-overzicht': '/admin/projecten/overzicht',
      'projecten-status': '/admin/projecten/status',
      'projecten-instellingen': '/admin/projecten/instellingen',
      'projecten-koppelingen': '/admin/projecten/koppelingen',
      'projecten-archief': '/admin/projecten/archief',
      
      // 15. Projectportaal
      'projectportaal': '/admin/projectportaal',
      'projectportaal-opdrachtgevers': '/admin/projectportaal/opdrachtgevers',
      'projectportaal-akkoorden': '/admin/projectportaal/akkoorden',
      'projectportaal-documenten': '/admin/projectportaal/documenten',
      'projectportaal-meerwerk': '/admin/projectportaal/meerwerk',
      'projectportaal-planning': '/admin/projectportaal/planning',
      'projectportaal-communicatie': '/admin/projectportaal/communicatie',
      
      // 16. Instellingen
      'instellingen': '/admin/instellingen',
      'instellingen-gebruikers': '/admin/instellingen/gebruikers',
      'instellingen-rollen': '/admin/instellingen/rollen',
      'instellingen-modules': '/admin/instellingen/modules',
      'instellingen-templates': '/admin/instellingen/templates',
      'instellingen-notificaties': '/admin/instellingen/notificaties',
      'instellingen-systeem': '/admin/instellingen/systeem',
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
      onClick: () => router.push('/admin/instellingen/profiel')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Instellingen',
      onClick: () => router.push('/admin/instellingen')
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
        'admin': 'Dashboard',
        'dashboard': 'Dashboard',
        'administratie': 'Administratie',
        'bim': 'BIM',
        'bouwplaats': 'Bouwplaats',
        'calculatie': 'Calculatie',
        'constructie': 'Constructie',
        'documenten': 'Documenten',
        'financien': 'Financiën',
        'financieringen': 'Financieringen',
        'inkoop': 'Inkoop',
        'kopersportaal': 'Kopersportaal',
        'mail': 'Mail',
        'planning': 'Planning',
        'projecten': 'Projecten',
        'projectportaal': 'Projectportaal',
        'instellingen': 'Instellingen'
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
    
    if (path.includes('/admin/administratie')) {
      if (path.includes('/contracten')) return ['administratie-contracten'];
      if (path.includes('/klanten')) return ['administratie-klanten'];
      if (path.includes('/dossiers')) return ['administratie-dossiers'];
      if (path.includes('/auditlog')) return ['administratie-auditlog'];
      if (path.includes('/compliance')) return ['administratie-compliance'];
      return ['administratie'];
    }
    
    if (path.includes('/admin/bim')) {
      if (path.includes('/modellen')) return ['bim-modellen'];
      if (path.includes('/versiebeheer')) return ['bim-versiebeheer'];
      if (path.includes('/clash-detection')) return ['bim-clash-detection'];
      if (path.includes('/export')) return ['bim-export'];
      return ['bim'];
    }
    
    if (path.includes('/admin/bouwplaats')) {
      if (path.includes('/projecten')) return ['bouwplaats-projecten'];
      if (path.includes('/taken')) return ['bouwplaats-taken'];
      if (path.includes('/opleverpunten')) return ['bouwplaats-opleverpunten'];
      if (path.includes('/fotos')) return ['bouwplaats-fotos'];
      if (path.includes('/veiligheid')) return ['bouwplaats-veiligheid'];
      if (path.includes('/meerwerk')) return ['bouwplaats-meerwerk'];
      return ['bouwplaats'];
    }
    
    if (path.includes('/admin/calculatie')) {
      if (path.includes('/overzicht')) return ['calculatie-overzicht'];
      if (path.includes('/stabu')) return ['calculatie-stabu'];
      if (path.includes('/optimalisatie')) return ['calculatie-optimalisatie'];
      if (path.includes('/meerwerk')) return ['calculatie-meerwerk'];
      if (path.includes('/offertes')) return ['calculatie-offertes'];
      if (path.includes('/historie')) return ['calculatie-historie'];
      return ['calculatie'];
    }
    
    if (path.includes('/admin/constructie')) {
      if (path.includes('/berekeningen')) return ['constructie-berekeningen'];
      if (path.includes('/rapportages')) return ['constructie-rapportages'];
      if (path.includes('/revisies')) return ['constructie-revisies'];
      if (path.includes('/goedkeuring')) return ['constructie-goedkeuring'];
      return ['constructie'];
    }
    
    if (path.includes('/admin/documenten')) {
      if (path.includes('/overzicht')) return ['documenten-overzicht'];
      if (path.includes('/versiebeheer')) return ['documenten-versiebeheer'];
      if (path.includes('/rechten')) return ['documenten-rechten'];
      if (path.includes('/zoeken')) return ['documenten-zoeken'];
      if (path.includes('/export')) return ['documenten-export'];
      return ['documenten'];
    }
    
    if (path.includes('/admin/financien')) {
      if (path.includes('/projectresultaten')) return ['financien-projectresultaten'];
      if (path.includes('/kosten')) return ['financien-kosten'];
      if (path.includes('/meerwerk-impact')) return ['financien-meerwerk-impact'];
      if (path.includes('/termijnen')) return ['financien-termijnen'];
      if (path.includes('/factuurstatus')) return ['financien-factuurstatus'];
      return ['financien'];
    }
    
    if (path.includes('/admin/financieringen')) {
      if (path.includes('/leningen')) return ['financieringen-leningen'];
      if (path.includes('/ltv')) return ['financieringen-ltv'];
      if (path.includes('/rente')) return ['financieringen-rente'];
      if (path.includes('/zekerheden')) return ['financieringen-zekerheden'];
      if (path.includes('/rapportages')) return ['financieringen-rapportages'];
      return ['financieringen'];
    }
    
    if (path.includes('/admin/inkoop')) {
      if (path.includes('/orders')) return ['inkoop-orders'];
      if (path.includes('/leveranciers')) return ['inkoop-leveranciers'];
      if (path.includes('/prijsafspraken')) return ['inkoop-prijsafspraken'];
      if (path.includes('/leveringen')) return ['inkoop-leveringen'];
      if (path.includes('/afwijkingen')) return ['inkoop-afwijkingen'];
      return ['inkoop'];
    }
    
    if (path.includes('/admin/kopersportaal')) {
      if (path.includes('/projecten')) return ['kopersportaal-projecten'];
      if (path.includes('/status')) return ['kopersportaal-status'];
      if (path.includes('/meerwerk')) return ['kopersportaal-meerwerk'];
      if (path.includes('/oplevering')) return ['kopersportaal-oplevering'];
      if (path.includes('/nazorg')) return ['kopersportaal-nazorg'];
      if (path.includes('/communicatie')) return ['kopersportaal-communicatie'];
      return ['kopersportaal'];
    }
    
    if (path.includes('/admin/mail')) {
      if (path.includes('/projecten')) return ['mail-projecten'];
      if (path.includes('/notificaties')) return ['mail-notificaties'];
      if (path.includes('/akkoorden')) return ['mail-akkoorden'];
      if (path.includes('/communicatie')) return ['mail-communicatie'];
      return ['mail'];
    }
    
    if (path.includes('/admin/planning')) {
      if (path.includes('/projecten')) return ['planning-projecten'];
      if (path.includes('/mijlpalen')) return ['planning-mijlpalen'];
      if (path.includes('/fases')) return ['planning-fases'];
      if (path.includes('/afwijkingen')) return ['planning-afwijkingen'];
      return ['planning'];
    }
    
    if (path.includes('/admin/projecten')) {
      if (path.includes('/overzicht')) return ['projecten-overzicht'];
      if (path.includes('/status')) return ['projecten-status'];
      if (path.includes('/instellingen')) return ['projecten-instellingen'];
      if (path.includes('/koppelingen')) return ['projecten-koppelingen'];
      if (path.includes('/archief')) return ['projecten-archief'];
      return ['projecten'];
    }
    
    if (path.includes('/admin/projectportaal')) {
      if (path.includes('/opdrachtgevers')) return ['projectportaal-opdrachtgevers'];
      if (path.includes('/akkoorden')) return ['projectportaal-akkoorden'];
      if (path.includes('/documenten')) return ['projectportaal-documenten'];
      if (path.includes('/meerwerk')) return ['projectportaal-meerwerk'];
      if (path.includes('/planning')) return ['projectportaal-planning'];
      if (path.includes('/communicatie')) return ['projectportaal-communicatie'];
      return ['projectportaal'];
    }
    
    if (path.includes('/admin/instellingen')) {
      if (path.includes('/gebruikers')) return ['instellingen-gebruikers'];
      if (path.includes('/rollen')) return ['instellingen-rollen'];
      if (path.includes('/modules')) return ['instellingen-modules'];
      if (path.includes('/templates')) return ['instellingen-templates'];
      if (path.includes('/notificaties')) return ['instellingen-notificaties'];
      if (path.includes('/systeem')) return ['instellingen-systeem'];
      if (path.includes('/profiel')) return ['profile'];
      return ['instellingen'];
    }
    
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
        { key: 'bouwplaats-projecten', label: 'Actieve projecten' },
        { key: 'bouwplaats-taken', label: 'Taken & ruimtes' },
        { key: 'bouwplaats-opleverpunten', label: 'Opleverpunten' },
        { key: 'bouwplaats-fotos', label: 'Foto\'s & rapportages' },
        { key: 'bouwplaats-veiligheid', label: 'Veiligheidsmeldingen' },
        { key: 'bouwplaats-meerwerk', label: 'Meerwerksignalen' },
      ]
    },
    
    // 5. Calculatie
    {
      key: 'calculatie',
      icon: <CalculatorOutlined />,
      label: 'Calculatie',
      children: [
        { key: 'calculatie-overzicht', label: 'Calculaties per project' },
        { key: 'calculatie-stabu', label: 'STABU-structuur' },
        { key: 'calculatie-optimalisatie', label: 'Optimalisatieversies' },
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
        { key: 'financien-projectresultaten', label: 'Projectresultaten' },
        { key: 'financien-kosten', label: 'Kosten vs begroting' },
        { key: 'financien-meerwerk-impact', label: 'Meerwerkimpact' },
        { key: 'financien-termijnen', label: 'Termijnen' },
        { key: 'financien-factuurstatus', label: 'Factuurstatus (inzicht)' },
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
        { key: 'mail-projecten', label: 'Projectgebonden mails' },
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
        { key: 'planning-projecten', label: 'Projectplanningen' },
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
        { key: 'projectportaal-opdrachtgevers', label: 'Actieve opdrachtgever-projecten' },
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
              onClick={() => router.push('/admin/instellingen/profiel')}
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
              {/* Snel toevoegen */}
              <Dropdown
                menu={{
                  items: [
                    { 
                      key: 'new-project', 
                      label: 'Nieuw Project', 
                      icon: <ProjectOutlined />,
                      onClick: () => router.push('/admin/projecten/nieuw')
                    },
                    { 
                      key: 'new-calculatie', 
                      label: 'Nieuwe Calculatie', 
                      icon: <CalculatorOutlined />,
                      onClick: () => router.push('/admin/calculatie/nieuw')
                    },
                    { 
                      key: 'new-meerwerk', 
                      label: 'Meerwerk registreren', 
                      icon: <PlusCircleOutlined />,
                      onClick: () => router.push('/admin/bouwplaats/meerwerk/nieuw')
                    },
                    { 
                      key: 'new-document', 
                      label: 'Document uploaden', 
                      icon: <UploadOutlined />,
                      onClick: () => router.push('/admin/documenten/upload')
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
                      onClick: () => router.push('/admin/notificaties')
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
                      router.push('/admin/instellingen/systeem');
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
