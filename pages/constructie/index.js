import { useState, useEffect, useRef } from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const API_BASE = "https://sterkbouw-saas-executor-production.up.railway.app";

const styles = {
  wrap: { maxWidth: 1600, margin: "0 auto", padding: 24 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "2px solid #e5e7eb"
  },
  title: { fontSize: 28, fontWeight: 700, color: "#1f2937" },
  subtitle: { fontSize: 16, color: "#6b7280", marginTop: 4 },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginBottom: 24
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 24,
    marginBottom: 24
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
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
  inputGroup: { marginBottom: 16 },
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
    boxSizing: "border-box",
    transition: "border-color 0.2s"
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
  buttonDanger: {
    padding: "12px 20px",
    background: "#ef4444",
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
  buttonSmall: {
    padding: "6px 12px",
    fontSize: 12,
    borderRadius: 6
  },
  viewerContainer: {
    width: "100%",
    height: 600,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    overflow: "hidden",
    background: "#f9fafb"
  },
  resultsContainer: {
    maxHeight: 600,
    overflowY: "auto",
    padding: 16,
    background: "#f9fafb",
    borderRadius: 8
  },
  resultItem: {
    padding: 12,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    marginBottom: 8
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 4
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#2563eb"
  },
  resultDetail: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2
  },
  comparisonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 16
  },
  comparisonCard: {
    padding: 16,
    borderRadius: 8,
    border: "2px solid #e5e7eb"
  },
  comparisonCardOriginal: {
    borderColor: "#3b82f6",
    background: "#eff6ff"
  },
  comparisonCardModified: {
    borderColor: "#10b981",
    background: "#f0fdf4"
  },
  materialTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13
  },
  tableHeader: {
    background: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
    padding: "10px 12px",
    textAlign: "left",
    fontWeight: 600,
    color: "#374151"
  },
  tableCell: {
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 12px",
    verticalAlign: "top"
  },
  progressBar: {
    height: 8,
    background: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8
  },
  progressFill: {
    height: "100%",
    background: "#10b981",
    borderRadius: 4,
    transition: "width 0.3s"
  },
  tooltip: {
    position: "absolute",
    background: "#1f2937",
    color: "white",
    padding: "8px 12px",
    borderRadius: 6,
    fontSize: 12,
    maxWidth: 200,
    zIndex: 1000,
    pointerEvents: "none"
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500
  },
  statusSafe: { background: "#d1fae5", color: "#065f46" },
  statusWarning: { background: "#fef3c7", color: "#92400e" },
  statusDanger: { background: "#fee2e2", color: "#991b1b" },
  tabContainer: {
    display: "flex",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 20
  },
  tab: {
    padding: "12px 20px",
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s"
  },
  tabActive: {
    color: "#2563eb",
    borderBottomColor: "#2563eb"
  },
  fileUpload: {
    padding: 24,
    border: "2px dashed #d1d5db",
    borderRadius: 8,
    background: "#f9fafb",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s"
  },
  fileUploadHover: {
    borderColor: "#2563eb",
    background: "#eff6ff"
  },
  costSummary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginTop: 20
  },
  costCard: {
    padding: 16,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    textAlign: "center"
  },
  costValue: {
    fontSize: 24,
    fontWeight: 700,
    margin: "8px 0"
  },
  savingPositive: { color: "#10b981" },
  savingNegative: { color: "#ef4444" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255,255,255,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    zIndex: 10
  }
};

// Materiaal eigenschappen database
const MATERIAL_DATABASE = {
  beton: {
    naam: "Beton C25/30",
    druksterkte: 25, // N/mm²
    treksterkte: 2.2, // N/mm²
    elasticiteitsmodulus: 31000, // N/mm²
    dichtheid: 2500, // kg/m³
    prijs: 125, // €/m³
    co2: 300 // kg CO2/m³
  },
  staal: {
    naam: "S235 staal",
    druksterkte: 235, // N/mm²
    treksterkte: 360, // N/mm²
    elasticiteitsmodulus: 210000, // N/mm²
    dichtheid: 7850, // kg/m³
    prijs: 850, // €/ton
    co2: 1850 // kg CO2/ton
  },
  hout: {
    naam: "Vuren C24",
    druksterkte: 21, // N/mm²
    treksterkte: 14, // N/mm²
    elasticiteitsmodulus: 11000, // N/mm²
    dichtheid: 420, // kg/m³
    prijs: 450, // €/m³
    co2: -150 // kg CO2/m³ (negatief = opslag)
  },
  glas: {
    naam: "Veiligheidsglas",
    druksterkte: 800, // N/mm²
    treksterkte: 45, // N/mm²
    elasticiteitsmodulus: 70000, // N/mm²
    dichtheid: 2500, // kg/m³
    prijs: 85, // €/m²
    co2: 12 // kg CO2/m²
  }
};

// Constructie elementen
const CONSTRUCTION_ELEMENTS = {
  balk: {
    naam: "Draagbalk",
    materialen: ["hout", "staal"],
    typischeAfmetingen: [
      { breedte: 50, hoogte: 200, lengte: 4000 },
      { breedte: 80, hoogte: 240, lengte: 5000 },
      { breedte: 100, hoogte: 300, lengte: 6000 }
    ]
  },
  kolom: {
    naam: "Kolom",
    materialen: ["beton", "staal", "hout"],
    typischeAfmetingen: [
      { diameter: 200, hoogte: 3000 },
      { diameter: 250, hoogte: 3500 },
      { diameter: 300, hoogte: 4000 }
    ]
  },
  wand: {
    naam: "Dragende wand",
    materialen: ["beton"],
    typischeAfmetingen: [
      { dikte: 150, hoogte: 2800, lengte: 4000 },
      { dikte: 200, hoogte: 3000, lengte: 5000 }
    ]
  },
  vloer: {
    naam: "Vloerplaat",
    materialen: ["beton", "hout"],
    typischeAfmetingen: [
      { dikte: 180, breedte: 5000, lengte: 7000 },
      { dikte: 200, breedte: 6000, lengte: 8000 }
    ]
  },
  fundering: {
    naam: "Fundering",
    materialen: ["beton"],
    typischeAfmetingen: [
      { breedte: 600, hoogte: 300, lengte: 10000 },
      { breedte: 800, hoogte: 400, lengte: 12000 }
    ]
  }
};

export default function ConstructieAnalyse() {
  // Refs
  const viewerRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // State
  const [activeTab, setActiveTab] = useState("bestaand");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  
  // Constructie parameters
  const [constructieType, setConstructieType] = useState("aanbouw");
  const [bouwklasse, setBouwklasse] = useState("woonfunctie");
  const [overspanning, setOverspanning] = useState(6);
  const [belasting, setBelasting] = useState(2.5);
  const [veiligheidsfactor, setVeiligheidsfactor] = useState(1.35);
  
  // Materialen state
  const [materialen, setMaterialen] = useState({
    balk: { type: "hout", afmeting: 0 },
    kolom: { type: "staal", afmeting: 0 },
    vloer: { type: "beton", afmeting: 0 },
    fundering: { type: "beton", afmeting: 0 }
  });
  
  // Aanpassingen state
  const [aanpassingen, setAanpassingen] = useState({
    verwijderWand: false,
    vergrootOpening: false,
    nieuweOpening: { breedte: 0, hoogte: 0 },
    extraVerdieping: false,
    aanbouw: { breedte: 0, diepte: 0, hoogte: 0 }
  });
  
  // 3D Viewer initialisatie
  useEffect(() => {
    if (!viewerRef.current) return;
    
    // Three.js initialisatie
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf9fafb);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      viewerRef.current.clientWidth / viewerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    viewerRef.current.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Licht toevoegen
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Helper grid
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);
    
    // Referenties opslaan
    sceneRef.current = scene;
    controlsRef.current = controls;
    rendererRef.current = renderer;
    
    // Basis constructie tekenen
    tekenConstructie();
    
    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Resize handler
    const handleResize = () => {
      camera.aspect = viewerRef.current.clientWidth / viewerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);
  
  // Functie om constructie te tekenen
  const tekenConstructie = () => {
    if (!sceneRef.current) return;
    
    // Oude constructie verwijderen
    while(sceneRef.current.children.length > 0) { 
      if (sceneRef.current.children[0].type === 'GridHelper') break;
      sceneRef.current.remove(sceneRef.current.children[0]); 
    }
    
    // Afmetingen
    const breedte = overspanning;
    const diepte = overspanning * 1.5;
    const hoogte = 3.0;
    
    // Vloerplaat
    const vloerGeometry = new THREE.BoxGeometry(breedte, 0.2, diepte);
    const vloerMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8B4513,
      transparent: true,
      opacity: 0.8
    });
    const vloer = new THREE.Mesh(vloerGeometry, vloerMaterial);
    vloer.position.y = 0.1;
    vloer.receiveShadow = true;
    sceneRef.current.add(vloer);
    
    // Muren
    const wandMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xC0C0C0,
      transparent: true,
      opacity: 0.7
    });
    
    // Voorgevel
    const voorGevelGeometry = new THREE.BoxGeometry(breedte, hoogte, 0.2);
    const voorGevel = new THREE.Mesh(voorGevelGeometry, wandMaterial);
    voorGevel.position.set(0, hoogte/2, -diepte/2 + 0.1);
    voorGevel.castShadow = true;
    sceneRef.current.add(voorGevel);
    
    // Achtergevel
    const achterGevel = new THREE.Mesh(voorGevelGeometry, wandMaterial);
    achterGevel.position.set(0, hoogte/2, diepte/2 - 0.1);
    achterGevel.castShadow = true;
    sceneRef.current.add(achterGevel);
    
    // Zijgevels
    const zijGevelGeometry = new THREE.BoxGeometry(0.2, hoogte, diepte);
    const linkerGevel = new THREE.Mesh(zijGevelGeometry, wandMaterial);
    linkerGevel.position.set(-breedte/2 + 0.1, hoogte/2, 0);
    linkerGevel.castShadow = true;
    sceneRef.current.add(linkerGevel);
    
    const rechterGevel = new THREE.Mesh(zijGevelGeometry, wandMaterial);
    rechterGevel.position.set(breedte/2 - 0.1, hoogte/2, 0);
    rechterGevel.castShadow = true;
    sceneRef.current.add(rechterGevel);
    
    // Draagbalken
    const balkMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
    const balkGeometry = new THREE.BoxGeometry(0.2, 0.4, diepte);
    
    for (let i = -2; i <= 2; i++) {
      const balk = new THREE.Mesh(balkGeometry, balkMaterial);
      balk.position.set(i * (breedte/4), hoogte - 0.2, 0);
      balk.castShadow = true;
      sceneRef.current.add(balk);
    }
    
    // Kolommen
    const kolomMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const kolomGeometry = new THREE.CylinderGeometry(0.15, 0.15, hoogte - 0.2);
    
    const kolomPosities = [
      [-breedte/2 + 0.5, (hoogte - 0.2)/2, -diepte/2 + 0.5],
      [breedte/2 - 0.5, (hoogte - 0.2)/2, -diepte/2 + 0.5],
      [-breedte/2 + 0.5, (hoogte - 0.2)/2, diepte/2 - 0.5],
      [breedte/2 - 0.5, (hoogte - 0.2)/2, diepte/2 - 0.5]
    ];
    
    kolomPosities.forEach(pos => {
      const kolom = new THREE.Mesh(kolomGeometry, kolomMaterial);
      kolom.position.set(pos[0], pos[1], pos[2]);
      kolom.castShadow = true;
      sceneRef.current.add(kolom);
    });
    
    // Dak
    const dakGeometry = new THREE.BoxGeometry(breedte, 0.1, diepte);
    const dakMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
    const dak = new THREE.Mesh(dakGeometry, dakMaterial);
    dak.position.set(0, hoogte + 0.05, 0);
    dak.receiveShadow = true;
    sceneRef.current.add(dak);
    
    // Aanbouw (indien geselecteerd)
    if (aanpassingen.aanbouw.breedte > 0) {
      const aanbouwBreedte = aanpassingen.aanbouw.breedte;
      const aanbouwDiepte = aanpassingen.aanbouw.diepte;
      const aanbouwHoogte = aanpassingen.aanbouw.hoogte || hoogte;
      
      const aanbouwGeometry = new THREE.BoxGeometry(aanbouwBreedte, aanbouwHoogte, aanbouwDiepte);
      const aanbouwMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4682B4,
        transparent: true,
        opacity: 0.6
      });
      const aanbouw = new THREE.Mesh(aanbouwGeometry, aanbouwMaterial);
      aanbouw.position.set(breedte/2 + aanbouwBreedte/2, aanbouwHoogte/2, 0);
      aanbouw.castShadow = true;
      sceneRef.current.add(aanbouw);
    }
  };
  
  // Functie om bestand te uploaden
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setUploadedFile(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'constructie_analyse');
      
      const response = await fetch(`${API_BASE}/api/analyse/constructie`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        
        // Update parameters op basis van analyse
        if (data.overspanning) setOverspanning(data.overspanning);
        if (data.belasting) setBelasting(data.belasting);
        
        // Visualiseer in 3D viewer
        visualiseerAnalyseResultaat(data);
      } else {
        throw new Error('Analyse mislukt');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fout bij uploaden: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Functie om analyse resultaat te visualiseren
  const visualiseerAnalyseResultaat = (data) => {
    if (!sceneRef.current || !data) return;
    
    // Markeer kritieke punten
    if (data.kritiekePunten) {
      data.kritiekePunten.forEach((punt, index) => {
        const sphereGeometry = new THREE.SphereGeometry(0.1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
          color: punt.veiligheidsfactor < 1 ? 0xff0000 : 
                 punt.veiligheidsfactor < 1.5 ? 0xffa500 : 0x00ff00 
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(punt.x || 0, punt.y || 0, punt.z || 0);
        sceneRef.current.add(sphere);
      });
    }
  };
  
  // Functie om constructie te berekenen
  const berekenConstructie = () => {
    setLoading(true);
    
    // Simuleer berekening
    setTimeout(() => {
      const berekeningen = voerConstructieberekeningenUit();
      setAnalysisResult(berekeningen);
      setLoading(false);
    }, 1500);
  };
  
  // Functie om aanpassingen te berekenen
  const berekenAanpassingen = () => {
    setLoading(true);
    
    // Originele constructie berekenen
    const origineel = voerConstructieberekeningenUit();
    
    // Gewijzigde constructie berekenen
    const gewijzigd = voerConstructieberekeningenUit(true);
    
    // Vergelijking maken
    const vergelijking = vergelijkConstructies(origineel, gewijzigd);
    setComparisonResult(vergelijking);
    
    setLoading(false);
  };
  
  // Constructieberekeningsfuncties
  const voerConstructieberekeningenUit = (isGewijzigd = false) => {
    const oppervlakte = overspanning * overspanning * 1.5;
    const volume = oppervlakte * 3.0;
    
    // Materiaalkosten berekenen
    const materiaalKosten = Object.entries(materialen).reduce((totaal, [element, mat]) => {
      const materiaal = MATERIAL_DATABASE[mat.type];
      const volumeElement = berekenVolumeElement(element);
      return totaal + (materiaal.prijs * volumeElement);
    }, 0);
    
    // Arbeidskosten
    const arbeidskosten = volume * 150; // €/m³
    
    // Totale belasting
    const totaleBelasting = belasting * oppervlakte * 1000; // kg
    
    // Spanningen berekenen
    const maxSpanning = berekenMaxSpanning();
    const toelaatbareSpanning = berekenToelaatbareSpanning();
    const veiligheidsFactor = toelaatbareSpanning / maxSpanning;
    
    // Aanpassingen meenemen indien gewijzigd
    let aanpassingsKosten = 0;
    if (isGewijzigd) {
      if (aanpassingen.verwijderWand) {
        aanpassingsKosten += -5000; // Besparing
      }
      if (aanpassingen.vergrootOpening) {
        aanpassingsKosten += 3000; // Extra kosten
      }
      if (aanpassingen.extraVerdieping) {
        aanpassingsKosten += volume * 450; // Kosten extra verdieping
      }
      if (aanpassingen.aanbouw.breedte > 0) {
        const aanbouwVolume = aanpassingen.aanbouw.breedte * 
                              aanpassingen.aanbouw.diepte * 
                              (aanpassingen.aanbouw.hoogte || 3.0);
        aanpassingsKosten += aanbouwVolume * 600;
      }
    }
    
    return {
      materiaalKosten: materiaalKosten,
      arbeidskosten: arbeidskosten,
      totaleKosten: materiaalKosten + arbeidskosten + (isGewijzigd ? aanpassingsKosten : 0),
      aanpassingsKosten: aanpassingsKosten,
      veiligheidsFactor: veiligheidsFactor,
      maxSpanning: maxSpanning,
      toelaatbareSpanning: toelaatbareSpanning,
      totaleBelasting: totaleBelasting,
      doorbuiging: berekenDoorbuiging(),
      kritiekePunten: [
        { x: 0, y: 1.5, z: 0, veiligheidsfactor: veiligheidsFactor, type: "max spanning" }
      ],
      materiaalGebruik: Object.entries(materialen).map(([element, mat]) => ({
        element,
        materiaal: mat.type,
        volume: berekenVolumeElement(element),
        kosten: MATERIAL_DATABASE[mat.type].prijs * berekenVolumeElement(element)
      }))
    };
  };
  
  const berekenVolumeElement = (element) => {
    switch(element) {
      case 'balk':
        return 0.2 * 0.4 * overspanning * 1.5 * 5; // 5 balken
      case 'kolom':
        return Math.PI * 0.15 * 0.15 * 2.8 * 4; // 4 kolommen
      case 'vloer':
        return overspanning * overspanning * 1.5 * 0.2;
      case 'fundering':
        return overspanning * 0.8 * 0.4;
      default:
        return 1;
    }
  };
  
  const berekenMaxSpanning = () => {
    // Vereenvoudigde spanningberekening
    const moment = (belasting * overspanning * overspanning) / 8;
    const traagheidsmoment = (0.2 * Math.pow(0.4, 3)) / 12;
    return (moment * 0.2) / traagheidsmoment;
  };
  
  const berekenToelaatbareSpanning = () => {
    const materiaal = MATERIAL_DATABASE[materialen.balk.type];
    return materiaal.druksterkte / veiligheidsfactor;
  };
  
  const berekenDoorbuiging = () => {
    // Vereenvoudigde doorbuigingsberekening
    const elasticiteitsmodulus = MATERIAL_DATABASE[materialen.balk.type].elasticiteitsmodulus;
    return (5 * belasting * Math.pow(overspanning, 4)) / (384 * elasticiteitsmodulus * ((0.2 * Math.pow(0.4, 3)) / 12));
  };
  
  const vergelijkConstructies = (origineel, gewijzigd) => {
    return {
      origineel: origineel,
      gewijzigd: gewijzigd,
      verschilKosten: gewijzigd.totaleKosten - origineel.totaleKosten,
      verschilVeiligheid: gewijzigd.veiligheidsFactor - origineel.veiligheidsFactor,
      besparing: origineel.totaleKosten - gewijzigd.totaleKosten,
      kritiekeVeranderingen: [
        {
          element: "Veiligheidsfactor",
          origineel: origineel.veiligheidsFactor.toFixed(2),
          gewijzigd: gewijzigd.veiligheidsFactor.toFixed(2),
          verschil: (gewijzigd.veiligheidsFactor - origineel.veiligheidsFactor).toFixed(2)
        },
        {
          element: "Totale kosten",
          origineel: `€${origineel.totaleKosten.toFixed(0)}`,
          gewijzigd: `€${gewijzigd.totaleKosten.toFixed(0)}`,
          verschil: `€${(gewijzigd.totaleKosten - origineel.totaleKosten).toFixed(0)}`
        }
      ]
    };
  };
  
  // Functie om materiaal te wijzigen
  const wijzigMateriaal = (element, materiaal) => {
    setMaterialen(prev => ({
      ...prev,
      [element]: { ...prev[element], type: materiaal }
    }));
  };
  
  // Functie om PDF rapport te genereren
  const genereerRapport = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/generate/constructie-rapport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyseResult: analysisResult,
          vergelijking: comparisonResult,
          parameters: {
            constructieType,
            overspanning,
            belasting,
            materialen
          }
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `constructie-rapport-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Rapport generatie mislukt:', error);
    }
  };
  
  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Constructie Analyse & Berekeningen</h1>
          <p style={styles.subtitle}>
            Analyseer constructies, bereken aanpassingen en optimaliseer kosten
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            style={styles.buttonSecondary}
            onClick={() => fileInputRef.current.click()}
          >
            📁 Upload CAD/IFC
          </button>
          <button 
            style={styles.button}
            onClick={berekenConstructie}
            disabled={loading}
          >
            {loading ? "⏳ Berekenen..." : "🔧 Bereken constructie"}
          </button>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".ifc,.dwg,.dxf,.stl,.obj"
        style={{ display: 'none' }}
      />
      
      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tab, ...(activeTab === "bestaand" && styles.tabActive) }}
          onClick={() => setActiveTab("bestaand")}
        >
          Bestaande constructie
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === "aanpassingen" && styles.tabActive) }}
          onClick={() => setActiveTab("aanpassingen")}
        >
          Aanpassingen
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === "vergelijking" && styles.tabActive) }}
          onClick={() => setActiveTab("vergelijking")}
        >
          Vergelijking
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === "optimalisatie" && styles.tabActive) }}
          onClick={() => setActiveTab("optimalisatie")}
        >
          Optimalisatie
        </button>
      </div>
      
      {/* Hoofdcontent */}
      <div style={styles.grid2}>
        {/* 3D Viewer */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🏗️ 3D Constructie Viewer</div>
          <div style={styles.viewerContainer} ref={viewerRef}>
            {loading && (
              <div style={styles.loadingOverlay}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Bezig met laden...</div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>3D model wordt gegenereerd</div>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={{ ...styles.buttonSmall, ...styles.buttonSecondary }}>
              🔄 Reset view
            </button>
            <button style={{ ...styles.buttonSmall, ...styles.buttonSecondary }}>
              📏 Meet afstand
            </button>
            <button style={{ ...styles.buttonSmall, ...styles.buttonSecondary }}>
              🎯 Selecteer element
            </button>
          </div>
        </div>
        
        {/* Parameters en instellingen */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>⚙️ Constructieparameters</div>
          
          <div style={styles.grid3}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Constructie type</label>
              <select 
                style={styles.select}
                value={constructieType}
                onChange={(e) => setConstructieType(e.target.value)}
              >
                <option value="aanbouw">Aanbouw</option>
                <option value="verbouwing">Verbouwing</option>
                <option value="nieuwbouw">Nieuwbouw</option>
                <option value="renovatie">Renovatie</option>
                <option value="sloop">Sloop/herbouw</option>
              </select>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Bouwklasse</label>
              <select 
                style={styles.select}
                value={bouwklasse}
                onChange={(e) => setBouwklasse(e.target.value)}
              >
                <option value="woonfunctie">Woonfunctie</option>
                <option value="kantoor">Kantoor</option>
                <option value="industrie">Industrie</option>
                <option value="bijeenkomst">Bijeenkomstfunctie</option>
              </select>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Overspanning (m)</label>
              <input
                style={styles.input}
                type="number"
                value={overspanning}
                onChange={(e) => setOverspanning(parseFloat(e.target.value))}
                min="1"
                max="30"
                step="0.5"
              />
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Belasting (kN/m²)</label>
            <input
              style={styles.input}
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={belasting}
              onChange={(e) => setBelasting(parseFloat(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
              <span>1 kN/m²</span>
              <span>{belasting} kN/m²</span>
              <span>10 kN/m²</span>
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Veiligheidsfactor γ</label>
            <input
              style={styles.input}
              type="number"
              value={veiligheidsfactor}
              onChange={(e) => setVeiligheidsfactor(parseFloat(e.target.value))}
              min="1"
              max="2"
              step="0.05"
            />
          </div>
          
          {/* Materiaalkeuze */}
          <div style={{ marginTop: 20 }}>
            <div style={styles.cardTitle}>🧱 Materialen</div>
            <table style={styles.materialTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Element</th>
                  <th style={styles.tableHeader}>Materiaal</th>
                  <th style={styles.tableHeader}>Sterkte</th>
                  <th style={styles.tableHeader}>Kosten</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(materialen).map(([element, mat]) => (
                  <tr key={element}>
                    <td style={styles.tableCell}>
                      <div style={{ fontWeight: 500 }}>{element.charAt(0).toUpperCase() + element.slice(1)}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <select
                        style={{ ...styles.select, fontSize: 12, padding: 6 }}
                        value={mat.type}
                        onChange={(e) => wijzigMateriaal(element, e.target.value)}
                      >
                        {CONSTRUCTION_ELEMENTS[element]?.materialen.map(m => (
                          <option key={m} value={m}>{MATERIAL_DATABASE[m].naam}</option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.tableCell}>
                      {MATERIAL_DATABASE[mat.type].druksterkte} N/mm²
                    </td>
                    <td style={styles.tableCell}>
                      €{MATERIAL_DATABASE[mat.type].prijs} per {mat.type === 'staal' ? 'ton' : 'm³'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Aanpassingen sectie */}
      {activeTab === "aanpassingen" && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>🔨 Constructie aanpassingen</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Aanpassingen selecteren</h3>
              
              <div style={styles.inputGroup}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={aanpassingen.verwijderWand}
                    onChange={(e) => setAanpassingen(prev => ({ ...prev, verwijderWand: e.target.checked }))}
                  />
                  <span>Dragende wand verwijderen</span>
                </label>
                <div style={{ fontSize: 12, color: "#6b7280", marginLeft: 24, marginTop: 4 }}>
                  Vereist nieuwe draagconstructie
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={aanpassingen.vergrootOpening}
                    onChange={(e) => setAanpassingen(prev => ({ ...prev, vergrootOpening: e.target.checked }))}
                  />
                  <span>Bestande opening vergroten</span>
                </label>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={aanpassingen.extraVerdieping}
                    onChange={(e) => setAanpassingen(prev => ({ ...prev, extraVerdieping: e.target.checked }))}
                  />
                  <span>Extra verdieping toevoegen</span>
                </label>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Aanbouw toevoegen</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="Breedte"
                    value={aanpassingen.aanbouw.breedte}
                    onChange={(e) => setAanpassingen(prev => ({ 
                      ...prev, 
                      aanbouw: { ...prev.aanbouw, breedte: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="Diepte"
                    value={aanpassingen.aanbouw.diepte}
                    onChange={(e) => setAanpassingen(prev => ({ 
                      ...prev, 
                      aanbouw: { ...prev.aanbouw, diepte: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="Hoogte"
                    value={aanpassingen.aanbouw.hoogte}
                    onChange={(e) => setAanpassingen(prev => ({ 
                      ...prev, 
                      aanbouw: { ...prev.aanbouw, hoogte: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
              
              <button 
                style={{ ...styles.buttonSuccess, marginTop: 16 }}
                onClick={berekenAanpassingen}
                disabled={loading}
              >
                {loading ? "⏳ Berekening..." : "📊 Bereken aanpassingen"}
              </button>
            </div>
            
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Kostenoverzicht aanpassingen</h3>
              
              {comparisonResult ? (
                <div style={styles.comparisonGrid}>
                  <div style={{ ...styles.comparisonCard, ...styles.comparisonCardOriginal }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Origineel</h4>
                    <div style={styles.resultValue}>
                      €{comparisonResult.origineel.totaleKosten.toFixed(0)}
                    </div>
                    <div style={styles.resultDetail}>Totale kosten</div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12 }}>Veiligheidsfactor: {comparisonResult.origineel.veiligheidsFactor.toFixed(2)}</div>
                      <div style={{ 
                        ...styles.statusBadge,
                        ...(comparisonResult.origineel.veiligheidsFactor >= 1.5 ? styles.statusSafe : 
                            comparisonResult.origineel.veiligheidsFactor >= 1 ? styles.statusWarning : styles.statusDanger)
                      }}>
                        {comparisonResult.origineel.veiligheidsFactor >= 1.5 ? "VEILIG" : 
                         comparisonResult.origineel.veiligheidsFactor >= 1 ? "GRENSGEVAL" : "ONVEILIG"}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ ...styles.comparisonCard, ...styles.comparisonCardModified }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Na aanpassing</h4>
                    <div style={{ ...styles.resultValue, ...(comparisonResult.besparing > 0 ? styles.savingPositive : styles.savingNegative) }}>
                      €{comparisonResult.gewijzigd.totaleKosten.toFixed(0)}
                    </div>
                    <div style={styles.resultDetail}>
                      {comparisonResult.besparing > 0 ? `Besparing: €${comparisonResult.besparing.toFixed(0)}` : 
                       `Meer kosten: €${Math.abs(comparisonResult.besparing).toFixed(0)}`}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12 }}>Veiligheidsfactor: {comparisonResult.gewijzigd.veiligheidsFactor.toFixed(2)}</div>
                      <div style={{ 
                        ...styles.statusBadge,
                        ...(comparisonResult.gewijzigd.veiligheidsFactor >= 1.5 ? styles.statusSafe : 
                            comparisonResult.gewijzigd.veiligheidsFactor >= 1 ? styles.statusWarning : styles.statusDanger)
                      }}>
                        {comparisonResult.gewijzigd.veiligheidsFactor >= 1.5 ? "VEILIG" : 
                         comparisonResult.gewijzigd.veiligheidsFactor >= 1 ? "GRENSGEVAL" : "ONVEILIG"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: 32, 
                  textAlign: "center", 
                  color: "#6b7280",
                  border: "2px dashed #d1d5db",
                  borderRadius: 8
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                  <div style={{ fontSize: 14 }}>
                    Selecteer aanpassingen en klik op "Bereken aanpassingen" om een kostenvergelijking te zien
                  </div>
                </div>
              )}
              
              {comparisonResult && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Constructieve wijzigingen</h4>
                  <table style={styles.materialTable}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Element</th>
                        <th style={styles.tableHeader}>Origineel</th>
                        <th style={styles.tableHeader}>Na aanpassing</th>
                        <th style={styles.tableHeader}>Verschil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonResult.kritiekeVeranderingen.map((wijziging, index) => (
                        <tr key={index}>
                          <td style={styles.tableCell}>{wijziging.element}</td>
                          <td style={styles.tableCell}>{wijziging.origineel}</td>
                          <td style={styles.tableCell}>{wijziging.gewijzigd}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: wijziging.element.includes("kosten") && wijziging.verschil.includes("-") ? 
                                   "#ef4444" : "#10b981",
                            fontWeight: 600
                          }}>
                            {wijziging.verschil}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Analyse resultaten */}
      {analysisResult && (
        <div style={styles.card}>
          <div style={{ ...styles.cardTitle, justifyContent: "space-between" }}>
            <span>📈 Analyse Resultaten</span>
            <button 
              style={styles.buttonSmall}
              onClick={genereerRapport}
            >
              📄 Genereer rapport
            </button>
          </div>
          
          <div style={styles.costSummary}>
            <div style={styles.costCard}>
              <div style={{ fontSize: 14, color: "#6b7280" }}>Materiaalkosten</div>
              <div style={styles.costValue}>€{analysisResult.materiaalKosten.toFixed(0)}</div>
            </div>
            <div style={styles.costCard}>
              <div style={{ fontSize: 14, color: "#6b7280" }}>Arbeidskosten</div>
              <div style={styles.costValue}>€{analysisResult.arbeidskosten.toFixed(0)}</div>
            </div>
            <div style={styles.costCard}>
              <div style={{ fontSize: 14, color: "#6b7280" }}>Totale kosten</div>
              <div style={styles.costValue}>€{analysisResult.totaleKosten.toFixed(0)}</div>
            </div>
            <div style={styles.costCard}>
              <div style={{ fontSize: 14, color: "#6b7280" }}>Veiligheidsfactor</div>
              <div style={{
                ...styles.costValue,
                color: analysisResult.veiligheidsFactor >= 1.5 ? "#10b981" : 
                       analysisResult.veiligheidsFactor >= 1 ? "#f59e0b" : "#ef4444"
              }}>
                {analysisResult.veiligheidsFactor.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Constructieve gegevens</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div style={styles.resultItem}>
                <div style={styles.resultTitle}>Maximale spanning</div>
                <div style={styles.resultValue}>{analysisResult.maxSpanning.toFixed(1)} N/mm²</div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultTitle}>Toelaatbare spanning</div>
                <div style={styles.resultValue}>{analysisResult.toelaatbareSpanning.toFixed(1)} N/mm²</div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultTitle}>Totale belasting</div>
                <div style={styles.resultValue}>{(analysisResult.totaleBelasting / 1000).toFixed(1)} ton</div>
              </div>
              <div style={styles.resultItem}>
                <div style={styles.resultTitle}>Max doorbuiging</div>
                <div style={styles.resultValue}>{(analysisResult.doorbuiging * 1000).toFixed(1)} mm</div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Materiaaloverzicht</h3>
            <table style={styles.materialTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Element</th>
                  <th style={styles.tableHeader}>Materiaal</th>
                  <th style={styles.tableHeader}>Volume</th>
                  <th style={styles.tableHeader}>Kosten</th>
                  <th style={styles.tableHeader}>CO2 uitstoot</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.materiaalGebruik.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.tableCell}>{item.element}</td>
                    <td style={styles.tableCell}>{MATERIAL_DATABASE[item.materiaal].naam}</td>
                    <td style={styles.tableCell}>{item.volume.toFixed(2)} {item.materiaal === 'staal' ? 'ton' : 'm³'}</td>
                    <td style={styles.tableCell}>€{item.kosten.toFixed(0)}</td>
                    <td style={styles.tableCell}>
                      {(item.volume * MATERIAL_DATABASE[item.materiaal].co2 / (item.materiaal === 'staal' ? 1000 : 1)).toFixed(0)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Optimalisatie suggesties */}
      {activeTab === "optimalisatie" && analysisResult && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>💡 Optimalisatie Suggesties</div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Kostenbesparingen</h3>
              
              {analysisResult.veiligheidsFactor > 1.8 && (
                <div style={{ 
                  padding: 16, 
                  background: "#f0fdf4", 
                  border: "1px solid #bbf7d0", 
                  borderRadius: 8,
                  marginBottom: 12
                }}>
                  <div style={{ fontWeight: 600, color: "#166534", marginBottom: 4 }}>
                    ⚡ Overspecificatie gedetecteerd
                  </div>
                  <div style={{ fontSize: 14, color: "#166534" }}>
                    Veiligheidsfactor ({analysisResult.veiligheidsFactor.toFixed(2)}) is hoger dan nodig. 
                    Besparing mogelijk door materiaalreductie: ~€{(analysisResult.totaleKosten * 0.15).toFixed(0)}
                  </div>
                </div>
              )}
              
              <div style={{ 
                padding: 16, 
                background: "#fef3c7", 
                border: "1px solid #fde68a", 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <div style={{ fontWeight: 600, color: "#92400e", marginBottom: 4 }}>
                  🔄 Materiaal optimalisatie
                </div>
                <div style={{ fontSize: 14, color: "#92400e" }}>
                  Overweeg staal te vervangen door gelamineerd hout voor balken. 
                  Potentiële besparing: ~€{(analysisResult.materiaalKosten * 0.25).toFixed(0)}
                </div>
              </div>
              
              <div style={{ 
                padding: 16, 
                background: "#eff6ff", 
                border: "1px solid #bfdbfe", 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <div style={{ fontWeight: 600, color: "#1e40af", marginBottom: 4 }}>
                  🏗️ Prefab elementen
                </div>
                <div style={{ fontSize: 14, color: "#1e40af" }}>
                  Prefab betonelementen kunnen arbeidskosten reduceren met ~20%
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Constructieve optimalisaties</h3>
              
              <div style={{ 
                padding: 16, 
                background: "#fef3c7", 
                border: "1px solid #fde68a", 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <div style={{ fontWeight: 600, color: "#92400e", marginBottom: 4 }}>
                  📐 Vloeroverspanning optimaliseren
                </div>
                <div style={{ fontSize: 14, color: "#92400e" }}>
                  Toevoegen van extra steunpunten kan vloerdikte reduceren van 200mm naar 160mm
                </div>
              </div>
              
              <div style={{ 
                padding: 16, 
                background: "#f0fdf4", 
                border: "1px solid #bbf7d0", 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <div style={{ fontWeight: 600, color: "#166534", marginBottom: 4 }}>
                  🧱 Betonkwaliteit optimaliseren
                </div>
                <div style={{ fontSize: 14, color: "#166534" }}>
                  Beton C20/25 i.p.v. C25/30 voldoet voor huidige belasting. 
                  Besparing: €{(analysisResult.materiaalKosten * 0.08).toFixed(0)}
                </div>
              </div>
              
              <div style={{ 
                padding: 16, 
                background: "#eff6ff", 
                border: "1px solid #bfdbfe", 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <div style={{ fontWeight: 600, color: "#1e40af", marginBottom: 4 }}>
                  🔗 Verbindingen optimaliseren
                </div>
                <div style={{ fontSize: 14, color: "#1e40af" }}>
                  Gestandaardiseerde staalverbindingen reduceren montagetijd met 30%
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button 
              style={{ ...styles.button, background: "#8b5cf6" }}
              onClick={() => {
                // Pas optimalisaties automatisch toe
                if (analysisResult.veiligheidsFactor > 1.8) {
                  setVeiligheidsfactor(1.5);
                  alert("Optimalisaties toegepast! Bereken opnieuw voor bijgewerkte resultaten.");
                }
              }}
            >
              🚀 Pas optimale configuratie toe
            </button>
          </div>
        </div>
      )}
      
      {/* Footer acties */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 20, borderTop: "1px solid #e5e7eb" }}>
        <div>
          <button style={styles.buttonSecondary}>
            💾 Project opslaan
          </button>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={styles.buttonSecondary}>
            📋 Offerte genereren
          </button>
          <button style={styles.button}>
            📧 Deel met team
          </button>
          <button style={{ ...styles.button, background: "#10b981" }}>
            ✅ Uitvoeringsplan maken
          </button>
        </div>
      </div>
    </div>
  );
}
