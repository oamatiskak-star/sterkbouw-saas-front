import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import supabase from "@/lib/supabase";

const API_BASE = "https://sterkbouw-saas-executor-production.up.railway.app";

const styles = {
  wrap: { maxWidth: 1600, margin: "0 auto", padding: 24 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: "2px solid #e5e7eb"
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 16
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: 18
  },
  progressBar: {
    height: 6,
    background: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8
  },
  progressFill: {
    height: "100%",
    background: "#10b981",
    borderRadius: 3,
    transition: "width 0.3s"
  },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    height: "100%"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginBottom: 24
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
    marginBottom: 24
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 24,
    marginBottom: 24
  },
  tabContainer: {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 24,
    overflowX: "auto"
  },
  tab: {
    padding: "12px 24px",
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s",
    whiteSpace: "nowrap"
  },
  tabActive: {
    color: "#2563eb",
    borderBottomColor: "#2563eb"
  },
  button: {
    padding: "12px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: 8
  },
  buttonSecondary: {
    padding: "12px 20px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: 8
  },
  buttonSuccess: {
    padding: "12px 20px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: 8
  },
  timeline: {
    position: "relative",
    paddingLeft: 24
  },
  timelineItem: {
    position: "relative",
    paddingBottom: 24,
    paddingLeft: 24
  },
  timelineDot: {
    position: "absolute",
    left: -8,
    top: 0,
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "3px solid white"
  },
  timelineContent: {
    padding: 16,
    background: "#f9fafb",
    borderRadius: 8,
    border: "1px solid #e5e7eb"
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
    marginBottom: 8,
    fontSize: 14
  },
  messageSender: {
    background: "#eff6ff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4
  },
  messageReceiver: {
    background: "#f3f4f6",
    alignSelf: "flex-end",
    borderTopRightRadius: 4
  },
  documentCard: {
    padding: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    transition: "all 0.2s"
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500
  },
  statusCompleted: { background: "#d1fae5", color: "#065f46" },
  statusInProgress: { background: "#fef3c7", color: "#92400e" },
  statusPending: { background: "#e5e7eb", color: "#374151" },
  statusDelayed: { background: "#fee2e2", color: "#991b1b" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modalContent: {
    background: "white",
    borderRadius: 12,
    padding: 32,
    maxWidth: 600,
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  formGroup: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 6
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    minHeight: 120,
    resize: "vertical"
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    background: "white",
    cursor: "pointer"
  },
  alert: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  alertInfo: { background: "#eff6ff", color: "#1e40af" },
  alertSuccess: { background: "#d1fae5", color: "#065f46" },
  alertWarning: { background: "#fef3c7", color: "#92400e" },
  alertError: { background: "#fee2e2", color: "#991b1b" },
  fileUpload: {
    padding: 24,
    border: "2px dashed #d1d5db",
    borderRadius: 8,
    background: "#f9fafb",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s"
  },
  chatContainer: {
    height: 400,
    display: "flex",
    flexDirection: "column",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden"
  },
  chatMessages: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column"
  },
  chatInput: {
    padding: 16,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: 12
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    background: "#ef4444",
    color: "white",
    fontSize: 11,
    fontWeight: 600,
    width: 18,
    height: 18,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

// Voorbeeld data
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

export default function KopersPortaal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [purchaseData, setPurchaseData] = useState(SAMPLE_PURCHASE);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newExtraWork, setNewExtraWork] = useState({
    omschrijving: "",
    ruimte: "",
    urgentie: "normaal",
    budget: ""
  });
  const [newSupportTicket, setNewSupportTicket] = useState({
    onderwerp: "",
    categorie: "algemeen",
    beschrijving: "",
    urgentie: "normaal"
  });
  const [documents, setDocuments] = useState(DOCUMENTS);
  const [extraWorkRequests, setExtraWorkRequests] = useState(EXTRA_WORK_REQUESTS);
  const [supportTickets, setSupportTickets] = useState(SUPPORT_TICKETS);
  const [constructionPhases, setConstructionPhases] = useState(CONSTRUCTION_PHASES);
  const [notifications, setNotifications] = useState(3);
  
  const chatContainerRef = useRef(null);
  
  // Simuleer gebruikerslogin
  useEffect(() => {
    // In een echte app zou dit uit een auth systeem komen
    setUserData({
      id: "user_001",
      naam: "Piet de Vries",
      email: "piet.devries@email.nl",
      telefoon: "+31 6 98765432"
    });
    
    // Laad berichten
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
  const openModal = (modalType) => {
    setShowModal(modalType);
  };
  
  const closeModal = () => {
    setShowModal(null);
  };
  
  // Bericht versturen
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
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
  const submitExtraWorkRequest = () => {
    if (!newExtraWork.omschrijving) {
      alert("Vul een omschrijving in");
      return;
    }
    
    const newRequest = {
      id: extraWorkRequests.length + 1,
      omschrijving: newExtraWork.omschrijving,
      ruimte: newExtraWork.ruimte,
      datum: new Date().toISOString().split('T')[0],
      status: "in_beoordeling",
      kosten: 0,
      urgentie: newExtraWork.urgentie,
      budget: newExtraWork.budget ? parseFloat(newExtraWork.budget) : null
    };
    
    setExtraWorkRequests([...extraWorkRequests, newRequest]);
    setNewExtraWork({
      omschrijving: "",
      ruimte: "",
      urgentie: "normaal",
      budget: ""
    });
    closeModal();
    
    // Notificatie
    setNotifications(prev => prev + 1);
  };
  
  // Support ticket aanmaken
  const submitSupportTicket = () => {
    if (!newSupportTicket.onderwerp || !newSupportTicket.beschrijving) {
      alert("Vul onderwerp en beschrijving in");
      return;
    }
    
    const newTicket = {
      id: supportTickets.length + 1,
      onderwerp: newSupportTicket.onderwerp,
      categorie: newSupportTicket.categorie,
      datum: new Date().toISOString().split('T')[0],
      status: "open",
      prioriteit: newSupportTicket.urgent
    };
    
    setSupportTickets([...supportTickets, newTicket]);
    setNewSupportTicket({
      onderwerp: "",
      categorie: "algemeen",
      beschrijving: "",
      urgentie: "normaal"
    });
    closeModal();
    
    // Notificatie
    setNotifications(prev => prev + 1);
  };
  
  // Document downloaden
  const downloadDocument = (document) => {
    // Simuleer download
    alert(`Download gestart: ${document.naam}`);
  };
  
  // Bouwfase details tonen
  const showPhaseDetails = (phase) => {
    setShowModal("phaseDetails");
    // Hier zou je specifieke fase details kunnen laden
  };
  
  // Render voortgangsindicator
  const renderProgressBar = (percentage) => {
    return (
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${percentage}%` }}></div>
      </div>
    );
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    let style = styles.statusPending;
    let text = "In afwachting";
    
    switch(status) {
      case "voltooid":
      case "getekend":
      case "goedgekeurd":
      case "opgelost":
        style = styles.statusCompleted;
        text = "Voltooid";
        break;
      case "in_uitvoering":
      case "in_behandeling":
      case "in_beoordeling":
        style = styles.statusInProgress;
        text = "In behandeling";
        break;
      case "geweigerd":
      case "delayed":
        style = styles.statusDelayed;
        text = "Geweigerd";
        break;
    }
    
    return <span style={{ ...styles.statusBadge, ...style }}>{text}</span>;
  };
  
  // Tijd tot oplevering berekenen
  const calculateTimeToDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(purchaseData.opleverdatum);
    const diffTime = deliveryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1f2937" }}>Mijn Koopwoning</h1>
          <p style={{ color: "#6b7280", marginTop: 4 }}>
            {purchaseData.adres} • {purchaseData.type} • Oplevering: {purchaseData.opleverdatum}
          </p>
        </div>
        
        <div style={styles.userInfo}>
          <div style={{ position: "relative" }}>
            <div style={styles.avatar}>
              {userData?.naam?.charAt(0)}
            </div>
            {notifications > 0 && (
              <div style={styles.notificationBadge}>{notifications}</div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{userData?.naam}</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>{userData?.email}</div>
          </div>
          <button 
            style={styles.buttonSecondary}
            onClick={() => alert("Instellingen pagina")}
          >
            ⚙️ Instellingen
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tab, ...(activeTab === "dashboard" && styles.tabActive) }}
          onClick={() => setActiveTab("dashboard")}
        >
          🏠 Dashboard
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === "bouwproces" && styles.tabActive) }}
          onClick={() => setActiveTab("bouwproces")}
        >
          🏗️ Bouwproces
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === "meerwerk" && styles.tabActive) }}
          onClick={() => setActiveTab("meerwerk")}
        >
          🔧 Meerwerk
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === "documenten" && styles.tabActive) }}
          onClick={() => setActiveTab("documenten")}
        >
          📄 Documenten
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === "ondersteuning" && styles.tabActive) }}
          onClick={() => setActiveTab("ondersteuning")}
        >
          💬 Ondersteuning
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === "vraagbaak" && styles.tabActive) }}
          onClick={() => setActiveTab("vraagbaak")}
        >
          ❓ Vraagbaak
        </button>
      </div>
      
      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <>
          {/* Snelle overzicht cards */}
          <div style={styles.grid4}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🏗️ Bouwvoortgang</div>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                {purchaseData.voortgang}%
              </div>
              {renderProgressBar(purchaseData.voortgang)}
              <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>
                {calculateTimeToDelivery()} dagen tot oplevering
              </div>
            </div>
            
            <div style={styles.card}>
              <div style={styles.cardTitle}>💰 Financiën</div>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                €{purchaseData.prijs.toLocaleString('nl-NL')}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                Koopsom
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span>Betaald:</span>
                <span style={{ fontWeight: 600 }}>€{Math.round(purchaseData.prijs * 0.4).toLocaleString('nl-NL')}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 4 }}>
                <span>Openstaand:</span>
                <span style={{ fontWeight: 600 }}>€{Math.round(purchaseData.prijs * 0.6).toLocaleString('nl-NL')}</span>
              </div>
            </div>
            
            <div style={styles.card}>
              <div style={styles.cardTitle}>📋 Meerwerk</div>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                {extraWorkRequests.length}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
                Aanvragen
              </div>
              <div style={{ fontSize: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Goedgekeurd:</span>
                  <span>{extraWorkRequests.filter(r => r.status === "goedgekeurd").length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>In behandeling:</span>
                  <span>{extraWorkRequests.filter(r => r.status === "in_beoordeling").length}</span>
                </div>
              </div>
            </div>
            
            <div style={styles.card}>
              <div style={styles.cardTitle}>📞 Contact</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{purchaseData.projectmanager.naam}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Projectmanager</div>
              </div>
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                📧 {purchaseData.projectmanager.email}
              </div>
              <div style={{ fontSize: 14 }}>
                📱 {purchaseData.projectmanager.telefoon}
              </div>
              <button 
                style={{ ...styles.button, marginTop: 16, width: "100%" }}
                onClick={() => openModal("contact")}
              >
                ✉️ Stuur bericht
              </button>
            </div>
          </div>
          
          {/* Laatste updates en chat */}
          <div style={styles.grid2}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>🔄 Laatste Updates</div>
              <div style={styles.timeline}>
                {constructionPhases.slice(0, 3).map((phase, index) => (
                  <div key={phase.id} style={styles.timelineItem}>
                    <div style={{
                      ...styles.timelineDot,
                      background: phase.status === "voltooid" ? "#10b981" : 
                                  phase.status === "in_uitvoering" ? "#f59e0b" : "#d1d5db",
                      borderColor: phase.status === "voltooid" ? "#d1fae5" : 
                                   phase.status === "in_uitvoering" ? "#fef3c7" : "#e5e7eb"
                    }}></div>
                    <div style={styles.timelineContent}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{phase.fase}</div>
                      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                        {phase.start} - {phase.eind}
                      </div>
                      {renderProgressBar(phase.voortgang)}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8 }}>
                        <span>{phase.voortgang}% voltooid</span>
                        <button 
                          style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer" }}
                          onClick={() => showPhaseDetails(phase)}
                        >
                          Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={styles.card}>
              <div style={{ ...styles.cardTitle, justifyContent: "space-between" }}>
                <span>💬 Directe chat</span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Realtime</span>
              </div>
              <div style={styles.chatContainer}>
                <div ref={chatContainerRef} style={styles.chatMessages}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.messageBubble,
                        ...(msg.sender === "user" ? styles.messageReceiver : styles.messageSender),
                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start"
                      }}
                    >
                      <div>{msg.text}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, textAlign: "right" }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.chatInput}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Typ uw bericht..."
                    style={{ flex: 1, padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button 
                    style={styles.button}
                    onClick={sendMessage}
                  >
                    Verstuur
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Snelle acties */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>⚡ Snelle Acties</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button 
                style={styles.buttonSecondary}
                onClick={() => openModal("extraWork")}
              >
                🔧 Meerwerk aanvragen
              </button>
              <button 
                style={styles.buttonSecondary}
                onClick={() => setActiveTab("documenten")}
              >
                📄 Document uploaden
              </button>
              <button 
                style={styles.buttonSecondary}
                onClick={() => openModal("supportTicket")}
              >
                🎫 Support ticket aanmaken
              </button>
              <button 
                style={styles.buttonSecondary}
                onClick={() => alert("Bouwplaats bezoek inplannen")}
              >
                🏗️ Bouwplaats bezoek
              </button>
              <button 
                style={styles.buttonSecondary}
                onClick={() => alert("Financieel overzicht")}
              >
                💰 Financieel overzicht
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Bouwproces Tab */}
      {activeTab === "bouwproces" && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>🏗️ Bouwproces & Planning</div>
          
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Bouwfasen overzicht</h3>
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Totaal voortgang: {purchaseData.voortgang}%
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              {constructionPhases.map((phase) => (
                <div 
                  key={phase.id} 
                  style={{ 
                    padding: 16, 
                    border: "1px solid #e5e7eb", 
                    borderRadius: 8,
                    background: phase.status === "in_uitvoering" ? "#f0fdf4" : "white",
                    cursor: "pointer"
                  }}
                  onClick={() => showPhaseDetails(phase)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontWeight: 600 }}>{phase.fase}</div>
                    {renderStatusBadge(phase.status)}
                  </div>
                  
                  <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
                    📅 {phase.start} - {phase.eind}
                  </div>
                  
                  {renderProgressBar(phase.voortgang)}
                  
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                    <span>Voortgang: {phase.voortgang}%</span>
                    {phase.status === "in_uitvoering" && (
                      <span style={{ color: "#10b981" }}>● Actief</span>
                    )}
                  </div>
                  
                  {phase.status === "voltooid" && (
                    <div style={{ marginTop: 12, padding: 8, background: "#f9fafb", borderRadius: 6, fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Foto's:</span>
                        <a href="#" style={{ color: "#2563eb" }}>Bekijk (3)</a>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <span>Certificaten:</span>
                        <a href="#" style={{ color: "#2563eb" }}>Download</a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Bouwkalender */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📅 Bouwkalender</h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(7, 1fr)", 
              gap: 8,
              padding: 16,
              background: "#f9fafb",
              borderRadius: 8
            }}>
              {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
                <div key={day} style={{ textAlign: "center", fontWeight: 600, fontSize: 14 }}>{day}</div>
              ))}
              
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const hasEvent = day % 5 === 0; // Simuleer events
                const isToday = day === new Date().getDate();
                
                return (
                  <div 
                    key={day}
                    style={{
                      padding: 8,
                      textAlign: "center",
                      background: isToday ? "#2563eb" : hasEvent ? "#fef3c7" : "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      color: isToday ? "white" : "#374151",
                      cursor: "pointer",
                      position: "relative"
                    }}
                  >
                    {day}
                    {hasEvent && !isToday && (
                      <div style={{ 
                        position: "absolute", 
                        top: 2, 
                        right: 2,
                        width: 4, 
                        height: 4, 
                        background: "#f59e0b", 
                        borderRadius: "50%" 
                      }}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Bouwteam contact */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>👷 Bouwteam contactpersonen</h3>
            <div style={styles.grid3}>
              <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Jan Jansen</div>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>Projectmanager</div>
                <div style={{ fontSize: 14 }}>📱 +31 6 12345678</div>
                <button 
                  style={{ ...styles.button, marginTop: 12, width: "100%" }}
                  onClick={() => openModal("contact")}
                >
                  ✉️ Bericht sturen
                </button>
              </div>
              
              <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Marie Bakker</div>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>Kwaliteitsmanager</div>
                <div style={{ fontSize: 14 }}>📱 +31 6 87654321</div>
                <button 
                  style={{ ...styles.buttonSecondary, marginTop: 12, width: "100%" }}
                  onClick={() => alert("Bel kwaliteitsmanager")}
                >
                  📞 Bellen
                </button>
              </div>
              
              <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>24/7 Noodnummer</div>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>Bij spoedgevallen</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>📱 +31 900 123 4567</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                  Alleen voor spoedgevallen buiten kantooruren
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Meerwerk Tab */}
      {activeTab === "meerwerk" && (
        <div style={styles.card}>
          <div style={{ ...styles.cardTitle, justifyContent: "space-between" }}>
            <span>🔧 Meerwerk & Wijzigingen</span>
            <button 
              style={styles.button}
              onClick={() => openModal("extraWork")}
            >
              + Nieuwe aanvraag
            </button>
          </div>
          
          <div style={{ marginBottom: 32 }}>
            <div style={{ 
              ...styles.alert, 
              ...styles.alertInfo,
              marginBottom: 24 
            }}>
              <div>💡</div>
              <div>
                <div style={{ fontWeight: 600 }}>Let op: Meerwerk aanvragen</div>
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  Meerwerk kan worden aangevraagd tot 60 dagen voor oplevering. 
                  Kosten worden binnen 5 werkdagen na aanvraag geprijsd.
                </div>
              </div>
            </div>
            
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Jouw meerwerk aanvragen</h3>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Omschrijving</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Datum</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Kosten</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {extraWorkRequests.map((request) => (
                    <tr key={request.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 500 }}>{request.omschrijving}</div>
                        {request.ruimte && (
                          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Ruimte: {request.ruimte}</div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>{request.datum}</td>
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        {renderStatusBadge(request.status)}
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        {request.kosten > 0 ? `€${request.kosten}` : "Nog niet geprijsd"}
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button 
                            style={{ 
                              padding: "6px 12px", 
                              fontSize: 12, 
                              background: "none", 
                              border: "1px solid #d1d5db",
                              borderRadius: 4,
                              cursor: "pointer"
                            }}
                            onClick={() => alert(`Details van: ${request.omschrijving}`)}
                          >
                            Details
                          </button>
                          {request.status === "in_beoordeling" && (
                            <button 
                              style={{ 
                                padding: "6px 12px", 
                                fontSize: 12, 
                                background: "#ef4444", 
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer"
                              }}
                              onClick={() => alert("Aanvraag annuleren?")}
                            >
                              Annuleren
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Meerwerk catalogus */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>✨ Populaire meerwerk opties</h3>
            <div style={styles.grid3}>
              {[
                { naam: "Verlaagd plafond", prijs: "€850-€1200", ruimte: "Woonkamer/Slaapkamer" },
                { naam: "Inbouwspots", prijs: "€120-€180 per stuk", ruimte: "Alle ruimtes" },
                { naam: "Extra stopcontacten", prijs: "€45 per stuk", ruimte: "Keuken/Werkkamer" },
                { naam: "Airconditioning", prijs: "€2500-€4500", ruimte: "Woonkamer/Slaapkamer" },
                { naam: "Vloerverwarming", prijs: "€75-€100 per m²", ruimte: "Badkamer/Woonkamer" },
                { naam: "Extra kasten", prijs: "€600-€1200", ruimte: "Slaapkamer/Gang" }
              ].map((optie, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: 16, 
                    border: "1px solid #e5e7eb", 
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onClick={() => {
                    setNewExtraWork({
                      omschrijving: optie.naam,
                      ruimte: optie.ruimte,
                      urgentie: "normaal",
                      budget: ""
                    });
                    openModal("extraWork");
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{optie.naam}</div>
                  <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>{optie.prijs}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{optie.ruimte}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Documenten Tab */}
      {activeTab === "documenten" && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>📄 Documenten & Overeenkomsten</div>
          
          <div style={{ 
            ...styles.alert, 
            ...styles.alertSuccess,
            marginBottom: 24 
          }}>
            <div>✅</div>
            <div>
              <div style={{ fontWeight: 600 }}>Alle documenten zijn digitaal ondertekend</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>
                U kunt alle documenten hier downloaden of nieuwe uploaden.
              </div>
            </div>
          </div>
          
          {/* Document upload */}
          <div 
            style={styles.fileUpload}
            onClick={() => document.getElementById('file-input').click()}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Upload nieuw document</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              Sleep bestanden hierheen of klik om te selecteren
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
              Ondersteunde formaten: PDF, DOC, DOCX, JPG, PNG (max. 10MB)
            </div>
          </div>
          <input 
            id="file-input"
            type="file" 
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                alert(`Bestand geselecteerd: ${file.name}`);
                // Hier zou je het bestand uploaden naar de server
              }
            }}
          />
          
          {/* Documenten lijst */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Jouw documenten</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  style={styles.documentCard}
                  onClick={() => downloadDocument(doc)}
                >
                  <div style={{ fontSize: 24 }}>
                    {doc.type === "pdf" ? "📄" : doc.type === "docx" ? "📝" : "📎"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{doc.naam}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
                      <span>{doc.grootte}</span>
                      <span>{doc.datum}</span>
                    </div>
                  </div>
                  <div>
                    {renderStatusBadge(doc.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Document categorieën */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Document categorieën</h3>
            <div style={styles.grid4}>
              {[
                { naam: "Contracten", aantal: 3, icon: "📑" },
                { naam: "Technische tekeningen", aantal: 12, icon: "🏗️" },
                { naam: "Facturen", aantal: 5, icon: "🧾" },
                { naam: "Certificaten", aantal: 8, icon: "⭐" }
              ].map((cat, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: 16, 
                    border: "1px solid #e5e7eb", 
                    borderRadius: 8,
                    textAlign: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => alert(`Toon documenten in categorie: ${cat.naam}`)}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{cat.icon}</div>
                  <div style={{ fontWeight: 600 }}>{cat.naam}</div>
                  <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>{cat.aantal} documenten</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Ondersteuning Tab */}
      {activeTab === "ondersteuning" && (
        <div style={styles.card}>
          <div style={{ ...styles.cardTitle, justifyContent: "space-between" }}>
            <span>💬 Ondersteuning & Contact</span>
            <button 
              style={styles.button}
              onClick={() => openModal("supportTicket")}
            >
              🎫 Nieuw ticket
            </button>
          </div>
          
          <div style={styles.grid2}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Jouw support tickets</h3>
              
              <div style={{ marginBottom: 24 }}>
                {supportTickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    style={{ 
                      padding: 16, 
                      border: "1px solid #e5e7eb", 
                      borderRadius: 8,
                      marginBottom: 12,
                      cursor: "pointer"
                    }}
                    onClick={() => alert(`Ticket details: ${ticket.onderwerp}`)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontWeight: 600 }}>{ticket.onderwerp}</div>
                      {renderStatusBadge(ticket.status)}
                    </div>
                    <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                      📅 {ticket.datum} • Prioriteit: {ticket.prioriteit}
                    </div>
                    <div style={{ fontSize: 12, color: "#2563eb", display: "flex", justifyContent: "flex-end" }}>
                      Bekijk conversatie →
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ 
                padding: 16, 
                background: "#f9fafb", 
                borderRadius: 8,
                border: "1px solid #e5e7eb"
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>📞 Contactopties</div>
                <div style={{ fontSize: 14, marginBottom: 12 }}>
                  Kies de beste manier om contact op te nemen:
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button style={styles.buttonSecondary}>
                    📧 E-mail support
                  </button>
                  <button style={styles.buttonSecondary}>
                    💬 Live chat
                  </button>
                  <button style={styles.button}>
                    📱 Bel nu
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Directe chat</h3>
              <div style={styles.chatContainer}>
                <div style={styles.chatMessages}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.messageBubble,
                        ...(msg.sender === "user" ? styles.messageReceiver : styles.messageSender),
                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start"
                      }}
                    >
                      <div>{msg.text}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, textAlign: "right" }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.chatInput}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Typ uw vraag..."
                    style={{ flex: 1, padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button 
                    style={styles.button}
                    onClick={sendMessage}
                  >
                    Verstuur
                  </button>
                </div>
              </div>
              
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📋 Veelgestelde contactmomenten</h4>
                <div style={{ fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                    <span>Kantooruren telefoon</span>
                    <span>09:00 - 17:00</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                    <span>E-mail reactietijd</span>
                    <span>≤ 24 uur</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                    <span>Bouwplaats bezoeken</span>
                    <span>Vrijdag 10:00-12:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Vraagbaak Tab */}
      {activeTab === "vraagbaak" && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>❓ Veelgestelde Vragen & Informatie</div>
          
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Zoek in vragen..."
                style={{ 
                  flex: 1, 
                  padding: "12px 16px", 
                  border: "1px solid #d1d5db", 
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
              <button style={styles.button}>
                🔍 Zoeken
              </button>
            </div>
            
            {/* FAQ Categorieën */}
            <div style={styles.grid3}>
              {FAQ_CATEGORIES.map((category) => (
                <div key={category.id} style={{ 
                  padding: 16, 
                  border: "1px solid #e5e7eb", 
                  borderRadius: 8,
                  cursor: "pointer"
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>{category.naam}</div>
                  <div style={{ fontSize: 14, color: "#6b7280" }}>
                    {category.vragen.length} vragen
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* FAQ Lijst */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Populaire vragen</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FAQ_CATEGORIES.flatMap(cat => cat.vragen).slice(0, 6).map((faq, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: 16, 
                    border: "1px solid #e5e7eb", 
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                  onClick={() => alert(`Antwoord: ${faq.antwoord}`)}
                >
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Q: {faq.vraag}</div>
                  <div style={{ fontSize: 14, color: "#6b7280" }}>{faq.antwoord.substring(0, 100)}...</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Informatie secties */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📚 Handige informatie</h3>
            
            <div style={styles.grid3}>
              {[
                { 
                  titel: "Bouwproces handleiding", 
                  beschrijving: "Stapsgewijze uitleg van het bouwproces",
                  icon: "📖"
                },
                { 
                  titel: "Meerwerk catalogus", 
                  beschrijving: "Complete lijst met mogelijk meerwerk",
                  icon: "🔧"
                },
                { 
                  titel: "Financieel overzicht", 
                  beschrijving: "Betalingsschema en kostenoverzicht",
                  icon: "💰"
                },
                { 
                  titel: "Garantie voorwaarden", 
                  beschrijving: "Alle garantievoorwaarden en periodes",
                  icon: "⭐"
                },
                { 
                  titel: "Opleveringschecklist", 
                  beschrijving: "Wat te controleren bij oplevering",
                  icon: "✅"
                },
                { 
                  titel: "Onderhoudstips", 
                  beschrijving: "Tips voor onderhoud van uw woning",
                  icon: "🔧"
                }
              ].map((info, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: 16, 
                    border: "1px solid #e5e7eb", 
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                  onClick={() => alert(`Open: ${info.titel}`)}
                >
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{info.icon}</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{info.titel}</div>
                  <div style={{ fontSize: 14, color: "#6b7280" }}>{info.beschrijving}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showModal === "extraWork" && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>🔧 Meerwerk aanvragen</h2>
              <button 
                onClick={closeModal}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}
              >
                ×
              </button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Omschrijving *</label>
              <textarea
                style={styles.textarea}
                value={newExtraWork.omschrijving}
                onChange={(e) => setNewExtraWork({...newExtraWork, omschrijving: e.target.value})}
                placeholder="Beschrijf wat u wilt aanpassen of toevoegen..."
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Ruimte</label>
              <select
                style={styles.select}
                value={newExtraWork.ruimte}
                onChange={(e) => setNewExtraWork({...newExtraWork, ruimte: e.target.value})}
              >
                <option value="">Selecteer ruimte</option>
                <option value="woonkamer">Woonkamer</option>
                <option value="keuken">Keuken</option>
                <option value="badkamer">Badkamer</option>
                <option value="slaapkamer">Slaapkamer</option>
                <option value="balkon">Balkon</option>
                <option value="ander">Anders</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Urgentie</label>
              <select
                style={styles.select}
                value={newExtraWork.urgentie}
                onChange={(e) => setNewExtraWork({...newExtraWork, urgentie: e.target.value})}
              >
                <option value="normaal">Normaal (binnen 5 werkdagen)</option>
                <option value="spoed">Spoed (binnen 2 werkdagen)</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Budget indicatie (optioneel)</label>
              <input
                style={styles.input}
                type="number"
                value={newExtraWork.budget}
                onChange={(e) => setNewExtraWork({...newExtraWork, budget: e.target.value})}
                placeholder="€"
              />
            </div>
            
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button 
                style={{ ...styles.button, flex: 1 }}
                onClick={submitExtraWorkRequest}
              >
                Aanvraag indienen
              </button>
              <button 
                style={{ ...styles.buttonSecondary, flex: 1 }}
                onClick={closeModal}
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showModal === "supportTicket" && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>🎫 Support ticket aanmaken</h2>
              <button 
                onClick={closeModal}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}
              >
                ×
              </button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Onderwerp *</label>
              <input
                style={styles.input}
                value={newSupportTicket.onderwerp}
                onChange={(e) => setNewSupportTicket({...newSupportTicket, onderwerp: e.target.value})}
                placeholder="Wat is uw vraag of probleem?"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Categorie</label>
              <select
                style={styles.select}
                value={newSupportTicket.categorie}
                onChange={(e) => setNewSupportTicket({...newSupportTicket, categorie: e.target.value})}
              >
                <option value="algemeen">Algemeen</option>
                <option value="technisch">Technisch</option>
                <option value="financieel">Financieel</option>
                <option value="bouwproces">Bouwproces</option>
                <option value="meerwerk">Meerwerk</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Beschrijving *</label>
              <textarea
                style={styles.textarea}
                value={newSupportTicket.beschrijving}
                onChange={(e) => setNewSupportTicket({...newSupportTicket, beschrijving: e.target.value})}
                placeholder="Beschrijf uw vraag of probleem in detail..."
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Urgentie</label>
              <select
                style={styles.select}
                value={newSupportTicket.urgentie}
                onChange={(e) => setNewSupportTicket({...newSupportTicket, urgentie: e.target.value})}
              >
                <option value="laag">Laag (binnen 3 werkdagen)</option>
                <option value="normaal">Normaal (binnen 24 uur)</option>
                <option value="hoog">Hoog (binnen 4 uur)</option>
              </select>
            </div>
            
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button 
                style={{ ...styles.button, flex: 1 }}
                onClick={submitSupportTicket}
              >
                Ticket aanmaken
              </button>
              <button 
                style={{ ...styles.buttonSecondary, flex: 1 }}
                onClick={closeModal}
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showModal === "contact" && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>✉️ Bericht sturen aan projectmanager</h2>
              <button 
                onClick={closeModal}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}
              >
                ×
              </button>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Onderwerp</label>
              <input
                style={styles.input}
                defaultValue="Vraag over mijn koopwoning"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Bericht *</label>
              <textarea
                style={styles.textarea}
                placeholder="Typ uw bericht aan de projectmanager..."
                rows={8}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Bijlage (optioneel)</label>
              <input
                style={styles.input}
                type="file"
              />
            </div>
            
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button 
                style={{ ...styles.button, flex: 1 }}
                onClick={() => {
                  alert("Bericht verzonden!");
                  closeModal();
                }}
              >
                Bericht verzenden
              </button>
              <button 
                style={{ ...styles.buttonSecondary, flex: 1 }}
                onClick={closeModal}
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showModal === "phaseDetails" && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>🏗️ Bouwfase details</h2>
              <button 
                onClick={closeModal}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Fundering fase</h3>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
                Deze fase is succesvol afgerond op 15 januari 2024.
              </div>
              
              <div style={{ 
                padding: 16, 
                background: "#f9fafb", 
                borderRadius: 8,
                marginBottom: 16
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Uitgevoerde werkzaamheden:</div>
                <ul style={{ paddingLeft: 20, fontSize: 14, color: "#374151" }}>
                  <li>Grondonderzoek uitgevoerd</li>
                  <li>Paalfundering geplaatst (120 stuks)</li>
                  <li>Funderingplaat gestort (C25/30 beton)</li>
                  <li>Kruipruimte gecreëerd</li>
                </ul>
              </div>
              
              <div style={{ 
                padding: 16, 
                background: "#f0fdf4", 
                borderRadius: 8,
                marginBottom: 16
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Kwaliteitscontroles:</div>
                <div style={{ fontSize: 14, color: "#374151" }}>
                  ✅ Alle certificaten aanwezig<br/>
                  ✅ Drukproeven uitgevoerd<br/>
                  ✅ Keuring door gemeente goedgekeurd
                </div>
              </div>
              
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Foto's:</div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                  {[1, 2, 3].map((num) => (
                    <div 
                      key={num}
                      style={{ 
                        minWidth: 120, 
                        height: 80, 
                        background: "#e5e7eb", 
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6b7280",
                        cursor: "pointer"
                      }}
                      onClick={() => alert(`Foto ${num} vergroten`)}
                    >
                      📷 Foto {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                style={{ ...styles.buttonSecondary, flex: 1 }}
                onClick={closeModal}
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
