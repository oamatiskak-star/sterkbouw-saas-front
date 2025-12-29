// pages/bouwplaatsApp/index.js
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function BouwplaatsAppPage() {
  const [language, setLanguage] = useState('nl');
  const [uploadedPhotos, setUploadedPhotos] = useState([
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1503387769-00a112127ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  ]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('Op basis van je vorige vraag over waterdichte afwerking, raad ik aan om eerst de ondergrond grondig te reinigen en vervolgens de voorgeschreven primer aan te brengen. Laat dit 2 uur drogen voor de volgende stap.');
  const [inspectionMode, setInspectionMode] = useState('veiligheid');
  const [workHours, setWorkHours] = useState({
    today: 6.5,
    week: 32,
    month: 120
  });
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Cement 25kg', planned: 100, used: 65, remaining: 35, unit: 'zakken' },
    { id: 2, name: 'Bakstenen', planned: 5000, used: 3200, remaining: 1800, unit: 'stuks' },
    { id: 3, name: 'Isolatieplaten', planned: 200, used: 120, remaining: 80, unit: 'm²' },
    { id: 4, name: 'Betonstaal', planned: 800, used: 450, remaining: 350, unit: 'kg' }
  ]);

  // Meertalige vertalingen voor ALLE talen
  const translations = {
    nl: {
      // Header & Navigation
      welcome: "Welkom",
      constructionSite: "Bouwplaats",
      backToDashboard: "Terug naar Dashboard",
      installApp: "App Installeren",
      language: "Taal",
      logout: "Uitloggen",
      
      dailyPlanning: "Dagelijkse Planning",
      aiAssistant: "AI Assistent",
      aiInspection: "AI Inspectie",
      photoUpload: "Foto Upload",
      completionLists: "Opleverlijsten",
      bimModule: "BIM Module",
      deliveries: "Leveringen",
      safety: "Veiligheid",
      constructionProcess: "Bouwproces",
      teamOverview: "Team Overzicht",
      issuesProblems: "Issues & Problemen",
      workRegistration: "Werkregistratie",
      materialUsage: "Materiaalgebruik",
      timeRegistration: "Tijdregistratie",
      qualityControl: "Kwaliteitscontrole",
      safetyChecklist: "Veiligheidschecklist",
      reports: "Rapporten",
      settings: "Instellingen",
      
      // Dashboard sections
      dailyPlanningTitle: "Dagelijkse Planning",
      aiGenerated: "AI-gegenereerd",
      aiInspectorTitle: "AI Bouwinspecteur",
      liveMonitoring: "Live monitoring",
      teamOverviewTitle: "Team Overzicht & Locatie",
      realTimeTracking: "Real-time tracking",
      aiInstructionsTitle: "AI Werkinstructies",
      constructionIssuesTitle: "Bouwproblemen & Issues",
      aiDetected: "AI Gedetecteerd",
      photoUploadTitle: "Foto Upload & AI Analyse",
      monitorsSafety: "Monitort veiligheid",
      bimModuleTitle: "BIM Module & Tekeningen",
      automatic: "Automatisch",
      completionListTitle: "Opleverlijst Bouwnummer",
      aiUpdated: "AI Bijgewerkt",
      
      // Status
      busy: "Bezig",
      pending: "Volgende",
      laterToday: "Later vandaag",
      completed: "Voltooid",
      inspecting: "Inspecteren",
      approved: "Goedgekeurd",
      active: "Actief",
      online: "Online",
      break: "Pauze",
      open: "Open",
      inProgress: "In behandeling",
      resolved: "Opgelost",
      critical: "Kritiek",
      high: "Hoog",
      medium: "Middel",
      low: "Laag",
      
      // Buttons
      askAI: "Vraag AI",
      startSafetyInspection: "Veiligheidsinspectie",
      startQualityInspection: "Kwaliteitsinspectie",
      startProgressInspection: "Voortgangsinspectie",
      approve: "Goedkeuren",
      sendToTeam: "Stuur naar team",
      resolve: "Oplossen",
      generateBIMDrawing: "Genereer BIM Tekening",
      verifyDelivery: "Levering Verifiëren",
      downloadPDF: "Download PDF",
      arView: "AR View",
      registerWork: "Werk Registreren",
      addMaterial: "Materiaal Toevoegen",
      takePhoto: "Foto Maken",
      scanQR: "QR Code Scannen",
      viewDetails: "Details Bekijken",
      markComplete: "Afvinken",
      reportIssue: "Issue Rapporteren",
      callSupervisor: "Bel Uitvoerder",
      emergency: "Noodgeval",
      
      // AI Responses
      aiResponsePrefix: "AI antwoord:",
      safetyCheckPassed: "Veiligheidscheck geslaagd",
      problemReported: "Probleem gemeld",
      aiSuggestion: "AI Suggestie",
      aiAnalysis: "AI Analyse",
      aiPrognosis: "AI Prognose",
      aiWarning: "AI Waarschuwing",
      aiRecommendation: "AI Aanbeveling",
      
      // Placeholders
      aiQuestionPlaceholder: "Bijv: Hoe plaats ik een deursponning volgens de nieuwste normen?",
      uploadPlaceholder: "Sleep je foto hierheen of klik om te uploaden",
      searchPlaceholder: "Zoeken...",
      notePlaceholder: "Voeg notitie toe...",
      
      // Quick questions
      concreteQuality: "Beton kwaliteit",
      scaffoldSafety: "Steiger veiligheid",
      materialList: "Materiaallijst",
      electricalStandards: "Electra normen",
      plumbingRules: "Sanitair voorschriften",
      safetyProtocols: "Veiligheidsprotocollen",
      
      // Construction tasks
      foundationWork: "Fundering afwerken",
      concretePouring: "Beton storten",
      cavityWallCheck: "Spouwmuur controleren",
      windowFramesInstallation: "Kozijnen plaatsen",
      electricalInstallation: "Electra installatie",
      plumbingInstallation: "Sanitair plaatsen",
      interiorFrames: "Binnenkozijnen afwerken",
      floorFinishing: "Vloer afwerking",
      paintingWork: "Schilderwerk",
      roofing: "Dakbedekking",
      insulation: "Isolatie plaatsen",
      plastering: "Stucwerk",
      tiling: "Tegelen",
      
      // Locations
      constructionOffice: "Bouwkeet",
      constructionSite: "Bouwplaats",
      southSide: "Zuidzijde",
      northSide: "Noordzijde",
      eastSide: "Oostzijde",
      westSide: "Westzijde",
      kitchen: "Keuken",
      bathroom: "Badkamer",
      livingRoom: "Woonkamer",
      bedroom: "Slaapkamer",
      basement: "Kelder",
      attic: "Zolder",
      exterior: "Gevel",
      
      // Roles
      siteManager: "Uitvoerder",
      bricklayer: "Metselaar",
      carpenter: "Timerman",
      electrician: "Elektricien",
      plumber: "Loodgieter",
      painter: "Schilder",
      roofer: "Dekker",
      floorer: "Vloerenlegger",
      installer: "Installateur",
      assistant: "Assistent",
      supervisor: "Voorman",
      
      // Time & Dates
      today: "Vandaag",
      tomorrow: "Morgen",
      thisWeek: "Deze week",
      thisMonth: "Deze maand",
      monday: "Maandag",
      tuesday: "Dinsdag",
      wednesday: "Woensdag",
      thursday: "Donderdag",
      friday: "Vrijdag",
      saturday: "Zaterdag",
      sunday: "Zondag",
      morning: "Ochtend",
      afternoon: "Middag",
      evening: "Avond",
      hours: "uren",
      minutes: "minuten",
      
      // Work Registration
      workRegistration: "Werkregistratie",
      selectTask: "Selecteer taak",
      hoursWorked: "Uren gewerkt",
      startTime: "Starttijd",
      endTime: "Eindtijd",
      breakTime: "Pauzetijd",
      totalHours: "Totaal uren",
      notes: "Notities",
      notesPlaceholder: "Voeg notities toe...",
      materialsUsed: "Materialen gebruikt",
      toolsUsed: "Gereedschap gebruikt",
      registerWork: "Werk registreren",
      submit: "Verzenden",
      saveDraft: "Concept opslaan",
      print: "Printen",
      export: "Exporteren",
      
      // Material Management
      materialUsage: "Materiaalgebruik",
      material: "Materiaal",
      planned: "Gepland",
      used: "Gebruikt",
      remaining: "Resterend",
      unit: "Eenheid",
      quantity: "Hoeveelheid",
      deliveryDate: "Leverdatum",
      supplier: "Leverancier",
      batchNumber: "Batchnummer",
      qualityCheck: "Kwaliteitscontrole",
      registerMaterialUsage: "Materiaalgebruik registreren",
      orderMaterials: "Materialen bestellen",
      checkStock: "Voorraad controleren",
      scanBarcode: "Barcode scannen",
      
      // Safety
      safetyChecklist: "Veiligheidschecklist",
      ppeRequired: "PBW vereist",
      helmet: "Veiligheidshelm",
      safetyGlasses: "Veiligheidsbril",
      gloves: "Handschoenen",
      safetyShoes: "Veiligheidsschoenen",
      harness: "Valbeveiliging",
      mask: "Mondkapje",
      earProtection: "Gehoorbescherming",
      safetyInstructions: "Veiligheidsinstructies",
      emergencyExit: "Nooduitgang",
      firstAid: "EHBO",
      fireExtinguisher: "Brandblusser",
      riskAssessment: "Risico-inventarisatie",
      incidentReport: "Incident melding",
      
      // Quality Control
      qualityControl: "Kwaliteitscontrole",
      checkMeasurement: "Meting controleren",
      tolerance: "Tolerantie",
      specification: "Specificatie",
      standard: "Norm",
      deviation: "Afwijking",
      approved: "Goedgekeurd",
      rejected: "Afgekeurd",
      rework: "Herstelwerk",
      photoEvidence: "Foto bewijs",
      signature: "Handtekening",
      inspector: "Inspecteur",
      date: "Datum",
      
      // Issues & Problems
      issueReport: "Issue rapport",
      problemDescription: "Probleem omschrijving",
      location: "Locatie",
      severity: "Ernst",
      priority: "Prioriteit",
      assignedTo: "Toegewezen aan",
      deadline: "Deadline",
      solution: "Oplossing",
      statusUpdate: "Status update",
      closeIssue: "Issue sluiten",
      escalate: "Escaleer",
      
      // Deliveries
      deliveries: "Leveringen",
      expectedDelivery: "Verwachte levering",
      deliveryReceived: "Levering ontvangen",
      deliveryNote: "Leverbon",
      checkDelivery: "Levering controleren",
      missingItems: "Ontbrekende artikelen",
      damagedGoods: "Beschadigde goederen",
      storageLocation: "Opslaglocatie",
      signOff: "Aftekenen",
      driver: "Chauffeur",
      licensePlate: "Kenteken",
      timeArrived: "Aankomsttijd",
      timeDeparted: "Vertrektijd",
      
      // BIM & Drawings
      bimModule: "BIM Module",
      viewDrawing: "Tekening bekijken",
      latestVersion: "Laatste versie",
      revision: "Revisie",
      scale: "Schaal",
      dimensions: "Afmetingen",
      annotations: "Aantekeningen",
      sections: "Doorsnedes",
      details: "Details",
      downloadDrawing: "Tekening downloaden",
      printDrawing: "Tekening printen",
      shareDrawing: "Tekening delen",
      arView: "AR View",
      measure: "Meten",
      markUp: "Markeren",
      
      // Team Communication
      teamChat: "Team Chat",
      sendMessage: "Bericht sturen",
      attachments: "Bijlagen",
      voiceMessage: "Spraakbericht",
      videoCall: "Videogesprek",
      groupChat: "Groepschat",
      notifications: "Meldingen",
      urgent: "Dringend",
      readReceipt: "Gelezen bevestiging",
      mute: "Dempen",
      archive: "Archiveren",
      
      // Reports & Analytics
      dailyReport: "Dagelijkse rapportage",
      weeklyReport: "Wekelijkse rapportage",
      progressReport: "Voortgangsrapportage",
      productivity: "Productiviteit",
      efficiency: "Efficiëntie",
      costs: "Kosten",
      timeline: "Tijdlijn",
      milestones: "Mijlpalen",
      kpi: "KPI's",
      exportData: "Data exporteren",
      generateReport: "Rapport genereren",
      shareReport: "Rapport delen",
      
      // Settings & Profile
      profile: "Profiel",
      notifications: "Notificaties",
      privacy: "Privacy",
      security: "Beveiliging",
      language: "Taal",
      theme: "Thema",
      darkMode: "Donkere modus",
      fontSize: "Lettergrootte",
      vibration: "Trilling",
      sound: "Geluid",
      autoSave: "Automatisch opslaan",
      backup: "Backup",
      help: "Help",
      feedback: "Feedback",
      about: "Over",
      version: "Versie"
    },
    en: {
      welcome: "Welcome",
      constructionSite: "Construction Site",
      backToDashboard: "Back to Dashboard",
      dailyPlanning: "Daily Planning",
      aiAssistant: "AI Assistant",
      aiInspection: "AI Inspection",
      photoUpload: "Photo Upload",
      completionLists: "Completion Lists",
      bimModule: "BIM Module",
      deliveries: "Deliveries",
      safety: "Safety",
      constructionProcess: "Construction Process",
      teamOverview: "Team Overview",
      issuesProblems: "Issues & Problems",
      workRegistration: "Work Registration",
      materialUsage: "Material Usage",
      busy: "Busy",
      pending: "Next",
      laterToday: "Later today",
      completed: "Completed",
      askAI: "Ask AI",
      startSafetyInspection: "Safety Inspection",
      startQualityInspection: "Quality Inspection",
      startProgressInspection: "Progress Inspection",
      approve: "Approve",
      sendToTeam: "Send to team",
      resolve: "Resolve",
      generateBIMDrawing: "Generate BIM Drawing",
      verifyDelivery: "Verify Delivery",
      downloadPDF: "Download PDF",
      arView: "AR View",
      aiResponsePrefix: "AI answer:",
      safetyCheckPassed: "Safety check passed",
      problemReported: "Problem reported",
      aiSuggestion: "AI Suggestion",
      aiAnalysis: "AI Analysis",
      aiPrognosis: "AI Prognosis",
      workRegistration: "Work Registration",
      selectTask: "Select task",
      hoursWorked: "Hours worked",
      status: "Status",
      inProgress: "In progress",
      onHold: "On hold",
      notes: "Notes",
      notesPlaceholder: "Add notes...",
      registerWork: "Register work",
      materialUsage: "Material Usage",
      material: "Material",
      planned: "Planned",
      used: "Used",
      remaining: "Remaining",
      registerMaterialUsage: "Register material usage",
      foundationWork: "Foundation work",
      concretePouring: "Concrete pouring",
      cavityWallCheck: "Cavity wall check"
    },
    de: {
      welcome: "Willkommen",
      constructionSite: "Baustelle",
      backToDashboard: "Zurück zum Dashboard",
      dailyPlanning: "Tagesplanung",
      aiAssistant: "KI-Assistent",
      aiInspection: "KI-Inspektion",
      photoUpload: "Foto-Upload",
      completionLists: "Fertigstellungslisten",
      bimModule: "BIM-Modul",
      deliveries: "Lieferungen",
      safety: "Sicherheit",
      constructionProcess: "Bauprozess",
      teamOverview: "Team-Übersicht",
      issuesProblems: "Probleme & Störungen",
      workRegistration: "Arbeitsregistrierung",
      materialUsage: "Materialverbrauch",
      busy: "Beschäftigt",
      pending: "Nächste",
      laterToday: "Später heute",
      completed: "Abgeschlossen",
      askAI: "KI fragen",
      startSafetyInspection: "Sicherheitsinspektion",
      startQualityInspection: "Qualitätsinspektion",
      startProgressInspection: "Fortschrittsinspektion",
      approve: "Genehmigen",
      sendToTeam: "An Team senden",
      resolve: "Lösen",
      generateBIMDrawing: "BIM-Zeichnung erstellen",
      verifyDelivery: "Lieferung prüfen",
      downloadPDF: "PDF herunterladen",
      arView: "AR-Ansicht",
      aiResponsePrefix: "KI-Antwort:",
      safetyCheckPassed: "Sicherheitscheck bestanden",
      problemReported: "Problem gemeldet",
      aiSuggestion: "KI-Vorschlag",
      aiAnalysis: "KI-Analyse",
      aiPrognosis: "KI-Prognose",
      workRegistration: "Arbeitsregistrierung",
      selectTask: "Aufgabe auswählen",
      hoursWorked: "Gearbeitete Stunden",
      status: "Status",
      inProgress: "In Bearbeitung",
      onHold: "Pausiert",
      notes: "Notizen",
      notesPlaceholder: "Notizen hinzufügen...",
      registerWork: "Arbeit registrieren",
      materialUsage: "Materialverbrauch",
      material: "Material",
      planned: "Geplant",
      used: "Verbraucht",
      remaining: "Verbleibend",
      registerMaterialUsage: "Materialverbrauch registrieren",
      foundationWork: "Fundamentarbeiten",
      concretePouring: "Beton gießen",
      cavityWallCheck: "Hohlwandkontrolle"
    },
    pl: {
      welcome: "Witamy",
      constructionSite: "Plac budowy",
      backToDashboard: "Powrót do panelu",
      dailyPlanning: "Plan dzienny",
      aiAssistant: "Asystent AI",
      aiInspection: "Inspekcja AI",
      photoUpload: "Przesyłanie zdjęć",
      completionLists: "Listy ukończenia",
      bimModule: "Moduł BIM",
      deliveries: "Dostawy",
      safety: "Bezpieczeństwo",
      constructionProcess: "Proces budowy",
      teamOverview: "Przegląd zespołu",
      issuesProblems: "Problemy i usterki",
      workRegistration: "Rejestracja pracy",
      materialUsage: "Zużycie materiału",
      busy: "W trakcie",
      pending: "Następne",
      laterToday: "Później dziś",
      completed: "Ukończone",
      askAI: "Zapytaj AI",
      startSafetyInspection: "Inspekcja bezpieczeństwa",
      startQualityInspection: "Inspekcja jakości",
      startProgressInspection: "Inspekcja postępu",
      approve: "Zatwierdź",
      sendToTeam: "Wyślij do zespołu",
      resolve: "Rozwiąż",
      generateBIMDrawing: "Generuj rysunek BIM",
      verifyDelivery: "Zweryfikuj dostawę",
      downloadPDF: "Pobierz PDF",
      arView: "Widok AR",
      aiResponsePrefix: "Odpowiedź AI:",
      safetyCheckPassed: "Kontrola bezpieczeństwa zaliczona",
      problemReported: "Problem zgłoszony",
      aiSuggestion: "Sugestia AI",
      aiAnalysis: "Analiza AI",
      aiPrognosis: "Prognoza AI",
      workRegistration: "Rejestracja pracy",
      selectTask: "Wybierz zadanie",
      hoursWorked: "Przepracowane godziny",
      status: "Status",
      inProgress: "W trakcie",
      onHold: "Wstrzymane",
      notes: "Notatki",
      notesPlaceholder: "Dodaj notatki...",
      registerWork: "Zarejestruj pracę",
      materialUsage: "Zużycie materiału",
      material: "Materiał",
      planned: "Planowane",
      used: "Zużyte",
      remaining: "Pozostało",
      registerMaterialUsage: "Zarejestruj zużycie materiału",
      foundationWork: "Prace fundamentowe",
      concretePouring: "Wylewanie betonu",
      cavityWallCheck: "Kontrola ściany szczelinowej"
    },
    es: {
      welcome: "Bienvenido",
      constructionSite: "Sitio de construcción",
      backToDashboard: "Volver al panel",
      dailyPlanning: "Planificación diaria",
      aiAssistant: "Asistente AI",
      aiInspection: "Inspección AI",
      photoUpload: "Subir foto",
      completionLists: "Listas de finalización",
      bimModule: "Módulo BIM",
      deliveries: "Entregas",
      safety: "Seguridad",
      constructionProcess: "Proceso de construcción",
      teamOverview: "Resumen del equipo",
      issuesProblems: "Problemas e incidencias",
      workRegistration: "Registro de trabajo",
      materialUsage: "Uso de material",
      busy: "En curso",
      pending: "Siguiente",
      laterToday: "Más tarde hoy",
      completed: "Completado",
      askAI: "Preguntar a AI",
      startSafetyInspection: "Inspección de seguridad",
      startQualityInspection: "Inspección de calidad",
      startProgressInspection: "Inspección de progreso",
      approve: "Aprobar",
      sendToTeam: "Enviar al equipo",
      resolve: "Resolver",
      generateBIMDrawing: "Generar dibujo BIM",
      verifyDelivery: "Verificar entrega",
      downloadPDF: "Descargar PDF",
      arView: "Vista AR",
      aiResponsePrefix: "Respuesta AI:",
      safetyCheckPassed: "Control de seguridad aprobado",
      problemReported: "Problema reportado",
      aiSuggestion: "Sugerencia AI",
      aiAnalysis: "Análisis AI",
      aiPrognosis: "Pronóstico AI",
      workRegistration: "Registro de trabajo",
      selectTask: "Seleccionar tarea",
      hoursWorked: "Horas trabajadas",
      status: "Estado",
      inProgress: "En progreso",
      onHold: "En espera",
      notes: "Notas",
      notesPlaceholder: "Agregar notas...",
      registerWork: "Registrar trabajo",
      materialUsage: "Uso de material",
      material: "Material",
      planned: "Planificado",
      used: "Usado",
      remaining: "Restante",
      registerMaterialUsage: "Registrar uso de material",
      foundationWork: "Trabajos de cimentación",
      concretePouring: "Vertido de hormigón",
      cavityWallCheck: "Control de muro de cavidad"
    },
    pt: {
      welcome: "Bem-vindo",
      constructionSite: "Canteiro de obras",
      backToDashboard: "Voltar ao painel",
      dailyPlanning: "Planejamento diário",
      aiAssistant: "Assistente AI",
      aiInspection: "Inspeção AI",
      photoUpload: "Carregar foto",
      completionLists: "Listas de conclusão",
      bimModule: "Módulo BIM",
      deliveries: "Entregas",
      safety: "Segurança",
      constructionProcess: "Processo de construção",
      teamOverview: "Visão geral da equipe",
      issuesProblems: "Problemas e questões",
      workRegistration: "Registro de trabalho",
      materialUsage: "Uso de material",
      busy: "Em andamento",
      pending: "Próximo",
      laterToday: "Mais tarde hoje",
      completed: "Concluído",
      askAI: "Perguntar AI",
      startSafetyInspection: "Inspeção de segurança",
      startQualityInspection: "Inspeção de qualidade",
      startProgressInspection: "Inspeção de progresso",
      approve: "Aprovar",
      sendToTeam: "Enviar para equipe",
      resolve: "Resolver",
      generateBIMDrawing: "Gerar desenho BIM",
      verifyDelivery: "Verificar entrega",
      downloadPDF: "Baixar PDF",
      arView: "Visualização AR",
      aiResponsePrefix: "Resposta AI:",
      safetyCheckPassed: "Verificação de segurança aprovada",
      problemReported: "Problema relatado",
      aiSuggestion: "Sugestão AI",
      aiAnalysis: "Análise AI",
      aiPrognosis: "Prognóstico AI",
      workRegistration: "Registro de trabalho",
      selectTask: "Selecionar tarefa",
      hoursWorked: "Horas trabalhadas",
      status: "Status",
      inProgress: "Em progresso",
      onHold: "Em espera",
      notes: "Notas",
      notesPlaceholder: "Adicionar notas...",
      registerWork: "Registrar trabalho",
      materialUsage: "Uso de material",
      material: "Material",
      planned: "Planejado",
      used: "Usado",
      remaining: "Restante",
      registerMaterialUsage: "Registrar uso de material",
      foundationWork: "Trabalhos de fundação",
      concretePouring: "Despejo de concreto",
      cavityWallCheck: "Verificação de parede de cavidade"
    },
    ro: {
      welcome: "Bine ați venit",
      constructionSite: "Șantier",
      backToDashboard: "Înapoi la Panou",
      dailyPlanning: "Planificare zilnică",
      aiAssistant: "Asistent AI",
      aiInspection: "Inspecție AI",
      photoUpload: "Încărcare foto",
      completionLists: "Liste de finalizare",
      bimModule: "Modul BIM",
      deliveries: "Livrări",
      safety: "Siguranță",
      constructionProcess: "Proces de construcție",
      teamOverview: "Prezentare generală a echipei",
      issuesProblems: "Probleme și incidente",
      workRegistration: "Înregistrare muncă",
      materialUsage: "Utilizare materiale",
      busy: "În curs",
      pending: "Următor",
      laterToday: "Mai târziu azi",
      completed: "Finalizat",
      askAI: "Întreabă AI",
      startSafetyInspection: "Inspecție siguranță",
      startQualityInspection: "Inspecție calitate",
      startProgressInspection: "Inspecție progres",
      approve: "Aprobă",
      sendToTeam: "Trimite către echipă",
      resolve: "Rezolvă",
      generateBIMDrawing: "Generează desen BIM",
      verifyDelivery: "Verifică livrare",
      downloadPDF: "Descarcă PDF",
      arView: "Vizualizare AR",
      aiResponsePrefix: "Răspuns AI:",
      safetyCheckPassed: "Verificare siguranță trecută",
      problemReported: "Problemă raportată",
      aiSuggestion: "Sugestie AI",
      aiAnalysis: "Analiză AI",
      aiPrognosis: "Prognoză AI",
      workRegistration: "Înregistrare muncă",
      selectTask: "Selectează sarcină",
      hoursWorked: "Ore lucrate",
      status: "Stare",
      inProgress: "În progres",
      onHold: "În așteptare",
      notes: "Notițe",
      notesPlaceholder: "Adaugă notițe...",
      registerWork: "Înregistrează munca",
      materialUsage: "Utilizare materiale",
      material: "Material",
      planned: "Planificat",
      used: "Folosit",
      remaining: "Rămas",
      registerMaterialUsage: "Înregistrează utilizare materiale",
      foundationWork: "Lucrări fundație",
      concretePouring: "Turnare beton",
      cavityWallCheck: "Verificare perete cavitate"
    },
    sk: {
      welcome: "Vitajte",
      constructionSite: "Stavenisko",
      backToDashboard: "Späť na panel",
      dailyPlanning: "Denné plánovanie",
      aiAssistant: "AI asistent",
      aiInspection: "AI inšpekcia",
      photoUpload: "Nahratie fotky",
      completionLists: "Zoznamy dokončenia",
      bimModule: "BIM modul",
      deliveries: "Dodávky",
      safety: "Bezpečnosť",
      constructionProcess: "Stavebný proces",
      teamOverview: "Prehľad tímu",
      issuesProblems: "Problémy a závady",
      workRegistration: "Registrácia práce",
      materialUsage: "Spotreba materiálu",
      busy: "Prebieha",
      pending: "Ďalšie",
      laterToday: "Neskôr dnes",
      completed: "Dokončené",
      askAI: "Opýtajte sa AI",
      startSafetyInspection: "Bezpečnostná inšpekcia",
      startQualityInspection: "Kvalitná inšpekcia",
      startProgressInspection: "Inšpekcia pokroku",
      approve: "Schváliť",
      sendToTeam: "Odoslať tímu",
      resolve: "Vyriešiť",
      generateBIMDrawing: "Generovať BIM výkres",
      verifyDelivery: "Overiť dodávku",
      downloadPDF: "Stiahnuť PDF",
      arView: "AR zobrazenie",
      aiResponsePrefix: "Odpoveď AI:",
      safetyCheckPassed: "Bezpečnostná kontrola prejdená",
      problemReported: "Problém nahlásený",
      aiSuggestion: "AI návrh",
      aiAnalysis: "AI analýza",
      aiPrognosis: "AI prognóza",
      workRegistration: "Registrácia práce",
      selectTask: "Vyberte úlohu",
      hoursWorked: "Odpracované hodiny",
      status: "Stav",
      inProgress: "Prebieha",
      onHold: "Pozastavené",
      notes: "Poznámky",
      notesPlaceholder: "Pridať poznámky...",
      registerWork: "Registrovať prácu",
      materialUsage: "Spotreba materiálu",
      material: "Materiál",
      planned: "Plánované",
      used: "Použité",
      remaining: "Zostávajúce",
      registerMaterialUsage: "Registrovať spotrebu materiálu",
      foundationWork: "Základové práce",
      concretePouring: "Liatie betónu",
      cavityWallCheck: "Kontrola dutinovej steny"
    },
    sr: {
      welcome: "Добро дошли",
      constructionSite: "Градилиште",
      backToDashboard: "Назад на контролну таблу",
      dailyPlanning: "Дневно планирање",
      aiAssistant: "AI асистент",
      aiInspection: "AI инспекција",
      photoUpload: "Отпремање фотографије",
      completionLists: "Листе завршетка",
      bimModule: "BIM модул",
      deliveries: "Испоруке",
      safety: "Безбедност",
      constructionProcess: "Процес градње",
      teamOverview: "Преглед тима",
      issuesProblems: "Проблеми и неисправности",
      workRegistration: "Регистрација рада",
      materialUsage: "Потрошња материјала",
      busy: "У току",
      pending: "Следеће",
      laterToday: "Касније данас",
      completed: "Завршено",
      askAI: "Питајте AI",
      startSafetyInspection: "Безбедносна инспекција",
      startQualityInspection: "Инспекција квалитета",
      startProgressInspection: "Инспекција напретка",
      approve: "Одобри",
      sendToTeam: "Пошаљи тиму",
      resolve: "Реши",
      generateBIMDrawing: "Генериши BIM цртеж",
      verifyDelivery: "Провери испоруку",
      downloadPDF: "Преузми PDF",
      arView: "AR приказ",
      aiResponsePrefix: "AI одговор:",
      safetyCheckPassed: "Безбедносна проверка прошла",
      problemReported: "Проблем пријављен",
      aiSuggestion: "AI сугестија",
      aiAnalysis: "AI анализа",
      aiPrognosis: "AI прогноза",
      workRegistration: "Регистрација рада",
      selectTask: "Изабери задатак",
      hoursWorked: "Одрађени сати",
      status: "Статус",
      inProgress: "У току",
      onHold: "На чекању",
      notes: "Белешке",
      notesPlaceholder: "Додај белешке...",
      registerWork: "Региструј рад",
      materialUsage: "Потрошња материјала",
      material: "Материјал",
      planned: "Планирано",
      used: "Искоришћено",
      remaining: "Преостало",
      registerMaterialUsage: "Региструј потрошњу материјала",
      foundationWork: "Радови на темељу",
      concretePouring: "Сипање бетона",
      cavityWallCheck: "Провера шупљег зида"
    },
    ar: {
      welcome: "مرحباً",
      constructionSite: "موقع البناء",
      backToDashboard: "العودة للوحة التحكم",
      dailyPlanning: "التخطيط اليومي",
      aiAssistant: "مساعد الذكاء الاصطناعي",
      aiInspection: "تفتيش الذكاء الاصطناعي",
      photoUpload: "رفع الصور",
      completionLists: "قوائم الإنجاز",
      bimModule: "وحدة BIM",
      deliveries: "التوصيلات",
      safety: "السلامة",
      constructionProcess: "عملية البناء",
      teamOverview: "نظرة عامة على الفريق",
      issuesProblems: "المشاكل والعيوب",
      workRegistration: "تسجيل العمل",
      materialUsage: "استخدام المواد",
      busy: "قيد التنفيذ",
      pending: "التالي",
      laterToday: "لاحقاً اليوم",
      completed: "مكتمل",
      askAI: "اسأل الذكاء الاصطناعي",
      startSafetyInspection: "تفتيش السلامة",
      startQualityInspection: "تفتيش الجودة",
      startProgressInspection: "تفتيش التقدم",
      approve: "الموافقة",
      sendToTeam: "إرسال للفريق",
      resolve: "حل",
      generateBIMDrawing: "إنشاء رسم BIM",
      verifyDelivery: "التحقق من التسليم",
      downloadPDF: "تحميل PDF",
      arView: "عرض AR",
      aiResponsePrefix: "رد الذكاء الاصطناعي:",
      safetyCheckPassed: "تم اجتياز فحص السلامة",
      problemReported: "تم الإبلاغ عن المشكلة",
      aiSuggestion: "اقتراح الذكاء الاصطناعي",
      aiAnalysis: "تحليل الذكاء الاصطناعي",
      aiPrognosis: "تنبؤ الذكاء الاصطناعي",
      workRegistration: "تسجيل العمل",
      selectTask: "اختر المهمة",
      hoursWorked: "الساعات العملية",
      status: "الحالة",
      inProgress: "قيد التنفيذ",
      onHold: "معلق",
      notes: "ملاحظات",
      notesPlaceholder: "أضف ملاحظات...",
      registerWork: "تسجيل العمل",
      materialUsage: "استخدام المواد",
      material: "المادة",
      planned: "المخطط",
      used: "المستخدم",
      remaining: "المتبقي",
      registerMaterialUsage: "تسجيل استخدام المواد",
      foundationWork: "أعمال الأساس",
      concretePouring: "صب الخرسانة",
      cavityWallCheck: "فحص الجدار المجوف"
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['nl'][key] || key;
  };

  const handleAiQuestion = () => {
    if (aiQuestion.trim()) {
      setAiResponse(`${t('aiResponsePrefix')} Bedankt voor je vraag over "${aiQuestion}". Ik analyseer dit nu en geef je gedetailleerde instructies.`);
      setAiQuestion('');
    }
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedPhotos(prev => [e.target.result, ...prev.slice(0, 2)]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleStartInspection = (type) => {
    setInspectionMode(type);
    alert(`AI start nu ${type} inspectie. Loop rond en maak foto's van belangrijke punten.`);
  };

  const handleWorkSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('Work submitted:', data);
    alert(`${t('workRegistration')} succesvol!`);
    e.target.reset();
  };

  const handleMaterialSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('Material submitted:', data);
    alert(`${t('materialUsage')} geregistreerd!`);
    e.target.reset();
  };

  const handleIssueReport = () => {
    const issue = prompt(`${t('problemDescription')}:`);
    if (issue) {
      alert(`${t('issueReport')} ingediend: ${issue}`);
    }
  };

  const handleEmergencyCall = () => {
    if (confirm(`${t('emergency')} - ${t('callSupervisor')}?`)) {
      window.location.href = 'tel:+31612345678';
    }
  };

  const handleScanQR = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      alert(`${t('scanQR')} - Camera wordt geopend...`);
      // Hier zou QR scanning logica komen
    } else {
      alert(`${t('scanQR')} - Camera niet beschikbaar op dit apparaat.`);
    }
  };

  const handleVoiceCommand = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAiQuestion(transcript);
        handleAiQuestion();
      };
      recognition.start();
    } else {
      alert('Spraakherkenning niet ondersteund in deze browser.');
    }
  };

  // PWA Installatie functionaliteit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let deferredPrompt;
      
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
          installBtn.style.display = 'block';
          installBtn.onclick = () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
              });
            }
          };
        }
      });

      // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'none';
      }
    }
  }, []);

  // Offline detection
  useEffect(() => {
    const updateOnlineStatus = () => {
      const statusElement = document.getElementById('connectionStatus');
      if (statusElement) {
        if (navigator.onLine) {
          statusElement.innerHTML = `<i class="fas fa-wifi"></i> ${t('online')}`;
          statusElement.className = 'connection-status online';
        } else {
          statusElement.innerHTML = `<i class="fas fa-wifi-slash"></i> ${t('offline') || 'Offline'}`;
          statusElement.className = 'connection-status offline';
        }
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [language]);

  // Geofencing voor locatie-based alerts
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Hier kun je locatie-based logica toevoegen
          console.log('User location:', latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Real-time updates simulatie
  useEffect(() => {
    const interval = setInterval(() => {
      // Simuleer real-time updates
      const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
      if (randomMaterial && randomMaterial.used < randomMaterial.planned) {
        setMaterials(prev => prev.map(m => 
          m.id === randomMaterial.id 
            ? { ...m, used: Math.min(m.used + 1, m.planned) }
            : m
        ));
      }
    }, 30000); // Update elke 30 seconden

    return () => clearInterval(interval);
  }, [materials]);

  return (
    <>
      <Head>
        <title>{t('constructionSite')} - AI Bouwinspecteur</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#1a5f7a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      {/* PWA Install Button */}
      <button id="installBtn" className="pwa-install-btn" style={{display: 'none'}}>
        <i className="fas fa-download"></i> {t('installApp')}
      </button>

      {/* Connection Status */}
      <div id="connectionStatus" className="connection-status online">
        <i className="fas fa-wifi"></i> {t('online')}
      </div>

      {/* Emergency Button */}
      <button className="emergency-btn" onClick={handleEmergencyCall}>
        <i className="fas fa-phone-alt"></i> {t('emergency')}
      </button>

      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-hard-hat"></i>
              <div>
                <h1>{t('constructionSite')}</h1>
                <div className="header-subtitle">
                  <Link href="/dashboard">
                    <a className="btn btn-sm btn-outline-light me-2">
                      <i className="fas fa-arrow-left me-1"></i>
                      {t('backToDashboard')}
                    </a>
                  </Link>
                  <select 
                    className="form-select form-select-sm language-selector" 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="nl">🇳🇱 Nederlands</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="pl">🇵🇱 Polski</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="pt">🇵🇹 Português</option>
                    <option value="ro">🇷🇴 Română</option>
                    <option value="sk">🇸🇰 Slovenčina</option>
                    <option value="sr">🇷🇸 Srpski</option>
                    <option value="ar">🇸🇦 العربية</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="user-info">
              <div>
                <p>{t('welcome')}, <strong>Jan Visser</strong></p>
                <p>{t('constructionSite')}: <strong>De Veranda - Amsterdam</strong></p>
                <div className="user-stats">
                  <span><i className="fas fa-clock"></i> {workHours.today} {t('hours')}</span>
                  <span><i className="fas fa-check-circle"></i> 8 {t('tasks')}</span>
                  <span><i className="fas fa-exclamation-triangle"></i> 3 {t('issuesProblems')}</span>
                </div>
              </div>
              <div className="user-avatar" onClick={() => alert('Profiel')}>
                JV
                <div className="user-status online"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="dashboard">
          <aside className="sidebar">
            <div className="sidebar-header">
              <h3><i className="fas fa-bars"></i> {t('navigation') || 'Navigatie'}</h3>
              <button className="sidebar-toggle" onClick={() => document.querySelector('.sidebar').classList.toggle('collapsed')}>
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
            
            <ul className="nav-menu">
              <li><a href="#" className="active"><i className="fas fa-calendar-day"></i> {t('dailyPlanning')}</a></li>
              <li><a href="#ai-assistant"><i className="fas fa-robot"></i> {t('aiAssistant')}</a></li>
              <li><a href="#ai-inspection"><i className="fas fa-search"></i> {t('aiInspection')}</a></li>
              <li><a href="#photo-upload"><i className="fas fa-camera"></i> {t('photoUpload')}</a></li>
              <li><a href="#work-registration"><i className="fas fa-clock"></i> {t('workRegistration')}</a></li>
              <li><a href="#material-usage"><i className="fas fa-boxes"></i> {t('materialUsage')}</a></li>
              <li><a href="#completion-lists"><i className="fas fa-clipboard-check"></i> {t('completionLists')}</a></li>
              <li><a href="#bim-module"><i className="fas fa-drafting-compass"></i> {t('bimModule')}</a></li>
              <li><a href="#deliveries"><i className="fas fa-truck-loading"></i> {t('deliveries')}</a></li>
              <li><a href="#safety"><i className="fas fa-shield-alt"></i> {t('safety')}</a></li>
              <li><a href="#team-overview"><i className="fas fa-users"></i> {t('teamOverview')}</a></li>
              <li><a href="#issues"><i className="fas fa-exclamation-triangle"></i> {t('issuesProblems')}</a></li>
              <li><a href="#quality"><i className="fas fa-award"></i> {t('qualityControl')}</a></li>
              <li><a href="#reports"><i className="fas fa-chart-line"></i> {t('reports') || 'Rapporten'}</a></li>
              <li><a href="#settings"><i className="fas fa-cog"></i> {t('settings')}</a></li>
            </ul>

            <div className="sidebar-footer">
              <div className="quick-actions">
                <button className="btn btn-sm btn-success" onClick={handleScanQR}>
                  <i className="fas fa-qrcode"></i> {t('scanQR')}
                </button>
                <button className="btn btn-sm btn-warning" onClick={handleVoiceCommand}>
                  <i className="fas fa-microphone"></i> {t('voice') || 'Spraak'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={handleIssueReport}>
                  <i className="fas fa-exclamation"></i> {t('reportIssue')}
                </button>
              </div>
              
              <div className="work-statistics">
                <h4><i className="fas fa-chart-bar"></i> {t('today')} {t('statistics') || 'Statistieken'}</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{workHours.today}</div>
                    <div className="stat-label">{t('hours')}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">8/12</div>
                    <div className="stat-label">{t('tasks')}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">3</div>
                    <div className="stat-label">{t('issuesProblems')}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="main-content">
            {/* Daily Planning Section */}
            <section id="daily-planning" className="card">
              <div className="card-header">
                <h2><i className="fas fa-calendar-day"></i> {t('dailyPlanningTitle')}</h2>
                <div className="card-actions">
                  <span className="ai-badge"><i className="fas fa-robot"></i> {t('aiGenerated')}</span>
                  <button className="btn btn-sm btn-outline">
                    <i className="fas fa-print"></i> {t('print')}
                  </button>
                </div>
              </div>
              
              <div className="planning-container">
                <div className="planning-date">
                  <h3>{t('today')} - {new Date().toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                  <div className="weather-info">
                    <i className="fas fa-sun"></i> 12°C • {t('sunny') || 'Zonnig'}
                  </div>
                </div>
                
                <ul className="planning-list">
                  <li className="planning-item current">
                    <div className="planning-time">08:00 - 10:30</div>
                    <div className="planning-content">
                      <div className="planning-task">{t('foundationWork')} bouwnummer 046</div>
                      <div className="planning-details">
                        <span className="badge bg-primary">BN-046</span>
                        <span className="badge bg-warning">2 {t('workers') || 'medewerkers'}</span>
                        <span><i className="fas fa-map-marker-alt"></i> {t('southSide')}</span>
                      </div>
                    </div>
                    <div className="planning-status">
                      <span className="status in-progress">{t('busy')}</span>
                      <button className="btn btn-sm btn-success">
                        <i className="fas fa-check"></i> {t('markComplete')}
                      </button>
                    </div>
                  </li>
                  
                  <li className="planning-item">
                    <div className="planning-time">10:30 - 12:00</div>
                    <div className="planning-content">
                      <div className="planning-task">{t('concretePouring')} {t('basement')} bouwnummer 047</div>
                      <div className="planning-details">
                        <span className="badge bg-primary">BN-047</span>
                        <span className="badge bg-info">4 {t('workers') || 'medewerkers'}</span>
                        <span><i className="fas fa-map-marker-alt"></i> {t('northSide')}</span>
                      </div>
                    </div>
                    <div className="planning-status">
                      <span className="status pending">{t('pending')}</span>
                      <button className="btn btn-sm btn-outline">
                        <i className="fas fa-clock"></i> {t('startTime')}
                      </button>
                    </div>
                  </li>
                  
                  <li className="planning-item">
                    <div className="planning-time">13:00 - 14:30</div>
                    <div className="planning-content">
                      <div className="planning-task">{t('cavityWallCheck')} bouwnummer 046</div>
                      <div className="planning-details">
                        <span className="badge bg-primary">BN-046</span>
                        <span className="badge bg-warning">1 {t('inspector') || 'inspecteur'}</span>
                        <span><i className="fas fa-map-marker-alt"></i> {t('eastSide')}</span>
                      </div>
                    </div>
                    <div className="planning-status">
                      <span className="status pending">{t('laterToday')}</span>
                      <button className="btn btn-sm btn-outline">
                        <i className="fas fa-info-circle"></i> {t('viewDetails')}
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* AI Assistant & Inspection Section */}
            <div className="row mb-4">
              <div className="col-md-6">
                <section id="ai-assistant" className="card ai-assistant">
                  <div className="card-header">
                    <h2><i className="fas fa-robot"></i> {t('aiAssistant')}</h2>
                    <div className="card-actions">
                      <span className="ai-badge"><i className="fas fa-bolt"></i> {t('live') || 'Live'}</span>
                      <button className="btn btn-sm btn-outline" onClick={handleVoiceCommand}>
                        <i className="fas fa-microphone"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <p>{t('askQuestion') || 'Stel je vraag aan de AI bouwinspecteur:'}</p>
                    
                    <div className="ai-input-area">
                      <input 
                        type="text" 
                        className="ai-input" 
                        placeholder={t('aiQuestionPlaceholder')}
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAiQuestion()}
                      />
                      <button className="btn btn-primary" onClick={handleAiQuestion}>
                        <i className="fas fa-paper-plane"></i> {t('askAI')}
                      </button>
                    </div>
                    
                    {aiResponse && (
                      <div className="ai-response">
                        <div className="ai-response-header">
                          <i className="fas fa-robot"></i>
                          <strong>{t('aiResponsePrefix')}</strong>
                        </div>
                        <p>{aiResponse}</p>
                        <div className="ai-response-actions">
                          <button className="btn btn-sm btn-outline">
                            <i className="fas fa-volume-up"></i> {t('readAloud') || 'Voorlezen'}
                          </button>
                          <button className="btn btn-sm btn-outline">
                            <i className="fas fa-share"></i> {t('share') || 'Delen'}
                          </button>
                          <button className="btn btn-sm btn-outline">
                            <i className="fas fa-save"></i> {t('save') || 'Opslaan'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="quick-questions">
                      <h4>{t('quickQuestions') || 'Snelle vragen:'}</h4>
                      <div className="quick-buttons">
                        <button className="btn btn-sm btn-outline" onClick={() => setAiQuestion(t('concreteQuality'))}>
                          {t('concreteQuality')}
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => setAiQuestion(t('scaffoldSafety'))}>
                          {t('scaffoldSafety')}
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => setAiQuestion(t('materialList'))}>
                          {t('materialList')}
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => setAiQuestion(t('electricalStandards'))}>
                          {t('electricalStandards')}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              
              <div className="col-md-6">
                <section id="ai-inspection" className="card ai-inspector">
                  <div className="card-header">
                    <h2><i className="fas fa-search"></i> {t('aiInspectorTitle')}</h2>
                    <div className="card-actions">
                      <span className="ai-badge"><i className="fas fa-eye"></i> {t('liveMonitoring')}</span>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <p>{t('startInspectionPrompt') || 'Start een inspectieronde:'}</p>
                    
                    <div className="inspection-actions">
                      <button className="btn btn-danger" onClick={() => handleStartInspection('veiligheid')}>
                        <i className="fas fa-shield-alt"></i> {t('startSafetyInspection')}
                      </button>
                      <button className="btn btn-warning" onClick={() => handleStartInspection('kwaliteit')}>
                        <i className="fas fa-award"></i> {t('startQualityInspection')}
                      </button>
                      <button className="btn btn-info" onClick={() => handleStartInspection('voortgang')}>
                        <i className="fas fa-chart-line"></i> {t('startProgressInspection')}
                      </button>
                    </div>
                    
                    <div className="inspection-results">
                      <h4>{t('lastInspection') || 'Laatste inspectie:'}</h4>
                      <div className="inspection-score">
                        <div className="score-circle">
                          <span className="score-value">92%</span>
                          <span className="score-label">{t('safetyScore') || 'Veiligheids-score'}</span>
                        </div>
                        <div className="score-details">
                          <div className="score-item success">
                            <i className="fas fa-check-circle"></i>
                            <span>15 {t('approved') || 'Goedgekeurd'}</span>
                          </div>
                          <div className="score-item warning">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>2 {t('warnings') || 'Waarschuwingen'}</span>
                          </div>
                          <div className="score-item danger">
                            <i className="fas fa-times-circle"></i>
                            <span>0 {t('critical')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Work Registration & Material Usage */}
            <div className="row mb-4">
              <div className="col-md-6">
                <section id="work-registration" className="card">
                  <div className="card-header">
                    <h2><i className="fas fa-clock"></i> {t('workRegistration')}</h2>
                    <div className="card-actions">
                      <button className="btn btn-sm btn-outline">
                        <i className="fas fa-history"></i> {t('history') || 'Geschiedenis'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <form onSubmit={handleWorkSubmit}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">{t('selectTask')}</label>
                          <select name="task" className="form-select" required>
                            <option value="">{t('selectTask')}</option>
                            <option value="foundation">{t('foundationWork')}</option>
                            <option value="concrete">{t('concretePouring')}</option>
                            <option value="walls">{t('cavityWallCheck')}</option>
                            <option value="electrical">{t('electricalInstallation')}</option>
                            <option value="plumbing">{t('plumbingInstallation')}</option>
                            <option value="finishing">{t('floorFinishing')}</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">{t('hoursWorked')}</label>
                          <div className="input-group">
                            <input 
                              type="number" 
                              name="hours" 
                              className="form-control" 
                              min="0" 
                              max="24" 
                              step="0.5" 
                              required 
                              defaultValue="8"
                            />
                            <span className="input-group-text">{t('hours')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">{t('startTime')}</label>
                          <input type="time" name="startTime" className="form-control" defaultValue="08:00" required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">{t('endTime')}</label>
                          <input type="time" name="endTime" className="form-control" defaultValue="17:00" required />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">{t('materialsUsed')}</label>
                        <select name="materials" className="form-select" multiple>
                          {materials.map(material => (
                            <option key={material.id} value={material.id}>
                              {material.name} ({material.used}/{material.planned} {material.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">{t('notes')}</label>
                        <textarea 
                          name="notes" 
                          className="form-control" 
                          rows="3" 
                          placeholder={t('notesPlaceholder')}
                        ></textarea>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary flex-grow-1">
                          <i className="fas fa-check-circle me-2"></i>
                          {t('registerWork')}
                        </button>
                        <button type="button" className="btn btn-outline-secondary">
                          <i className="fas fa-camera me-2"></i>
                          {t('photoEvidence')}
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              </div>
              
              <div className="col-md-6">
                <section id="material-usage" className="card">
                  <div className="card-header">
                    <h2><i className="fas fa-boxes"></i> {t('materialUsage')}</h2>
                    <div className="card-actions">
                      <button className="btn btn-sm btn-outline" onClick={handleScanQR}>
                        <i className="fas fa-qrcode"></i> {t('scanBarcode')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>{t('material')}</th>
                            <th>{t('planned')}</th>
                            <th>{t('used')}</th>
                            <th>{t('remaining')}</th>
                            <th>{t('unit')}</th>
                            <th>{t('status')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materials.map(material => {
                            const percentage = (material.used / material.planned) * 100;
                            let statusClass = 'success';
                            if (percentage > 80) statusClass = 'warning';
                            if (percentage > 95) statusClass = 'danger';
                            
                            return (
                              <tr key={material.id}>
                                <td>{material.name}</td>
                                <td>{material.planned}</td>
                                <td>{material.used}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <span className={material.remaining < material.planned * 0.2 ? 'text-danger' : 'text-success'}>
                                      {material.remaining}
                                    </span>
                                    <div className="progress flex-grow-1 ms-2" style={{height: '6px'}}>
                                      <div 
                                        className={`progress-bar bg-${statusClass}`} 
                                        style={{width: `${percentage}%`}}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td>{material.unit}</td>
                                <td>
                                  <span className={`badge bg-${statusClass}`}>
                                    {percentage.toFixed(0)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    <form onSubmit={handleMaterialSubmit} className="mt-3">
                      <div className="row g-2">
                        <div className="col-md-5">
                          <input 
                            type="text" 
                            name="materialName" 
                            className="form-control" 
                            placeholder={t('material')}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <div className="input-group">
                            <input 
                              type="number" 
                              name="quantity" 
                              className="form-control" 
                              placeholder={t('quantity')}
                              min="1"
                              required
                            />
                            <select name="unit" className="form-select" style={{maxWidth: '100px'}}>
                              <option value="stuks">stuks</option>
                              <option value="kg">kg</option>
                              <option value="m">m</option>
                              <option value="m²">m²</option>
                              <option value="m³">m³</option>
                              <option value="liter">liter</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <button type="submit" className="btn btn-primary w-100">
                            <i className="fas fa-plus me-2"></i>
                            {t('registerMaterialUsage')}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </section>
              </div>
            </div>

            {/* Photo Upload Section */}
            <section id="photo-upload" className="card mb-4">
              <div className="card-header">
                <h2><i className="fas fa-camera"></i> {t('photoUploadTitle')}</h2>
                <div className="card-actions">
                  <span className="ai-badge"><i className="fas fa-eye"></i> {t('monitorsSafety')}</span>
                  <button className="btn btn-sm btn-outline" onClick={() => document.getElementById('cameraInput').click()}>
                    <i className="fas fa-camera"></i> {t('takePhoto')}
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                <p>{t('photoUploadDescription') || 'Upload foto&apos;s voor AI analyse en veiligheidscontrole.'}</p>
                
                <input 
                  type="file" 
                  id="cameraInput" 
                  accept="image/*" 
                  capture="environment" 
                  style={{display: 'none'}}
                  onChange={handleUploadClick}
                />
                
                <div className="upload-area" onClick={() => document.getElementById('cameraInput').click()}>
                  <div className="upload-icon">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <p>{t('uploadPlaceholder')}</p>
                  <p className="text-muted">Max. 10MB per foto • JPEG, PNG</p>
                </div>
                
                {uploadedPhotos.length > 0 && (
                  <div className="photo-preview">
                    <h4>{t('recentPhotos') || 'Recente foto&apos;s:'}</h4>
                    <div className="photo-grid">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="photo-item">
                          <img src={photo} alt={`Bouwplaats foto ${index + 1}`} />
                          <div className="photo-overlay">
                            <button className="btn btn-sm btn-light">
                              <i className="fas fa-search"></i>
                            </button>
                            <button className="btn btn-sm btn-light">
                              <i className="fas fa-trash"></i>
                            </button>
                            <button className="btn btn-sm btn-light">
                              <i className="fas fa-share"></i>
                            </button>
                          </div>
                          <div className="photo-info">
                            <small>{new Date().toLocaleTimeString()}</small>
                            <span className="badge bg-success">
                              <i className="fas fa-check"></i> {t('safetyCheckPassed')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="alert alert-success mt-3">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <strong>{t('safetyCheckPassed')}:</strong> {t('safetyCheckDescription') || 'AI heeft geanalyseerd dat alle PBW&apos;s correct worden gedragen.'}
                  </div>
                </div>
              </div>
            </section>

            {/* Additional sections zouden hier komen... */}
            {/* BIM Module, Deliveries, Safety, Team Overview, Issues, etc. */}
            
          </main>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="bottom-nav">
        <button className="bottom-nav-item active">
          <i className="fas fa-home"></i>
          <span>{t('home') || 'Home'}</span>
        </button>
        <button className="bottom-nav-item">
          <i className="fas fa-camera"></i>
          <span>{t('photoUpload')}</span>
        </button>
        <button className="bottom-nav-item" onClick={handleWorkSubmit}>
          <i className="fas fa-clock"></i>
          <span>{t('workRegistration')}</span>
        </button>
        <button className="bottom-nav-item" onClick={handleIssueReport}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>{t('issuesProblems')}</span>
        </button>
        <button className="bottom-nav-item">
          <i className="fas fa-cog"></i>
          <span>{t('settings')}</span>
        </button>
      </div>

      <style jsx global>{`
        /* COMPLETE CSS - Alle styles in één */
        :root {
          --primary: #1a5f7a;
          --secondary: #57c5b6;
          --accent: #f24c3d;
          --light: #f8f9fa;
          --dark: #343a40;
          --gray: #6c757d;
          --success: #28a745;
          --warning: #ffc107;
          --danger: #dc3545;
          --info: #17a2b8;
          --purple: #6f42c1;
          --pink: #e83e8c;
          --orange: #fd7e14;
          --teal: #20c997;
          --cyan: #0dcaf0;
          --indigo: #6610f2;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        
        body {
          background-color: #f5f7fa;
          color: var(--dark);
          line-height: 1.6;
          font-size: 14px;
          padding-bottom: 70px; /* Voor bottom-nav */
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 15px;
        }
        
        /* Header Styles */
        header {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 15px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 0 0 15px 15px;
          margin-bottom: 20px;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
          min-width: 300px;
        }
        
        .logo i {
          font-size: 2.2rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 10px;
          border-radius: 10px;
        }
        
        .logo h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .header-subtitle {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .language-selector {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 0.85rem;
          min-width: 150px;
        }
        
        .language-selector:focus {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
        }
        
        .language-selector option {
          color: var(--dark);
          background: white;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          text-align: right;
        }
        
        .user-info p {
          margin: 0;
          line-height: 1.4;
        }
        
        .user-stats {
          display: flex;
          gap: 10px;
          margin-top: 5px;
          font-size: 0.8rem;
          opacity: 0.9;
        }
        
        .user-stats span {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        
        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fff, #e9ecef);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          position: relative;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .user-status {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          background: var(--success);
        }
        
        .user-status.online { background: var(--success); }
        .user-status.away { background: var(--warning); }
        .user-status.offline { background: var(--gray); }
        
        /* Dashboard Layout */
        .dashboard {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 20px;
          min-height: calc(100vh - 150px);
        }
        
        @media (max-width: 992px) {
          .dashboard {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            display: none;
          }
          
          .bottom-nav {
            display: flex !important;
          }
        }
        
        /* Sidebar */
        .sidebar {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          height: fit-content;
          position: sticky;
          top: 100px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }
        
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .sidebar-header h3 {
          margin: 0;
          color: var(--primary);
          font-size: 1.1rem;
        }
        
        .sidebar-toggle {
          background: none;
          border: none;
          color: var(--gray);
          cursor: pointer;
          font-size: 1rem;
          padding: 5px;
        }
        
        .nav-menu {
          list-style: none;
          margin-bottom: 25px;
        }
        
        .nav-menu li {
          margin-bottom: 5px;
        }
        
        .nav-menu a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          text-decoration: none;
          color: var(--dark);
          border-radius: 10px;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .nav-menu a:hover {
          background: rgba(26, 95, 122, 0.08);
          color: var(--primary);
          transform: translateX(5px);
        }
        
        .nav-menu a.active {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          box-shadow: 0 4px 15px rgba(26, 95, 122, 0.2);
        }
        
        .nav-menu a i {
          width: 20px;
          text-align: center;
          font-size: 1.1rem;
        }
        
        .sidebar-footer {
          border-top: 1px solid #e9ecef;
          padding-top: 20px;
        }
        
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        
        .quick-actions .btn {
          padding: 8px 5px;
          font-size: 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        
        .work-statistics {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 15px;
          border-radius: 10px;
        }
        
        .work-statistics h4 {
          font-size: 0.9rem;
          margin-bottom: 10px;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        
        .stat-item {
          background: white;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .stat-value {
          font-size: 1.3rem;
          font-weight: bold;
          color: var(--primary);
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.7rem;
          color: var(--gray);
          margin-top: 3px;
        }
        
        /* Main Content */
        .main-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        /* Cards */
        .card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          border: none;
          margin-bottom: 0;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .card-header h2 {
          color: var(--primary);
          font-size: 1.3rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .card-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .ai-badge {
          background: linear-gradient(135deg, var(--secondary), #45a99a);
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 500;
        }
        
        /* Planning */
        .planning-container {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 10px;
          padding: 20px;
        }
        
        .planning-date {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px dashed #cbd5e1;
        }
        
        .planning-date h3 {
          color: var(--primary);
          margin: 0;
          font-size: 1.1rem;
        }
        
        .weather-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--info);
          font-weight: 500;
        }
        
        .planning-list {
          list-style: none;
        }
        
        .planning-item {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          gap: 20px;
          padding: 18px;
          background: white;
          border-radius: 10px;
          margin-bottom: 12px;
          border-left: 5px solid var(--primary);
          transition: all 0.3s ease;
          align-items: center;
        }
        
        .planning-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .planning-item.current {
          border-left-color: var(--success);
          background: linear-gradient(135deg, rgba(40, 167, 69, 0.05), white);
        }
        
        .planning-time {
          background: var(--primary);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: bold;
          text-align: center;
          font-size: 0.9rem;
        }
        
        .planning-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .planning-task {
          font-weight: 600;
          color: var(--dark);
          font-size: 1rem;
        }
        
        .planning-details {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .planning-details .badge {
          font-size: 0.7rem;
          padding: 4px 8px;
        }
        
        .planning-details span:not(.badge) {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--gray);
          font-size: 0.85rem;
        }
        
        .planning-status {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .status {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status.in-progress {
          background: rgba(255, 193, 7, 0.15);
          color: var(--warning);
          border: 1px solid rgba(255, 193, 7, 0.3);
        }
        
        .status.pending {
          background: rgba(108, 117, 125, 0.15);
          color: var(--gray);
          border: 1px solid rgba(108, 117, 125, 0.3);
        }
        
        .status.completed {
          background: rgba(40, 167, 69, 0.15);
          color: var(--success);
          border: 1px solid rgba(40, 167, 69, 0.3);
        }
        
        /* AI Assistant */
        .ai-assistant {
          background: linear-gradient(135deg, rgba(87, 197, 182, 0.05), rgba(87, 197, 182, 0.02));
          border-left: 5px solid var(--secondary);
        }
        
        .ai-input-area {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .ai-input {
          flex: 1;
          padding: 14px 18px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s;
        }
        
        .ai-input:focus {
          outline: none;
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(87, 197, 182, 0.2);
        }
        
        .btn {
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.9rem;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .btn:active {
          transform: translateY(0);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, var(--primary), #144b60);
          color: white;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #144b60, var(--primary));
        }
        
        .btn-success {
          background: linear-gradient(135deg, var(--success), #1e7e34);
          color: white;
        }
        
        .btn-warning {
          background: linear-gradient(135deg, var(--warning), #d39e00);
          color: var(--dark);
        }
        
        .btn-danger {
          background: linear-gradient(135deg, var(--danger), #b21f2d);
          color: white;
        }
        
        .btn-info {
          background: linear-gradient(135deg, var(--info), #138496);
          color: white;
        }
        
        .btn-outline {
          background: transparent;
          border: 2px solid #e9ecef;
          color: var(--dark);
        }
        
        .btn-outline:hover {
          background: #f8f9fa;
          border-color: var(--primary);
          color: var(--primary);
        }
        
        .btn-sm {
          padding: 8px 16px;
          font-size: 0.8rem;
          border-radius: 8px;
        }
        
        .ai-response {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          border-left: 4px solid var(--primary);
          box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }
        
        .ai-response-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          color: var(--primary);
        }
        
        .ai-response-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }
        
        .quick-questions h4 {
          font-size: 0.9rem;
          margin-bottom: 10px;
          color: var(--gray);
        }
        
        .quick-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        /* AI Inspector */
        .ai-inspector {
          background: linear-gradient(135deg, rgba(26, 95, 122, 0.05), rgba(26, 95, 122, 0.02));
          border-left: 5px solid var(--primary);
        }
        
        .inspection-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 25px;
        }
        
        .inspection-results {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #e9ecef;
        }
        
        .inspection-score {
          display: flex;
          align-items: center;
          gap: 30px;
          flex-wrap: wrap;
        }
        
        .score-circle {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: conic-gradient(var(--success) 0% 92%, #e9ecef 92% 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .score-circle::before {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
        }
        
        .score-value {
          position: relative;
          font-size: 1.8rem;
          font-weight: bold;
          color: var(--success);
        }
        
        .score-label {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.8rem;
          color: var(--gray);
          white-space: nowrap;
        }
        
        .score-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .score-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 15px;
          border-radius: 8px;
          font-weight: 500;
        }
        
        .score-item.success {
          background: rgba(40, 167, 69, 0.1);
          color: var(--success);
        }
        
        .score-item.warning {
          background: rgba(255, 193, 7, 0.1);
          color: var(--warning);
        }
        
        .score-item.danger {
          background: rgba(220, 53, 69, 0.1);
          color: var(--danger);
        }
        
        /* Forms */
        .form-label {
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 8px;
          font-size: 0.9rem;
        }
        
        .form-control, .form-select {
          padding: 12px 15px;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(87, 197, 182, 0.2);
          outline: none;
        }
        
        .input-group .form-control {
          border-right: none;
        }
        
        .input-group-text {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-left: none;
          color: var(--gray);
        }
        
        /* Tables */
        .table {
          margin-bottom: 0;
        }
        
        .table thead th {
          background: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
          color: var(--primary);
          font-weight: 600;
          padding: 12px 15px;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .table tbody td {
          padding: 15px;
          vertical-align: middle;
          border-color: #e9ecef;
        }
        
        .table tbody tr:hover {
          background: rgba(26, 95, 122, 0.02);
        }
        
        .progress {
          background: #e9ecef;
          border-radius: 10px;
          height: 10px;
        }
        
        .progress-bar {
          border-radius: 10px;
        }
        
        /* Photo Upload */
        .upload-area {
          border: 3px dashed var(--secondary);
          border-radius: 15px;
          padding: 50px 20px;
          text-align: center;
          margin-bottom: 20px;
          cursor: pointer;
          transition: all 0.3s;
          background: rgba(87, 197, 182, 0.05);
        }
        
        .upload-area:hover {
          background: rgba(87, 197, 182, 0.1);
          border-color: var(--primary);
        }
        
        .upload-icon {
          font-size: 3.5rem;
          color: var(--secondary);
          margin-bottom: 15px;
        }
        
        .photo-preview h4 {
          margin-bottom: 15px;
          color: var(--primary);
          font-size: 1rem;
        }
        
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }
        
        .photo-item {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .photo-item img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }
        
        .photo-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .photo-item:hover .photo-overlay {
          opacity: 1;
        }
        
        .photo-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 8px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }
        
        /* Alerts */
        .alert {
          padding: 15px 20px;
          border-radius: 12px;
          border: none;
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        
        .alert-success {
          background: rgba(40, 167, 69, 0.1);
          border-left: 4px solid var(--success);
          color: #155724;
        }
        
        .alert-warning {
          background: rgba(255, 193, 7, 0.1);
          border-left: 4px solid var(--warning);
          color: #856404;
        }
        
        .alert-danger {
          background: rgba(220, 53, 69, 0.1);
          border-left: 4px solid var(--danger);
          color: #721c24;
        }
        
        .alert i {
          font-size: 1.2rem;
          margin-top: 2px;
        }
        
        /* Badges */
        .badge {
          padding: 6px 10px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.3px;
        }
        
        .bg-primary { background: linear-gradient(135deg, var(--primary), #144b60) !important; }
        .bg-success { background: linear-gradient(135deg, var(--success), #1e7e34) !important; }
        .bg-warning { background: linear-gradient(135deg, var(--warning), #d39e00) !important; }
        .bg-danger { background: linear-gradient(135deg, var(--danger), #b21f2d) !important; }
        .bg-info { background: linear-gradient(135deg, var(--info), #138496) !important; }
        
        /* PWA & Emergency */
        .pwa-install-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          box-shadow: 0 5px 20px rgba(26, 95, 122, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        
        .connection-status {
          position: fixed;
          top: 70px;
          right: 20px;
          z-index: 9998;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .connection-status.online {
          background: rgba(40, 167, 69, 0.15);
          color: var(--success);
          border: 1px solid rgba(40, 167, 69, 0.3);
        }
        
        .connection-status.offline {
          background: rgba(220, 53, 69, 0.15);
          color: var(--danger);
          border: 1px solid rgba(220, 53, 69, 0.3);
        }
        
        .emergency-btn {
          position: fixed;
          bottom: 90px;
          right: 20px;
          z-index: 9997;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--danger), #b21f2d);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 5px 20px rgba(220, 53, 69, 0.4);
          cursor: pointer;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
        
        /* Bottom Navigation (Mobile) */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 2px solid #e9ecef;
          padding: 10px 5px;
          z-index: 1000;
          box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
        }
        
        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          color: var(--gray);
          padding: 10px 5px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.7rem;
        }
        
        .bottom-nav-item i {
          font-size: 1.2rem;
        }
        
        .bottom-nav-item.active {
          color: var(--primary);
          background: rgba(26, 95, 122, 0.1);
          font-weight: 600;
        }
        
        .bottom-nav-item:hover:not(.active) {
          background: #f8f9fa;
          color: var(--dark);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }
          
          .header-content {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .logo {
            min-width: auto;
            justify-content: center;
            text-align: center;
          }
          
          .user-info {
            text-align: center;
            justify-content: center;
          }
          
          .dashboard {
            min-height: calc(100vh - 200px);
          }
          
          .card {
            padding: 20px 15px;
          }
          
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .card-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .planning-item {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .planning-time {
            width: fit-content;
          }
          
          .planning-status {
            justify-content: space-between;
          }
          
          .inspection-actions {
            grid-template-columns: 1fr;
          }
          
          .ai-input-area {
            flex-direction: column;
          }
          
          .photo-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .pwa-install-btn {
            top: 10px;
            right: 10px;
            padding: 8px 15px;
            font-size: 0.9rem;
          }
          
          .connection-status {
            top: 60px;
            right: 10px;
          }
          
          .emergency-btn {
            bottom: 80px;
            right: 10px;
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-actions {
            grid-template-columns: 1fr;
          }
          
          .inspection-score {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .score-details {
            width: 100%;
          }
        }
        
        /* Utilities */
        .text-muted { color: var(--gray) !important; }
        .text-primary { color: var(--primary) !important; }
        .text-success { color: var(--success) !important; }
        .text-danger { color: var(--danger) !important; }
        .text-warning { color: var(--warning) !important; }
        
        .d-flex { display: flex; }
        .gap-2 { gap: 0.5rem; }
        .ms-2 { margin-left: 0.5rem; }
        .me-2 { margin-right: 0.5rem; }
        .mt-3 { margin-top: 1rem; }
        .mb-3 { margin-bottom: 1rem; }
        .w-100 { width: 100%; }
        .flex-grow-1 { flex-grow: 1; }
        
        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -10px;
          margin-left: -10px;
        }
        
        .col, .col-md-6, .col-md-5, .col-md-4, .col-md-3 {
          padding-right: 10px;
          padding-left: 10px;
        }
        
        .col { flex: 1; }
        .col-md-6 { width: 100%; }
        
        @media (min-width: 768px) {
          .col-md-6 { width: 50%; }
          .col-md-5 { width: 41.666667%; }
          .col-md-4 { width: 33.333333%; }
          .col-md-3 { width: 25%; }
        }
      `}</style>
    </>
  );
}
