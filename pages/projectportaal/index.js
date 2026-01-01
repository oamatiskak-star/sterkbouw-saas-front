import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import {
  Layout,
  Card,
  Row,
  Col,
  Tabs,
  Avatar,
  Progress,
  Button,
  Badge,
  Tag,
  Timeline,
  Table,
  Input,
  Form,
  Select,
  Upload,
  Modal,
  message,
  Statistic,
  Divider,
  List,
  Space,
  Descriptions,
  Calendar,
  Collapse,
  Alert,
  Tooltip,
  Drawer,
  Empty,
  UploadProps,
  DatePicker,
  Rate,
  Comment
} from "antd";
import {
  HomeOutlined,
  BuildOutlined,
  ToolOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  SettingOutlined,
  MessageOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  EuroOutlined,
  AreaChartOutlined,
  LikeOutlined,
  DislikeOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  CloudUploadOutlined,
  SendOutlined,
  PaperClipOutlined
} from "@ant-design/icons";

const { Content } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// Sample data
const SAMPLE_PURCHASE = {
  id: "KOOP-2024-001",
  type: "Appartement",
  adres: "Stationsstraat 123, 1012 AB Amsterdam",
  oppervlakte: 85,
  kamers: 3,
  prijs: 450000,
  bouwjaar: 2024,
  status: "in_aanbouw",
  voortgang: 65,
  opleverdatum: "2024-09-01",
  projectmanager: {
    naam: "Jan Jansen",
    telefoon: "+31 6 12345678",
    email: "jan.jansen@sterkbouw.nl"
  }
};

const CONSTRUCTION_PHASES = [
  { id: 1, fase: "Fundering", start: "2023-11-01", eind: "2024-01-15", status: "voltooid", voortgang: 100 },
  { id: 2, fase: "Skelet", start: "2024-01-16", eind: "2024-03-31", status: "voltooid", voortgang: 100 },
  { id: 3, fase: "Gevel & dak", start: "2024-04-01", eind: "2024-05-15", status: "in_uitvoering", voortgang: 80 },
  { id: 4, fase: "Installaties", start: "2024-05-16", eind: "2024-06-30", status: "in_planning", voortgang: 10 },
  { id: 5, fase: "Afwerking", start: "2024-07-01", eind: "2024-08-15", status: "in_planning", voortgang: 0 },
  { id: 6, fase: "Oplevering", start: "2024-08-16", eind: "2024-09-01", status: "in_planning", voortgang: 0 }
];

const DOCUMENTS = [
  { id: 1, naam: "Koopcontract", type: "pdf", grootte: "2.4 MB", datum: "2023-10-15", status: "getekend" },
  { id: 2, naam: "Technische tekeningen", type: "pdf", grootte: "8.7 MB", datum: "2023-11-20", status: "geüpload" },
  { id: 3, naam: "Meerwerk aanvraag", type: "docx", grootte: "1.2 MB", datum: "2024-02-10", status: "in_behandeling" },
  { id: 4, naam: "Garantiecertificaten", type: "pdf", grootte: "3.5 MB", datum: "2024-01-30", status: "gereed" },
  { id: 5, naam: "Opleverprotocol", type: "pdf", grootte: "4.1 MB", datum: "2024-03-15", status: "concept" },
  { id: 6, naam: "Financieringsovereenkomst", type: "pdf", grootte: "2.8 MB", datum: "2023-10-20", status: "getekend" }
];

const EXTRA_WORK_REQUESTS = [
  { id: 1, omschrijving: "Extra stopcontact keuken", datum: "2024-02-15", status: "goedgekeurd", kosten: 450 },
  { id: 2, omschrijving: "Inbouwspots woonkamer", datum: "2024-03-01", status: "in_beoordeling", kosten: 1200 },
  { id: 3, omschrijving: "Airconditioning unit", datum: "2024-03-10", status: "geweigerd", kosten: 3500 },
  { id: 4, omschrijving: "Verlaagd plafond badkamer", datum: "2024-02-28", status: "goedgekeurd", kosten: 850 }
];

const SUPPORT_TICKETS = [
  { id: 1, onderwerp: "Wijziging badkamertegels", datum: "2024-03-05", status: "in_behandeling", prioriteit: "hoog" },
  { id: 2, onderwerp: "Bezoek bouwplaats", datum: "2024-03-12", status: "opgelost", prioriteit: "gemiddeld" },
  { id: 3, onderwerp: "Financiering vraag", datum: "2024-03-15", status: "open", prioriteit: "laag" },
  { id: 4, onderwerp: "Garantie vraag", datum: "2024-03-18", status: "in_behandeling", prioriteit: "gemiddeld" }
];

const FAQ_CATEGORIES = [
  {
    id: 1,
    naam: "Bouwproces",
    vragen: [
      { vraag: "Wanneer kan ik de bouwplaats bezoeken?", antwoord: "Bouwplaatsbezoeken worden maandelijks georganiseerd op de laatste vrijdag van de maand." },
      { vraag: "Hoe wordt de bouwkwaliteit gecontroleerd?", antwoord: "Er wordt gewerkt met een kwaliteitshandboek en er zijn wekelijkse inspecties door onze kwaliteitsmanager." }
    ]
  },
  {
    id: 2,
    naam: "Meerwerk",
    vragen: [
      { vraag: "Wat zijn de kosten voor meerwerk?", antwoord: "Meerwerk wordt berekend op basis van materiaalkosten + 30% opslag. We werken met vaste uurtarieven." },
      { vraag: "Hoe lang duurt de goedkeuring?", antwoord: "Meerwerk aanvragen worden binnen 5 werkdagen beoordeeld en geprijsd." }
    ]
  },
  {
    id: 3,
    naam: "Financiën",
    vragen: [
      { vraag: "Wanneer moet ik betalen?", antwoord: "Betalingen verlopen volgens het in het koopcontract vastgelegde betalingsschema." },
      { vraag: "Wat zijn de bijkomende kosten?", antwoord: "Kosten zoals notaris, overdrachtsbelasting en NHG worden apart gefactureerd." }
    ]
  }
];

const TEAM_MEMBERS = [
  { naam: "Jan Jansen", functie: "Projectmanager", telefoon: "+31 6 12345678", email: "jan.jansen@sterkbouw.nl" },
  { naam: "Marie Bakker", functie: "Kwaliteitsmanager", telefoon: "+31 6 87654321", email: "marie.bakker@sterkbouw.nl" },
  { naam: "Piet Peters", functie: "Bouwcoördinator", telefoon: "+31 6 55556666", email: "piet.peters@sterkbouw.nl" }
];

export default function KopersPortaal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [purchaseData, setPurchaseData] = useState(SAMPLE_PURCHASE);
  const [messages, setMessages] = useState([]);  // GEEN TypeScript type
  const [newMessage, setNewMessage] = useState("");
  const [documents, setDocuments] = useState(DOCUMENTS);
  const [extraWorkRequests, setExtraWorkRequests] = useState(EXTRA_WORK_REQUESTS);
  const [supportTickets, setSupportTickets] = useState(SUPPORT_TICKETS);
  const [constructionPhases, setConstructionPhases] = useState(CONSTRUCTION_PHASES);
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [extraWorkForm] = Form.useForm();
  const [supportTicketForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  
  // Simuleer gebruikerslogin
  useEffect(() => {
    setUserData({
      id: "user_001",
      naam: "Piet de Vries",
      email: "piet.devries@email.nl",
      telefoon: "+31 6 98765432"
    });
    
    setMessages([
      { id: 1, sender: "projectmanager", text: "Goedemiddag, de fundering is voltooid. U kunt de foto's in het portaal bekijken.", timestamp: "2024-02-15 14:30" },
      { id: 2, sender: "user", text: "Dank u! Wanneer is het volgende bouwplaatsbezoek?", timestamp: "2024-02-15 14:45" },
      { id: 3, sender: "projectmanager", text: "Volgende vrijdag om 10:00 uur. Ik stuur u de uitnodiging toe.", timestamp: "2024-02-15 15:00" }
    ]);
  }, []);
  
  // Scroll naar onderen van chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Functies voor modals
  const openModal = (modalType: string) => {
    setShowModal(modalType);
  };
  
  const closeModal = () => {
    setShowModal(null);
    extraWorkForm.resetFields();
    supportTicketForm.resetFields();
    contactForm.resetFields();
  };
  
  // Bericht versturen
  const sendMessage = () => {
    if (!newMessage.trim()) {
      message.warning("Voer een bericht in");
      return;
    }
    
    const newMsg = {
      id: messages.length + 1,
      sender: "user",
      text: newMessage,
      timestamp: new Date().toISOString().split('T')[0] + " " + 
                new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // Simuleer antwoord
    setTimeout(() => {
      const responseMsg = {
        id: messages.length + 2,
        sender: "projectmanager",
        text: "Dank voor uw bericht. We nemen zo spoedig mogelijk contact met u op.",
        timestamp: new Date().toISOString().split('T')[0] + " " + 
                  new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 2000);
  };
  
  // Meerwerk aanvragen
  const submitExtraWorkRequest = (values: any) => {
    const newRequest = {
      id: extraWorkRequests.length + 1,
      omschrijving: values.omschrijving,
      ruimte: values.ruimte,
      datum: new Date().toISOString().split('T')[0],
      status: "in_beoordeling",
      kosten: 0,
      urgentie: values.urgentie,
      budget: values.budget ? parseFloat(values.budget) : null
    };
    
    setExtraWorkRequests([...extraWorkRequests, newRequest]);
    closeModal();
    message.success("Meerwerk aanvraag succesvol ingediend");
    setNotifications(prev => prev + 1);
  };
  
  // Support ticket aanmaken
  const submitSupportTicket = (values: any) => {
    const newTicket = {
      id: supportTickets.length + 1,
      onderwerp: values.onderwerp,
      categorie: values.categorie,
      datum: new Date().toISOString().split('T')[0],
      status: "open",
      prioriteit: values.urgentie
    };
    
    setSupportTickets([...supportTickets, newTicket]);
    closeModal();
    message.success("Support ticket succesvol aangemaakt");
    setNotifications(prev => prev + 1);
  };
  
  // Document downloaden
  const downloadDocument = (doc: any) => {
    message.success(`Download gestart: ${doc.naam}`);
  };
  
  // Status badge renderen
  const renderStatusBadge = (status: string) => {
    let color = "default";
    let text = "In afwachting";
    let icon = <ClockCircleOutlined />;
    
    switch(status) {
      case "voltooid":
      case "getekend":
      case "goedgekeurd":
      case "opgelost":
      case "gereed":
        color = "success";
        text = "Voltooid";
        icon = <CheckCircleOutlined />;
        break;
      case "in_uitvoering":
      case "in_behandeling":
      case "in_beoordeling":
      case "concept":
        color = "processing";
        text = "In behandeling";
        icon = <SyncOutlined spin />;
        break;
      case "geweigerd":
      case "delayed":
        color = "error";
        text = "Geweigerd";
        icon = <CloseCircleOutlined />;
        break;
    }
    
    return (
      <Tag icon={icon} color={color}>
        {text}
      </Tag>
    );
  };
  
  // Tijd tot oplevering berekenen
  const calculateTimeToDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(purchaseData.opleverdatum);
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Upload props
  const uploadProps: UploadProps = {
    name: 'file',
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} bestand succesvol geüpload`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload mislukt.`);
      }
    },
    beforeUpload(file) {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Bestand moet kleiner zijn dan 10MB');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };
  
  // Document kolommen
  const documentColumns = [
    {
      title: 'Document',
      dataIndex: 'naam',
      key: 'naam',
      render: (text: string, record: any) => (
        <Space>
          {record.type === 'pdf' ? <FilePdfOutlined style={{ color: '#ff4d4f' }} /> : 
           record.type === 'docx' ? <FileWordOutlined style={{ color: '#1890ff' }} /> : 
           <FileImageOutlined />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type.toUpperCase(),
    },
    {
      title: 'Grootte',
      dataIndex: 'grootte',
      key: 'grootte',
    },
    {
      title: 'Datum',
      dataIndex: 'datum',
      key: 'datum',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => renderStatusBadge(status),
    },
    {
      title: 'Acties',
      key: 'acties',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Voorbeeld">
            <Button type="text" icon={<EyeOutlined />} onClick={() => message.info(`Voorbeeld: ${record.naam}`)} />
          </Tooltip>
          <Tooltip title="Download">
            <Button type="text" icon={<DownloadOutlined />} onClick={() => downloadDocument(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // Meerwerk kolommen
  const extraWorkColumns = [
    {
      title: 'Omschrijving',
      dataIndex: 'omschrijving',
      key: 'omschrijving',
    },
    {
      title: 'Datum',
      dataIndex: 'datum',
      key: 'datum',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => renderStatusBadge(status),
    },
    {
      title: 'Kosten',
      dataIndex: 'kosten',
      key: 'kosten',
      render: (kosten: number) => kosten > 0 ? `€${kosten}` : 'Nog niet geprijsd',
    },
    {
      title: 'Acties',
      key: 'acties',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={() => message.info(`Details: ${record.omschrijving}`)}>
            Details
          </Button>
          {record.status === "in_beoordeling" && (
            <Button size="small" danger onClick={() => {
              Modal.confirm({
                title: 'Aanvraag annuleren',
                content: `Weet u zeker dat u de aanvraag "${record.omschrijving}" wilt annuleren?`,
                onOk: () => message.warning('Aanvraag geannuleerd')
              });
            }}>
              Annuleren
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  // Support ticket kolommen
  const supportTicketColumns = [
    {
      title: 'Onderwerp',
      dataIndex: 'onderwerp',
      key: 'onderwerp',
    },
    {
      title: 'Categorie',
      dataIndex: 'categorie',
      key: 'categorie',
      render: (categorie: string) => (
        <Tag color="blue">{categorie}</Tag>
      ),
    },
    {
      title: 'Datum',
      dataIndex: 'datum',
      key: 'datum',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => renderStatusBadge(status),
    },
    {
      title: 'Prioriteit',
      dataIndex: 'prioriteit',
      key: 'prioriteit',
      render: (prioriteit: string) => {
        let color = prioriteit === 'hoog' ? 'red' : prioriteit === 'gemiddeld' ? 'orange' : 'green';
        return <Tag color={color}>{prioriteit}</Tag>;
      },
    },
  ];
  
  // Bouwfase kolommen
  const constructionPhaseColumns = [
    {
      title: 'Fase',
      dataIndex: 'fase',
      key: 'fase',
      render: (fase: string, record: any) => (
        <div>
          <strong>{fase}</strong>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.start} - {record.eind}
          </div>
        </div>
      ),
    },
    {
      title: 'Voortgang',
      dataIndex: 'voortgang',
      key: 'voortgang',
      render: (voortgang: number) => (
        <div>
          <Progress percent={voortgang} size="small" />
          <div style={{ fontSize: '12px', textAlign: 'center' }}>{voortgang}%</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => renderStatusBadge(status),
    },
    {
      title: 'Acties',
      key: 'acties',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" onClick={() => openModal("phaseDetails")}>
            Details
          </Button>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            Foto's
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <Content style={{ padding: '24px' }}>
      {/* Header */}
      <Card 
        style={{ marginBottom: 24, borderRadius: '8px' }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>
                Mijn Koopwoning
              </h1>
              <Space size={4}>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                  {purchaseData.adres} • {purchaseData.type} • Oplevering: {purchaseData.opleverdatum}
                </span>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space size="large">
              <Badge count={notifications} size="small">
                <Avatar 
                  size="large" 
                  style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                  icon={<UserOutlined />}
                  onClick={() => message.info('Notificaties')}
                />
              </Badge>
              <Space direction="vertical" size={0}>
                <strong>{userData?.naam}</strong>
                <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: '12px' }}>{userData?.email}</span>
              </Space>
              <Tooltip title="Instellingen">
                <Button 
                  icon={<SettingOutlined />} 
                  type="text"
                  onClick={() => message.info('Instellingen pagina')}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* Hoofdtabs */}
      <Card 
        style={{ marginBottom: 24, borderRadius: '8px' }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          size="large"
          style={{ padding: '0 24px' }}
        >
          <TabPane
            tab={
              <span>
                <HomeOutlined />
                Dashboard
              </span>
            }
            key="dashboard"
          />
          <TabPane
            tab={
              <span>
                <BuildOutlined />
                Bouwproces
              </span>
            }
            key="bouwproces"
          />
          <TabPane
            tab={
              <span>
                <ToolOutlined />
                Meerwerk
              </span>
            }
            key="meerwerk"
          />
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Documenten
              </span>
            }
            key="documenten"
          />
          <TabPane
            tab={
              <span>
                <CustomerServiceOutlined />
                Ondersteuning
              </span>
            }
            key="ondersteuning"
          />
          <TabPane
            tab={
              <span>
                <QuestionCircleOutlined />
                Vraagbaak
              </span>
            }
            key="vraagbaak"
          />
        </Tabs>
        
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div style={{ padding: '24px' }}>
            {/* Snelle overzicht cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="🏗️ Bouwvoortgang"
                    value={purchaseData.voortgang}
                    suffix="%"
                  />
                  <Progress percent={purchaseData.voortgang} status="active" />
                  <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                    {calculateTimeToDelivery()} dagen tot oplevering
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="💰 Financiën"
                    value={purchaseData.prijs}
                    prefix="€"
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Divider style={{ margin: '12px 0' }} />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Row justify="space-between">
                      <span>Betaald:</span>
                      <strong>€{Math.round(purchaseData.prijs * 0.4).toLocaleString('nl-NL')}</strong>
                    </Row>
                    <Row justify="space-between">
                      <span>Openstaand:</span>
                      <strong>€{Math.round(purchaseData.prijs * 0.6).toLocaleString('nl-NL')}</strong>
                    </Row>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="📋 Meerwerk"
                    value={extraWorkRequests.length}
                    suffix="aanvragen"
                  />
                  <Divider style={{ margin: '12px 0' }} />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Row justify="space-between">
                      <span>Goedgekeurd:</span>
                      <span>{extraWorkRequests.filter(r => r.status === "goedgekeurd").length}</span>
                    </Row>
                    <Row justify="space-between">
                      <span>In behandeling:</span>
                      <span>{extraWorkRequests.filter(r => r.status === "in_beoordeling").length}</span>
                    </Row>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{purchaseData.projectmanager.naam}</div>
                    <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>Projectmanager</div>
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>
                    <MailOutlined /> {purchaseData.projectmanager.email}
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 16 }}>
                    <PhoneOutlined /> {purchaseData.projectmanager.telefoon}
                  </div>
                  <Button 
                    type="primary" 
                    block
                    icon={<MessageOutlined />}
                    onClick={() => openModal("contact")}
                  >
                    Stuur bericht
                  </Button>
                </Card>
              </Col>
            </Row>
            
            {/* Laatste updates en chat */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title="🔄 Laatste Updates"
                  extra={<Button type="link">Alles bekijken</Button>}
                >
                  <Timeline>
                    {constructionPhases.slice(0, 3).map((phase) => (
                      <Timeline.Item
                        key={phase.id}
                        color={
                          phase.status === "voltooid" ? "green" : 
                          phase.status === "in_uitvoering" ? "orange" : "gray"
                        }
                      >
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{phase.fase}</div>
                          <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', marginBottom: 8 }}>
                            {phase.start} - {phase.eind}
                          </div>
                          <Progress percent={phase.voortgang} size="small" />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 8 }}>
                            <span>{phase.voortgang}% voltooid</span>
                            <Button 
                              type="link" 
                              size="small"
                              onClick={() => openModal("phaseDetails")}
                            >
                              Details →
                            </Button>
                          </div>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <MessageOutlined />
                      Directe chat
                      <Tag color="blue">Realtime</Tag>
                    </Space>
                  }
                >
                  <div 
                    ref={chatContainerRef}
                    style={{ 
                      height: '300px', 
                      overflowY: 'auto', 
                      padding: '16px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '6px',
                      marginBottom: '16px'
                    }}
                  >
                    {messages.map((msg) => (
                      <Comment
                        key={msg.id}
                        author={msg.sender === 'user' ? 'U' : 'Projectmanager'}
                        avatar={
                          <Avatar
                            style={{ backgroundColor: msg.sender === 'user' ? '#1890ff' : '#52c41a' }}
                            icon={msg.sender === 'user' ? <UserOutlined /> : <TeamOutlined />}
                          />
                        }
                        content={<p>{msg.text}</p>}
                        datetime={
                          <Tooltip title={msg.timestamp}>
                            <span>{msg.timestamp}</span>
                          </Tooltip>
                        }
                        style={{
                          textAlign: msg.sender === 'user' ? 'right' : 'left',
                          marginBottom: '16px'
                        }}
                      />
                    ))}
                  </div>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      placeholder="Typ uw bericht..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onPressEnter={sendMessage}
                    />
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />}
                      onClick={sendMessage}
                    >
                      Verstuur
                    </Button>
                  </Space.Compact>
                </Card>
              </Col>
            </Row>
            
            {/* Snelle acties */}
            <Card title="⚡ Snelle Acties" style={{ marginTop: 24 }}>
              <Space wrap>
                <Button 
                  icon={<ToolOutlined />}
                  onClick={() => openModal("extraWork")}
                >
                  Meerwerk aanvragen
                </Button>
                <Button 
                  icon={<UploadOutlined />}
                  onClick={() => setActiveTab("documenten")}
                >
                  Document uploaden
                </Button>
                <Button 
                  icon={<CustomerServiceOutlined />}
                  onClick={() => openModal("supportTicket")}
                >
                  Support ticket
                </Button>
                <Button 
                  icon={<CalendarOutlined />}
                  onClick={() => message.info('Bouwplaats bezoek inplannen')}
                >
                  Bouwplaats bezoek
                </Button>
                <Button 
                  icon={<EuroOutlined />}
                  onClick={() => message.info('Financieel overzicht')}
                >
                  Financieel overzicht
                </Button>
              </Space>
            </Card>
          </div>
        )}
        
        {/* Bouwproces Tab */}
        {activeTab === "bouwproces" && (
          <div style={{ padding: '24px' }}>
            <Card 
              title="🏗️ Bouwproces & Planning"
              extra={
                <Space>
                  <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                    Totaal voortgang: {purchaseData.voortgang}%
                  </span>
                  <Progress percent={purchaseData.voortgang} size="small" style={{ width: 100 }} />
                </Space>
              }
            >
              <Alert
                message="Huidige fase: Gevel & dak"
                description="Deze fase is momenteel in uitvoering en voor 80% voltooid."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
              <Table
                columns={constructionPhaseColumns}
                dataSource={constructionPhases}
                pagination={false}
                style={{ marginBottom: 32 }}
                onRow={(record) => ({
                  onClick: () => openModal("phaseDetails"),
                })}
              />
              
              {/* Bouwkalender */}
              <Card title="📅 Bouwkalender" style={{ marginBottom: 32 }}>
                <Calendar
                  fullscreen={false}
                  headerRender={({ value, onChange }) => (
                    <div style={{ padding: 8, textAlign: 'center' }}>
                      <Button type="text" onClick={() => onChange(value.clone().subtract(1, 'month'))}>
                        ←
                      </Button>
                      <span style={{ margin: '0 16px', fontWeight: 600 }}>
                        {value.format('MMMM YYYY')}
                      </span>
                      <Button type="text" onClick={() => onChange(value.clone().add(1, 'month'))}>
                        →
                      </Button>
                    </div>
                  )}
                  dateCellRender={(date) => {
                    const day = date.date();
                    const hasEvent = day % 5 === 0;
                    const isToday = day === new Date().getDate();
                    
                    return (
                      <div style={{ position: 'relative' }}>
                        {isToday && (
                          <div style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 6,
                            height: 6,
                            background: '#1890ff',
                            borderRadius: '50%'
                          }} />
                        )}
                        {hasEvent && !isToday && (
                          <div style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 6,
                            height: 6,
                            background: '#faad14',
                            borderRadius: '50%'
                          }} />
                        )}
                      </div>
                    );
                  }}
                />
              </Card>
              
              {/* Bouwteam contact */}
              <Card title="👷 Bouwteam contactpersonen">
                <Row gutter={[24, 24]}>
                  {TEAM_MEMBERS.map((member, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                      <Card
                        hoverable
                        style={{ height: '100%' }}
                        actions={[
                          <Button 
                            type="link" 
                            icon={<MailOutlined />}
                            onClick={() => openModal("contact")}
                          >
                            Mail
                          </Button>,
                          <Button 
                            type="link" 
                            icon={<PhoneOutlined />}
                            onClick={() => message.info(`Bellen: ${member.telefoon}`)}
                          >
                            Bel
                          </Button>,
                        ]}
                      >
                        <Card.Meta
                          avatar={
                            <Avatar 
                              style={{ backgroundColor: '#1890ff' }}
                              icon={<UserOutlined />}
                            />
                          }
                          title={member.naam}
                          description={member.functie}
                        />
                        <Divider style={{ margin: '16px 0' }} />
                        <Space direction="vertical">
                          <div><PhoneOutlined /> {member.telefoon}</div>
                          <div><MailOutlined /> {member.email}</div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                  <Col xs={24} sm={12} lg={8}>
                    <Card
                      style={{ 
                        height: '100%',
                        borderColor: '#ff4d4f',
                        background: '#fff2f0'
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <WarningOutlined style={{ fontSize: 32, color: '#ff4d4f', marginBottom: 16 }} />
                        <h3 style={{ color: '#ff4d4f', marginBottom: 8 }}>24/7 Noodnummer</h3>
                        <p style={{ color: '#ff4d4f', fontWeight: 600, fontSize: 18 }}>
                          📱 +31 900 123 4567
                        </p>
                        <p style={{ fontSize: 12, color: '#ff4d4f' }}>
                          Alleen voor spoedgevallen buiten kantooruren
                        </p>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Card>
          </div>
        )}
        
        {/* Meerwerk Tab */}
        {activeTab === "meerwerk" && (
          <div style={{ padding: '24px' }}>
            <Card 
              title="🔧 Meerwerk & Wijzigingen"
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => openModal("extraWork")}
                >
                  Nieuwe aanvraag
                </Button>
              }
            >
              <Alert
                message="Let op: Meerwerk aanvragen"
                description="Meerwerk kan worden aangevraagd tot 60 dagen voor oplevering. Kosten worden binnen 5 werkdagen na aanvraag geprijsd."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
              <Table
                columns={extraWorkColumns}
                dataSource={extraWorkRequests}
                rowKey="id"
                style={{ marginBottom: 32 }}
              />
              
              {/* Populaire meerwerk opties */}
              <Card title="✨ Populaire meerwerk opties">
                <Row gutter={[24, 24]}>
                  {[
                    { naam: "Verlaagd plafond", prijs: "€850-€1200", ruimte: "Woonkamer/Slaapkamer", icon: "🏗️" },
                    { naam: "Inbouwspots", prijs: "€120-€180 per stuk", ruimte: "Alle ruimtes", icon: "💡" },
                    { naam: "Extra stopcontacten", prijs: "€45 per stuk", ruimte: "Keuken/Werkkamer", icon: "🔌" },
                    { naam: "Airconditioning", prijs: "€2500-€4500", ruimte: "Woonkamer/Slaapkamer", icon: "❄️" },
                    { naam: "Vloerverwarming", prijs: "€75-€100 per m²", ruimte: "Badkamer/Woonkamer", icon: "🔥" },
                    { naam: "Extra kasten", prijs: "€600-€1200", ruimte: "Slaapkamer/Gang", icon: "🚪" }
                  ].map((optie, index) => (
                    <Col xs={24} sm={12} md={8} key={index}>
                      <Card
                        hoverable
                        onClick={() => {
                          extraWorkForm.setFieldsValue({
                            omschrijving: optie.naam,
                            ruimte: optie.ruimte.split('/')[0].toLowerCase()
                          });
                          openModal("extraWork");
                        }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 32, marginBottom: 16 }}>{optie.icon}</div>
                          <h4 style={{ marginBottom: 8 }}>{optie.naam}</h4>
                          <div style={{ color: '#1890ff', fontWeight: 600, marginBottom: 8 }}>
                            {optie.prijs}
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                            {optie.ruimte}
                          </div>
                          <Button type="link" style={{ marginTop: 12 }}>
                            Snel aanvragen →
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Card>
          </div>
        )}
        
        {/* Documenten Tab */}
        {activeTab === "documenten" && (
          <div style={{ padding: '24px' }}>
            <Card title="📄 Documenten & Overeenkomsten">
              <Alert
                message="Alle documenten zijn digitaal ondertekend"
                description="U kunt alle documenten hier downloaden of nieuwe uploaden."
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
              {/* Document upload */}
              <Upload.Dragger
                {...uploadProps}
                style={{ padding: '40px 20px', marginBottom: 24 }}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">Klik of sleep bestanden om te uploaden</p>
                <p className="ant-upload-hint">
                  Ondersteunde formaten: PDF, DOC, DOCX, JPG, PNG (max. 10MB)
                </p>
              </Upload.Dragger>
              
              {/* Documenten lijst */}
              <Card title="Jouw documenten" style={{ marginBottom: 32 }}>
                <Table
                  columns={documentColumns}
                  dataSource={documents}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              </Card>
              
              {/* Document categorieën */}
              <Card title="Document categorieën">
                <Row gutter={[24, 24]}>
                  {[
                    { naam: "Contracten", aantal: 3, icon: "📑", color: "#1890ff" },
                    { naam: "Technische tekeningen", aantal: 12, icon: "🏗️", color: "#52c41a" },
                    { naam: "Facturen", aantal: 5, icon: "🧾", color: "#faad14" },
                    { naam: "Certificaten", aantal: 8, icon: "⭐", color: "#722ed1" },
                    { naam: "Meerwerk aanvragen", aantal: 4, icon: "🔧", color: "#f5222d" },
                    { naam: "Communicatie", aantal: 15, icon: "💬", color: "#13c2c2" }
                  ].map((cat, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={index}>
                      <Card
                        hoverable
                        style={{ textAlign: 'center' }}
                        onClick={() => message.info(`Toon documenten in categorie: ${cat.naam}`)}
                      >
                        <div style={{ 
                          fontSize: 32, 
                          marginBottom: 16,
                          color: cat.color 
                        }}>
                          {cat.icon}
                        </div>
                        <h4 style={{ marginBottom: 8 }}>{cat.naam}</h4>
                        <div style={{ fontSize: 24, fontWeight: 600, color: cat.color }}>
                          {cat.aantal}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                          documenten
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Card>
          </div>
        )}
        
        {/* Ondersteuning Tab */}
        {activeTab === "ondersteuning" && (
          <div style={{ padding: '24px' }}>
            <Card 
              title="💬 Ondersteuning & Contact"
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => openModal("supportTicket")}
                >
                  Nieuw ticket
                </Button>
              }
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card title="Jouw support tickets" style={{ height: '100%' }}>
                    <Table
                      columns={supportTicketColumns}
                      dataSource={supportTickets}
                      rowKey="id"
                      pagination={false}
                      onRow={(record) => ({
                        onClick: () => message.info(`Ticket details: ${record.onderwerp}`),
                      })}
                    />
                  </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Directe chat" style={{ height: '100%' }}>
                    <div 
                      ref={chatContainerRef}
                      style={{ 
                        height: '250px', 
                        overflowY: 'auto', 
                        padding: '16px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '6px',
                        marginBottom: '16px'
                      }}
                    >
                      {messages.length > 0 ? (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              padding: '8px 12px',
                              marginBottom: '8px',
                              background: msg.sender === 'user' ? '#e6f7ff' : '#f6ffed',
                              borderRadius: '6px',
                              border: '1px solid #91d5ff',
                              textAlign: msg.sender === 'user' ? 'right' : 'left'
                            }}
                          >
                            <div>{msg.text}</div>
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                              {msg.timestamp}
                            </div>
                          </div>
                        ))
                      ) : (
                        <Empty description="Geen berichten" />
                      )}
                    </div>
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        placeholder="Typ uw vraag..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onPressEnter={sendMessage}
                      />
                      <Button 
                        type="primary" 
                        icon={<SendOutlined />}
                        onClick={sendMessage}
                      >
                        Verstuur
                      </Button>
                    </Space.Compact>
                  </Card>
                  
                  <Card title="📋 Contactopties" style={{ marginTop: 24 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>Kantooruren telefoon</span>
                        <span>09:00 - 17:00</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>E-mail reactietijd</span>
                        <span>≤ 24 uur</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>Bouwplaats bezoeken</span>
                        <span>Vrijdag 10:00-12:00</span>
                      </div>
                    </Space>
                    <Divider />
                    <Space>
                      <Button icon={<MailOutlined />}>
                        E-mail support
                      </Button>
                      <Button icon={<MessageOutlined />}>
                        Live chat
                      </Button>
                      <Button type="primary" icon={<PhoneOutlined />}>
                        Bel nu
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Card>
          </div>
        )}
        
        {/* Vraagbaak Tab */}
        {activeTab === "vraagbaak" && (
          <div style={{ padding: '24px' }}>
            <Card title="❓ Veelgestelde Vragen & Informatie">
              {/* Zoekbalk */}
              <Space.Compact style={{ width: '100%', marginBottom: 32 }}>
                <Input
                  placeholder="Zoek in vragen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined />}
                  size="large"
                />
                <Button type="primary" size="large">
                  Zoeken
                </Button>
              </Space.Compact>
              
              {/* FAQ Categorieën */}
              <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {FAQ_CATEGORIES.map((category) => (
                  <Col xs={24} md={8} key={category.id}>
                    <Card
                      hoverable
                      onClick={() => message.info(`Categorie: ${category.naam}`)}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 32, marginBottom: 16, color: '#1890ff' }}>
                          {category.id === 1 ? '🏗️' : category.id === 2 ? '🔧' : '💰'}
                        </div>
                        <h3>{category.naam}</h3>
                        <div style={{ color: 'rgba(0,0,0,0.45)' }}>
                          {category.vragen.length} vragen
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              {/* FAQ Lijst */}
              <Card title="Populaire vragen" style={{ marginBottom: 32 }}>
                <Collapse accordion>
                  {FAQ_CATEGORIES.flatMap(cat => cat.vragen).map((faq, index) => (
                    <Panel 
                      header={`Q: ${faq.vraag}`} 
                      key={index}
                    >
                      <p>{faq.antwoord}</p>
                    </Panel>
                  ))}
                </Collapse>
              </Card>
              
              {/* Informatie secties */}
              <Card title="📚 Handige informatie">
                <Row gutter={[24, 24]}>
                  {[
                    { 
                      titel: "Bouwproces handleiding", 
                      beschrijving: "Stapsgewijze uitleg van het bouwproces",
                      icon: "📖",
                      color: "#1890ff"
                    },
                    { 
                      titel: "Meerwerk catalogus", 
                      beschrijving: "Complete lijst met mogelijk meerwerk",
                      icon: "🔧",
                      color: "#52c41a"
                    },
                    { 
                      titel: "Financieel overzicht", 
                      beschrijving: "Betalingsschema en kostenoverzicht",
                      icon: "💰",
                      color: "#faad14"
                    },
                    { 
                      titel: "Garantie voorwaarden", 
                      beschrijving: "Alle garantievoorwaarden en periodes",
                      icon: "⭐",
                      color: "#722ed1"
                    },
                    { 
                      titel: "Opleveringschecklist", 
                      beschrijving: "Wat te controleren bij oplevering",
                      icon: "✅",
                      color: "#13c2c2"
                    },
                    { 
                      titel: "Onderhoudstips", 
                      beschrijving: "Tips voor onderhoud van uw woning",
                      icon: "🔧",
                      color: "#f5222d"
                    }
                  ].map((info, index) => (
                    <Col xs={24} sm={12} md={8} key={index}>
                      <Card
                        hoverable
                        style={{ textAlign: 'center', height: '100%' }}
                        onClick={() => message.info(`Open: ${info.titel}`)}
                      >
                        <div style={{ 
                          fontSize: 32, 
                          marginBottom: 16,
                          color: info.color 
                        }}>
                          {info.icon}
                        </div>
                        <h4 style={{ marginBottom: 8 }}>{info.titel}</h4>
                        <p style={{ color: 'rgba(0,0,0,0.45)' }}>{info.beschrijving}</p>
                        <Button type="link">Open document</Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Card>
          </div>
        )}
      </Card>
      
      {/* Modals */}
      
      {/* Meerwerk aanvraag modal */}
      <Modal
        title={
          <Space>
            <ToolOutlined />
            Meerwerk aanvragen
          </Space>
        }
        open={showModal === "extraWork"}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={extraWorkForm}
          layout="vertical"
          onFinish={submitExtraWorkRequest}
        >
          <Form.Item
            name="omschrijving"
            label="Omschrijving"
            rules={[{ required: true, message: 'Voer een omschrijving in' }]}
          >
            <TextArea 
              placeholder="Beschrijf wat u wilt aanpassen of toevoegen..."
              rows={4}
            />
          </Form.Item>
          
          <Form.Item
            name="ruimte"
            label="Ruimte"
          >
            <Select placeholder="Selecteer ruimte">
              <Option value="woonkamer">Woonkamer</Option>
              <Option value="keuken">Keuken</Option>
              <Option value="badkamer">Badkamer</Option>
              <Option value="slaapkamer">Slaapkamer</Option>
              <Option value="balkon">Balkon</Option>
              <Option value="ander">Anders</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="urgentie"
            label="Urgentie"
            initialValue="normaal"
          >
            <Select>
              <Option value="normaal">Normaal (binnen 5 werkdagen)</Option>
              <Option value="spoed">Spoed (binnen 2 werkdagen)</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="budget"
            label="Budget indicatie (optioneel)"
          >
            <Input
              type="number"
              placeholder="€"
              prefix={<EuroOutlined />}
            />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={closeModal}>
                Annuleren
              </Button>
              <Button type="primary" htmlType="submit">
                Aanvraag indienen
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Support ticket modal */}
      <Modal
        title={
          <Space>
            <CustomerServiceOutlined />
            Support ticket aanmaken
          </Space>
        }
        open={showModal === "supportTicket"}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={supportTicketForm}
          layout="vertical"
          onFinish={submitSupportTicket}
        >
          <Form.Item
            name="onderwerp"
            label="Onderwerp"
            rules={[{ required: true, message: 'Voer een onderwerp in' }]}
          >
            <Input placeholder="Wat is uw vraag of probleem?" />
          </Form.Item>
          
          <Form.Item
            name="categorie"
            label="Categorie"
            initialValue="algemeen"
          >
            <Select>
              <Option value="algemeen">Algemeen</Option>
              <Option value="technisch">Technisch</Option>
              <Option value="financieel">Financieel</Option>
              <Option value="bouwproces">Bouwproces</Option>
              <Option value="meerwerk">Meerwerk</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="beschrijving"
            label="Beschrijving"
            rules={[{ required: true, message: 'Voer een beschrijving in' }]}
          >
            <TextArea 
              placeholder="Beschrijf uw vraag of probleem in detail..."
              rows={6}
            />
          </Form.Item>
          
          <Form.Item
            name="urgentie"
            label="Urgentie"
            initialValue="normaal"
          >
            <Select>
              <Option value="laag">Laag (binnen 3 werkdagen)</Option>
              <Option value="normaal">Normaal (binnen 24 uur)</Option>
              <Option value="hoog">Hoog (binnen 4 uur)</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={closeModal}>
                Annuleren
              </Button>
              <Button type="primary" htmlType="submit">
                Ticket aanmaken
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Contact modal */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            Bericht sturen aan projectmanager
          </Space>
        }
        open={showModal === "contact"}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={contactForm}
          layout="vertical"
          onFinish={() => {
            message.success('Bericht succesvol verzonden!');
            closeModal();
          }}
        >
          <Form.Item
            name="onderwerp"
            label="Onderwerp"
            initialValue="Vraag over mijn koopwoning"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="bericht"
            label="Bericht"
            rules={[{ required: true, message: 'Voer een bericht in' }]}
          >
            <TextArea 
              placeholder="Typ uw bericht aan de projectmanager..."
              rows={8}
            />
          </Form.Item>
          
          <Form.Item
            name="bijlage"
            label="Bijlage (optioneel)"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Bestand selecteren</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={closeModal}>
                Annuleren
              </Button>
              <Button type="primary" htmlType="submit">
                Bericht verzenden
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Bouwfase details modal */}
      <Drawer
        title="🏗️ Bouwfase details"
        placement="right"
        onClose={closeModal}
        open={showModal === "phaseDetails"}
        width={600}
      >
        <Descriptions title="Fundering fase" column={1} bordered>
          <Descriptions.Item label="Status">
            <Tag color="success">Voltooid</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Periode">
            1 november 2023 - 15 januari 2024
          </Descriptions.Item>
          <Descriptions.Item label="Voortgang">
            100%
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <h4>Uitgevoerde werkzaamheden:</h4>
        <List
          size="small"
          dataSource={[
            'Grondonderzoek uitgevoerd',
            'Paalfundering geplaatst (120 stuks)',
            'Funderingplaat gestort (C25/30 beton)',
            'Kruipruimte gecreëerd'
          ]}
          renderItem={(item) => (
            <List.Item>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              {item}
            </List.Item>
          )}
        />
        
        <Divider />
        
        <h4>Kwaliteitscontroles:</h4>
        <Alert
          message="Alle controles succesvol"
          description="✅ Alle certificaten aanwezig | ✅ Drukproeven uitgevoerd | ✅ Keuring door gemeente goedgekeurd"
          type="success"
          showIcon
        />
        
        <Divider />
        
        <h4>Foto's:</h4>
        <Row gutter={[8, 8]}>
          {[1, 2, 3].map((num) => (
            <Col span={8} key={num}>
              <div
                style={{
                  height: 100,
                  background: '#f0f0f0',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => message.info(`Foto ${num} vergroten`)}
              >
                <FileImageOutlined style={{ fontSize: 24, color: '#999' }} />
                <div style={{ marginLeft: 8 }}>Foto {num}</div>
              </div>
            </Col>
          ))}
        </Row>
        
        <Divider />
        
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button type="primary" icon={<DownloadOutlined />}>
            Alle documenten downloaden
          </Button>
        </Space>
      </Drawer>
    </Content>
  );
}
