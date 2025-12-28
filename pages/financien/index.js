import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Chart, registerables } from 'chart.js';

// Registreer alle Chart.js componenten
Chart.register(...registerables);

const FinancienDashboard = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const cashflowChartRef = useRef(null);
  const projectionChartRef = useRef(null);
  const cashflowChartInstance = useRef(null);
  const projectionChartInstance = useRef(null);

  // Project data
  const projects = [
    { id: 1, name: "De Veranda", number: "BN-2023-045", location: "Amsterdam", cashflow: 42000, status: "positive", color: "success" },
    { id: 2, name: "Stadshoeve", number: "BN-2023-046", location: "Utrecht", cashflow: -18000, status: "warning", color: "warning" },
    { id: 3, name: "Waterspiegel", number: "BN-2023-047", location: "Rotterdam", cashflow: 65000, status: "positive", color: "success" },
    { id: 4, name: "Zonnewende", number: "BN-2023-048", location: "Den Haag", cashflow: -32000, status: "negative", color: "danger" },
    { id: 5, name: "Groene Long", number: "BN-2023-049", location: "Eindhoven", cashflow: -12000, status: "warning", color: "warning" },
  ];

  // Initialiseer charts
  useEffect(() => {
    if (typeof window === 'undefined') return; // Voorkom SSR issues

    // Destroy bestaande charts
    if (cashflowChartInstance.current) {
      cashflowChartInstance.current.destroy();
    }
    if (projectionChartInstance.current) {
      projectionChartInstance.current.destroy();
    }

    // Cashflow Chart
    const cashflowCtx = cashflowChartRef.current?.getContext('2d');
    if (cashflowCtx) {
      cashflowChartInstance.current = new Chart(cashflowCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
          datasets: [{
            label: 'Inkomsten',
            data: [185, 192, 210, 205, 220, 245, 230, 240, 255, 250, 265, 280],
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            fill: true,
            tension: 0.4
          }, {
            label: 'Uitgaven',
            data: [165, 175, 190, 185, 195, 220, 205, 215, 230, 225, 240, 250],
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            fill: true,
            tension: 0.4
          }, {
            label: 'Netto Cashflow',
            data: [20, 17, 20, 20, 25, 25, 25, 25, 25, 25, 25, 30],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Maandelijkse Cashflow (x €1.000)',
              font: {
                size: 16
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Bedrag (x €1.000)'
              }
            }
          }
        }
      });
    }

    // Projection Chart
    const projectionCtx = projectionChartRef.current?.getContext('2d');
    if (projectionCtx) {
      projectionChartInstance.current = new Chart(projectionCtx, {
        type: 'bar',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [{
            label: 'Pessimistische Prognose',
            data: [40, 45, 42, 38],
            backgroundColor: 'rgba(231, 76, 60, 0.7)',
          }, {
            label: 'Realistische Prognose',
            data: [55, 62, 58, 65],
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
          }, {
            label: 'Optimistische Prognose',
            data: [65, 72, 68, 75],
            backgroundColor: 'rgba(39, 174, 96, 0.7)',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Cashflow Prognose per Kwartaal (x €10.000)',
              font: {
                size: 16
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Netto Cashflow (x €10.000)'
              }
            }
          }
        }
      });
    }

    // Cleanup functie
    return () => {
      if (cashflowChartInstance.current) {
        cashflowChartInstance.current.destroy();
      }
      if (projectionChartInstance.current) {
        projectionChartInstance.current.destroy();
      }
    };
  }, []);

  // Simuleer AI updates
  useEffect(() => {
    const interval = setInterval(() => {
      const aiBadge = document.querySelector('.ai-analysis .ai-badge');
      if (aiBadge) {
        aiBadge.innerHTML = '<i className="fas fa-sync-alt fa-spin"></i> Analyseert...';
        
        setTimeout(() => {
          aiBadge.innerHTML = '<i className="fas fa-bolt"></i> Real-time';
        }, 1500);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    alert(`Project ${project.name} (${project.number}) geselecteerd. AI laadt nu de specifieke financiële data en analyses.`);
  };

  const handleAiAction = (title) => {
    alert(`AI start nu actie voor: "${title}". In een volledige implementatie zou dit de planning automatisch aanpassen of facturatieprocessen starten.`);
  };

  const handleOptimization = (action) => {
    alert(`AI past nu de planning aan om ${action}. De nieuwe planning wordt direct gesynchroniseerd met de bouwplaats.`);
  };

  return (
    <>
      <Head>
        <title>AI Financieel Bouwmanagement</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-chart-line"></i>
              <div>
                <h1>AI <span>Financieel</span> Dashboard</h1>
                <p>Real-time cashflow monitoring & projectoptimalisatie</p>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-label">Huidige Cashflow</div>
                <div className="stat-value">€ 248.500</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Actieve Projecten</div>
                <div className="stat-value">7</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">AI Waarschuwingen</div>
                <div className="stat-value" style={{ color: '#f39c12' }}>3</div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container">
        <div className="dashboard">
          <aside className="sidebar">
            <ul className="nav-menu">
              <li><a href="#" className="active"><i className="fas fa-tachometer-alt"></i> Dashboard</a></li>
              <li><a href="#"><i className="fas fa-cash-register"></i> Cashflow Overzicht</a></li>
              <li><a href="#"><i className="fas fa-project-diagram"></i> Project Financiën</a></li>
              <li><a href="#"><i className="fas fa-robot"></i> AI Analyse & Advies</a></li>
              <li><a href="#"><i className="fas fa-chart-bar"></i> Prognoses & Scenarios</a></li>
              <li><a href="#"><i className="fas fa-calendar-alt"></i> Planning Integratie</a></li>
              <li><a href="#"><i className="fas fa-file-invoice-dollar"></i> Facturatie</a></li>
              <li><a href="#"><i className="fas fa-balance-scale"></i> Kosten/Baten Analyse</a></li>
              <li><a href="#"><i className="fas fa-bell"></i> Meldingen</a></li>
              <li><a href="#"><i className="fas fa-cog"></i> Instellingen</a></li>
            </ul>
            
            <div className="project-selector">
              <h3><i className="fas fa-list-ol"></i> Projecten</h3>
              <ul className="project-list">
                {projects.map(project => (
                  <li 
                    key={project.id} 
                    style={{ borderLeftColor: `var(--${project.color})` }}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div>
                      <div><strong>{project.name}</strong></div>
                      <div className="text-small">{project.location} | {project.number}</div>
                    </div>
                    <span 
                      className="status" 
                      style={{ 
                        backgroundColor: `rgba(${project.color === 'success' ? '39, 174, 96' : project.color === 'warning' ? '243, 156, 18' : '231, 76, 60'}, 0.1)`, 
                        color: `var(--${project.color})` 
                      }}
                    >
                      {project.cashflow > 0 ? '+' : ''}€ {Math.abs(project.cashflow)/1000}K
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          
          <main className="main-content">
            {/* Financial Overview */}
            <section className="card">
              <div className="card-header">
                <h2><i className="fas fa-chart-pie"></i> Financieel Overzicht</h2>
                <div className="ai-badge"><i className="fas fa-robot"></i> Live monitoring</div>
              </div>
              
              <div className="financial-overview">
                <div className="financial-card income">
                  <h3>TOTALE INKOMSTEN</h3>
                  <div className="value">€ 2.450.850</div>
                  <div className="trend positive">
                    <i className="fas fa-arrow-up"></i>
                    <span>+12% t.o.v. vorige maand</span>
                  </div>
                </div>
                
                <div className="financial-card expenses">
                  <h3>TOTALE UITGAVEN</h3>
                  <div className="value">€ 2.202.350</div>
                  <div className="trend negative">
                    <i className="fas fa-arrow-up"></i>
                    <span>+8% t.o.v. vorige maand</span>
                  </div>
                </div>
                
                <div className="financial-card cashflow">
                  <h3>NETTO CASHFLOW</h3>
                  <div className="value">€ 248.500</div>
                  <div className="trend positive">
                    <i className="fas fa-arrow-up"></i>
                    <span>+€ 45K t.o.v. vorige maand</span>
                  </div>
                </div>
                
                <div className="financial-card projects">
                  <h3>GEM. PROJECT MARGES</h3>
                  <div className="value">14.2%</div>
                  <div className="trend positive">
                    <i className="fas fa-arrow-up"></i>
                    <span>+2.1% t.o.v. target</span>
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <canvas ref={cashflowChartRef}></canvas>
              </div>
            </section>
            
            {/* AI Analysis & Recommendations */}
            <section className="card ai-analysis">
              <div className="card-header">
                <h2><i className="fas fa-robot"></i> AI Financiële Analyse & Advies</h2>
                <div className="ai-badge"><i className="fas fa-bolt"></i> Real-time</div>
              </div>
              
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle"></i>
                <div>
                  <strong>WAARSCHUWING:</strong> Project &quot;Zonnewende&quot; heeft een negatieve cashflow van € 32.000. AI adviseert: uitstel betalingen leveranciers waar mogelijk en versnellen oplevering fase 2 voor betaling.
                </div>
              </div>
              
              <div className="alert alert-warning">
                <i className="fas fa-clock"></i>
                <div>
                  <strong>TIMMINGSADVIES:</strong> Voor optimalisatie cashflow adviseert AI om bouwdelen in &quot;Stadshoeve&quot; 2 weken naar voren te halen en in &quot;Groene Long&quot; 1 week naar achteren. Dit verbetert maandelijkse cashflow met € 28.500.
                </div>
              </div>
              
              <div className="ai-recommendations">
                <div className="recommendation-card priority-high">
                  <h3><i className="fas fa-exclamation-circle"></i> Hoge Prioriteit</h3>
                  <p><strong>Facturatie vertraging:</strong> 3 facturen totaal € 87.500 zijn 15+ dagen overtijd. AI adviseert direct opvolging.</p>
                  <div className="btn-group">
                    <button className="btn btn-primary btn-sm" onClick={() => handleAiAction('Facturatie vertraging')}>
                      Facturen Bekijken
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleAiAction('Herinnering sturen')}>
                      Herinnering Sturen
                    </button>
                  </div>
                </div>
                
                <div className="recommendation-card priority-medium">
                  <h3><i className="fas fa-clock"></i> Planning Aanpassing</h3>
                  <p><strong>Materiaalaankoop optimalisatie:</strong> Bundel aankopen voor project 046 en 049 voor 12% korting. Besparing: € 15.600.</p>
                  <div className="btn-group">
                    <button className="btn btn-primary btn-sm" onClick={() => handleAiAction('Materiaalaankoop optimalisatie')}>
                      Bekijk Voorstel
                    </button>
                  </div>
                </div>
                
                <div className="recommendation-card priority-low">
                  <h3><i className="fas fa-chart-line"></i> Groei Mogelijkheid</h3>
                  <p><strong>Cashflow ruimte:</strong> Huidige positie laat toe nieuw project (max € 350K) te starten zonder financiering.</p>
                  <div className="btn-group">
                    <button className="btn btn-primary btn-sm" onClick={() => handleAiAction('Groei mogelijkheden')}>
                      Scenario&apos;s Bekijken
                    </button>
                  </div>
                </div>
                
                <div className="recommendation-card priority-medium">
                  <h3><i className="fas fa-balance-scale"></i> Risico Beperking</h3>
                  <p><strong>Leveranciers afhankelijkheid:</strong> 42% materiaalkosten bij 1 leverancier. AI adviseert diversificatie.</p>
                  <div className="btn-group">
                    <button className="btn btn-primary btn-sm" onClick={() => handleAiAction('Leveranciers afhankelijkheid')}>
                      Leveranciers Overzicht
                    </button>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Cashflow Projections & Project Optimization */}
            <div className="project-optimization">
              {/* Cashflow Projections */}
              <section className="card">
                <div className="card-header">
                  <h2><i className="fas fa-chart-line"></i> Cashflow Prognose 12 Maanden</h2>
                  <div className="ai-badge"><i className="fas fa-magic"></i> AI Projectie</div>
                </div>
                
                <div className="chart-container">
                  <canvas ref={projectionChartRef}></canvas>
                </div>
                
                <div className="alert alert-info">
                  <i className="fas fa-lightbulb"></i>
                  <div>
                    <strong>AI INSIGHT:</strong> Op basis van historische data en huidige projecten voorspelt AI een positieve cashflow van € 450K-€ 520K voor komend kwartaal.
                  </div>
                </div>
              </section>
              
              {/* Project Optimization */}
              <section className="card">
                <div className="card-header">
                  <h2><i className="fas fa-cogs"></i> Project Optimalisatie</h2>
                  <div className="ai-badge"><i className="fas fa-brain"></i> AI Aanbeveling</div>
                </div>
                
                <div className="optimization-card">
                  <h3><i className="fas fa-forward"></i> Versnellen</h3>
                  <p><strong>Project Waterspiegel (BN-047):</strong> Fase 3 oplevering naar voren halen met 10 dagen. Verbetert Q2 cashflow met € 85.000.</p>
                  <p><strong>Impact:</strong> +€ 85K cashflow, +2% marge</p>
                </div>
                
                <div className="optimization-card">
                  <h3><i className="fas fa-pause"></i> Vertragen</h3>
                  <p><strong>Project Groene Long (BN-049):</strong> Materiaalaankoop 2 weken uitstellen. Bespaart directe uitgave € 42.000.</p>
                  <p><strong>Impact:</strong> +€ 42K cashflow, neutrale marge impact</p>
                </div>
                
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => handleOptimization('de planning aan te passen')}>
                    <i className="fas fa-calendar-alt"></i> Pas Planning Aan
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleAiAction('Gedetailleerde analyse')}>
                    <i className="fas fa-calculator"></i> Gedetailleerde Analyse
                  </button>
                </div>
              </section>
            </div>
            
            {/* Detailed Cashflow Table */}
            <section className="card">
              <div className="card-header">
                <h2><i className="fas fa-table"></i> Cashflow per Project</h2>
                <div className="ai-badge"><i className="fas fa-filter"></i> Gefilterd op Risico</div>
              </div>
              
              <table className="cashflow-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Bouwnummer</th>
                    <th>Inkomsten</th>
                    <th>Uitgaven</th>
                    <th>Netto</th>
                    <th>Status</th>
                    <th>AI Actie</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Waterspiegel</strong></td>
                    <td>BN-2023-047</td>
                    <td>€ 425.000</td>
                    <td>€ 360.000</td>
                    <td className="positive">€ 65.000</td>
                    <td><span className="status status-good">Optimale Cashflow</span></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => handleOptimization('Waterspiegel te versnellen')}>Versnellen</button></td>
                  </tr>
                  <tr>
                    <td><strong>De Veranda</strong></td>
                    <td>BN-2023-045</td>
                    <td>€ 280.000</td>
                    <td>€ 238.000</td>
                    <td className="positive">€ 42.000</td>
                    <td><span className="status status-good">Goed</span></td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => handleAiAction('De Veranda monitoring')}>Monitoring</button></td>
                  </tr>
                  <tr>
                    <td><strong>Stadshoeve</strong></td>
                    <td>BN-2023-046</td>
                    <td>€ 195.000</td>
                    <td>€ 213.000</td>
                    <td className="negative">-€ 18.000</td>
                    <td><span className="status status-warning">Risico</span></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => handleOptimization('Stadshoeve bij te sturen')}>Bijsturen</button></td>
                  </tr>
                  <tr>
                    <td><strong>Zonnewende</strong></td>
                    <td>BN-2023-048</td>
                    <td>€ 310.000</td>
                    <td>€ 342.000</td>
                    <td className="negative">-€ 32.000</td>
                    <td><span className="status status-danger">Kritiek</span></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => handleAiAction('Zonnewende actie vereist')}>Actie Vereist</button></td>
                  </tr>
                  <tr>
                    <td><strong>Groene Long</strong></td>
                    <td>BN-2023-049</td>
                    <td>€ 175.000</td>
                    <td>€ 187.000</td>
                    <td className="negative">-€ 12.000</td>
                    <td><span className="status status-warning">Risico</span></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => handleOptimization('Groene Long te vertragen')}>Vertragen</button></td>
                  </tr>
                </tbody>
              </table>
            </section>
          </main>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --primary: #2c3e50;
          --secondary: #3498db;
          --accent: #e74c3c;
          --success: #27ae60;
          --warning: #f39c12;
          --danger: #c0392b;
          --light: #ecf0f1;
          --dark: #2c3e50;
          --gray: #95a5a6;
          --finance-green: #2ecc71;
          --finance-red: #e74c3c;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background-color: #f8f9fa;
          color: var(--dark);
          line-height: 1.6;
        }
        
        .container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* Header */
        header {
          background: linear-gradient(135deg, var(--primary), #34495e);
          color: white;
          padding: 20px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 0 0 10px 10px;
          margin-bottom: 30px;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .logo i {
          font-size: 2.5rem;
        }
        
        .logo h1 {
          font-size: 1.8rem;
        }
        
        .logo span {
          color: var(--secondary);
        }
        
        .header-stats {
          display: flex;
          gap: 30px;
          text-align: center;
        }
        
        .stat-item {
          padding: 10px 20px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--secondary);
        }
        
        /* Main Layout */
        .dashboard {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 25px;
        }
        
        /* Sidebar */
        .sidebar {
          background-color: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          height: fit-content;
        }
        
        .nav-menu {
          list-style: none;
          margin-bottom: 30px;
        }
        
        .nav-menu li {
          margin-bottom: 10px;
        }
        
        .nav-menu a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          text-decoration: none;
          color: var(--dark);
          border-radius: 8px;
          transition: all 0.3s;
        }
        
        .nav-menu a:hover, .nav-menu a.active {
          background-color: rgba(52, 152, 219, 0.1);
          color: var(--secondary);
        }
        
        .nav-menu i {
          width: 20px;
          text-align: center;
        }
        
        .project-selector {
          margin-top: 20px;
        }
        
        .project-selector h3 {
          margin-bottom: 15px;
          color: var(--primary);
          font-size: 1.2rem;
        }
        
        .project-list {
          list-style: none;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .project-list li {
          padding: 12px 15px;
          background-color: #f8f9fa;
          margin-bottom: 8px;
          border-radius: 6px;
          border-left: 4px solid;
          display: flex;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .project-list li:hover {
          background-color: rgba(52, 152, 219, 0.1);
          transform: translateX(5px);
        }
        
        .project-list .status {
          font-size: 0.8rem;
          padding: 3px 8px;
          border-radius: 4px;
        }
        
        /* Main Content */
        .main-content {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        
        /* Cards */
        .card {
          background-color: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }
        
        .card-header h2 {
          color: var(--primary);
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .ai-badge {
          background-color: rgba(52, 152, 219, 0.2);
          color: var(--secondary);
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        /* Financial Overview */
        .financial-overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .financial-card {
          padding: 20px;
          border-radius: 8px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .financial-card.income {
          background: linear-gradient(135deg, var(--success), #2ecc71);
        }
        
        .financial-card.expenses {
          background: linear-gradient(135deg, var(--danger), #e74c3c);
        }
        
        .financial-card.cashflow {
          background: linear-gradient(135deg, var(--secondary), #3498db);
        }
        
        .financial-card.projects {
          background: linear-gradient(135deg, #9b59b6, #8e44ad);
        }
        
        .financial-card h3 {
          font-size: 1rem;
          margin-bottom: 10px;
          opacity: 0.9;
        }
        
        .financial-card .value {
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .financial-card .trend {
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .trend.positive {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .trend.negative {
          color: rgba(255, 255, 255, 0.9);
        }
        
        /* Charts */
        .chart-container {
          height: 300px;
          margin-top: 20px;
          position: relative;
        }
        
        /* AI Analysis */
        .ai-analysis {
          background-color: rgba(52, 152, 219, 0.05);
          border-left: 4px solid var(--secondary);
        }
        
        .ai-recommendations {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
        }
        
        .recommendation-card {
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          border-top: 4px solid;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
        }
        
        .recommendation-card.priority-high {
          border-top-color: var(--danger);
        }
        
        .recommendation-card.priority-medium {
          border-top-color: var(--warning);
        }
        
        .recommendation-card.priority-low {
          border-top-color: var(--success);
        }
        
        /* Cashflow Table */
        .cashflow-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .cashflow-table th, .cashflow-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .cashflow-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: var(--primary);
        }
        
        .cashflow-table tr:hover {
          background-color: #f8f9fa;
        }
        
        .cashflow-table .positive {
          color: var(--success);
          font-weight: bold;
        }
        
        .cashflow-table .negative {
          color: var(--danger);
          font-weight: bold;
        }
        
        .status-good {
          background-color: rgba(39, 174, 96, 0.1);
          color: var(--success);
          padding: 5px 10px;
          border-radius: 4px;
        }
        
        .status-warning {
          background-color: rgba(243, 156, 18, 0.1);
          color: var(--warning);
          padding: 5px 10px;
          border-radius: 4px;
        }
        
        .status-danger {
          background-color: rgba(231, 76, 60, 0.1);
          color: var(--danger);
          padding: 5px 10px;
          border-radius: 4px;
        }
        
        /* Project Optimization */
        .project-optimization {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
        }
        
        .optimization-card {
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
        }
        
        .optimization-card h3 {
          margin-bottom: 15px;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        /* Buttons */
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-primary {
          background-color: var(--primary);
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #1a252f;
        }
        
        .btn-secondary {
          background-color: var(--secondary);
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #2980b9;
        }
        
        .btn-sm {
          padding: 5px 10px;
          font-size: 0.9rem;
        }
        
        .btn-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        /* Alerts */
        .alert {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .alert-warning {
          background-color: rgba(243, 156, 18, 0.1);
          border-left: 4px solid var(--warning);
        }
        
        .alert-success {
          background-color: rgba(39, 174, 96, 0.1);
          border-left: 4px solid var(--success);
        }
        
        .alert-danger {
          background-color: rgba(231, 76, 60, 0.1);
          border-left: 4px solid var(--danger);
        }
        
        .alert-info {
          background-color: rgba(52, 152, 219, 0.1);
          border-left: 4px solid var(--secondary);
        }
        
        .text-small {
          font-size: 0.9rem;
          color: var(--gray);
        }
        
        .text-muted {
          color: var(--gray);
        }
        
        /* Responsive */
        @media (max-width: 1400px) {
          .financial-overview {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .ai-recommendations {
            grid-template-columns: 1fr;
          }
          
          .project-optimization {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 1200px) {
          .dashboard {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            order: 2;
          }
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .header-stats {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .financial-overview {
            grid-template-columns: 1fr;
          }
          
          .btn-group {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};
export default FinancienDashboard;
