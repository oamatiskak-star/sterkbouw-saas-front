<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Financieel Bouwmanagement</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
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
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <i class="fas fa-chart-line"></i>
                    <div>
                        <h1>AI <span>Financieel</span> Dashboard</h1>
                        <p>Real-time cashflow monitoring & projectoptimalisatie</p>
                    </div>
                </div>
                <div class="header-stats">
                    <div class="stat-item">
                        <div class="stat-label">Huidige Cashflow</div>
                        <div class="stat-value">€ 248.500</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Actieve Projecten</div>
                        <div class="stat-value">7</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">AI Waarschuwingen</div>
                        <div class="stat-value" style="color: var(--warning);">3</div>
                    </div>
                </div>
            </div>
        </div>
    </header>
    
    <div class="container">
        <div class="dashboard">
            <aside class="sidebar">
                <ul class="nav-menu">
                    <li><a href="#" class="active"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                    <li><a href="#"><i class="fas fa-cash-register"></i> Cashflow Overzicht</a></li>
                    <li><a href="#"><i class="fas fa-project-diagram"></i> Project Financiën</a></li>
                    <li><a href="#"><i class="fas fa-robot"></i> AI Analyse & Advies</a></li>
                    <li><a href="#"><i class="fas fa-chart-bar"></i> Prognoses & Scenarios</a></li>
                    <li><a href="#"><i class="fas fa-calendar-alt"></i> Planning Integratie</a></li>
                    <li><a href="#"><i class="fas fa-file-invoice-dollar"></i> Facturatie</a></li>
                    <li><a href="#"><i class="fas fa-balance-scale"></i> Kosten/Baten Analyse</a></li>
                    <li><a href="#"><i class="fas fa-bell"></i> Meldingen</a></li>
                    <li><a href="#"><i class="fas fa-cog"></i> Instellingen</a></li>
                </ul>
                
                <div class="project-selector">
                    <h3><i class="fas fa-list-ol"></i> Projecten</h3>
                    <ul class="project-list">
                        <li style="border-left-color: var(--success);">
                            <div>
                                <div><strong>De Veranda</strong></div>
                                <div class="text-small">Amsterdam | BN-2023-045</div>
                            </div>
                            <span class="status" style="background-color: rgba(39, 174, 96, 0.1); color: var(--success);">+€ 42K</span>
                        </li>
                        <li style="border-left-color: var(--warning);">
                            <div>
                                <div><strong>Stadshoeve</strong></div>
                                <div class="text-small">Utrecht | BN-2023-046</div>
                            </div>
                            <span class="status" style="background-color: rgba(243, 156, 18, 0.1); color: var(--warning);">-€ 18K</span>
                        </li>
                        <li style="border-left-color: var(--success);">
                            <div>
                                <div><strong>Waterspiegel</strong></div>
                                <div class="text-small">Rotterdam | BN-2023-047</div>
                            </div>
                            <span class="status" style="background-color: rgba(39, 174, 96, 0.1); color: var(--success);">+€ 65K</span>
                        </li>
                        <li style="border-left-color: var(--danger);">
                            <div>
                                <div><strong>Zonnewende</strong></div>
                                <div class="text-small">Den Haag | BN-2023-048</div>
                            </div>
                            <span class="status" style="background-color: rgba(231, 76, 60, 0.1); color: var(--danger);">-€ 32K</span>
                        </li>
                        <li style="border-left-color: var(--warning);">
                            <div>
                                <div><strong>Groene Long</strong></div>
                                <div class="text-small">Eindhoven | BN-2023-049</div>
                            </div>
                            <span class="status" style="background-color: rgba(243, 156, 18, 0.1); color: var(--warning);">-€ 12K</span>
                        </li>
                    </ul>
                </div>
            </aside>
            
            <main class="main-content">
                <!-- Financial Overview -->
                <section class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-chart-pie"></i> Financieel Overzicht</h2>
                        <div class="ai-badge"><i class="fas fa-robot"></i> Live monitoring</div>
                    </div>
                    
                    <div class="financial-overview">
                        <div class="financial-card income">
                            <h3>TOTALE INKOMSTEN</h3>
                            <div class="value">€ 2.450.850</div>
                            <div class="trend positive">
                                <i class="fas fa-arrow-up"></i>
                                <span>+12% t.o.v. vorige maand</span>
                            </div>
                        </div>
                        
                        <div class="financial-card expenses">
                            <h3>TOTALE UITGAVEN</h3>
                            <div class="value">€ 2.202.350</div>
                            <div class="trend negative">
                                <i class="fas fa-arrow-up"></i>
                                <span>+8% t.o.v. vorige maand</span>
                            </div>
                        </div>
                        
                        <div class="financial-card cashflow">
                            <h3>NETTO CASHFLOW</h3>
                            <div class="value">€ 248.500</div>
                            <div class="trend positive">
                                <i class="fas fa-arrow-up"></i>
                                <span>+€ 45K t.o.v. vorige maand</span>
                            </div>
                        </div>
                        
                        <div class="financial-card projects">
                            <h3>GEM. PROJECT MARGES</h3>
                            <div class="value">14.2%</div>
                            <div class="trend positive">
                                <i class="fas fa-arrow-up"></i>
                                <span>+2.1% t.o.v. target</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="cashflowChart"></canvas>
                    </div>
                </section>
                
                <!-- AI Analysis & Recommendations -->
                <section class="card ai-analysis">
                    <div class="card-header">
                        <h2><i class="fas fa-robot"></i> AI Financiële Analyse & Advies</h2>
                        <div class="ai-badge"><i class="fas fa-bolt"></i> Real-time</div>
                    </div>
                    
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>
                            <strong>WAARSCHUWING:</strong> Project "Zonnewende" heeft een negatieve cashflow van € 32.000. AI adviseert: uitstel betalingen leveranciers waar mogelijk en versnellen oplevering fase 2 voor betaling.
                        </div>
                    </div>
                    
                    <div class="alert alert-warning">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>TIMMINGSADVIES:</strong> Voor optimalisatie cashflow adviseert AI om bouwdelen in "Stadshoeve" 2 weken naar voren te halen en in "Groene Long" 1 week naar achteren. Dit verbetert maandelijkse cashflow met € 28.500.
                        </div>
                    </div>
                    
                    <div class="ai-recommendations">
                        <div class="recommendation-card priority-high">
                            <h3><i class="fas fa-exclamation-circle"></i> Hoge Prioriteit</h3>
                            <p><strong>Facturatie vertraging:</strong> 3 facturen totaal € 87.500 zijn 15+ dagen overtijd. AI adviseert direct opvolging.</p>
                            <div class="btn-group">
                                <button class="btn btn-primary btn-sm">Facturen Bekijken</button>
                                <button class="btn btn-secondary btn-sm">Herinnering Sturen</button>
                            </div>
                        </div>
                        
                        <div class="recommendation-card priority-medium">
                            <h3><i class="fas fa-clock"></i> Planning Aanpassing</h3>
                            <p><strong>Materiaalaankoop optimalisatie:</strong> Bundel aankopen voor project 046 en 049 voor 12% korting. Besparing: € 15.600.</p>
                            <div class="btn-group">
                                <button class="btn btn-primary btn-sm">Bekijk Voorstel</button>
                            </div>
                        </div>
                        
                        <div class="recommendation-card priority-low">
                            <h3><i class="fas fa-chart-line"></i> Groei Mogelijkheid</h3>
                            <p><strong>Cashflow ruimte:</strong> Huidige positie laat toe nieuw project (max € 350K) te starten zonder financiering.</p>
                            <div class="btn-group">
                                <button class="btn btn-primary btn-sm">Scenario's Bekijken</button>
                            </div>
                        </div>
                        
                        <div class="recommendation-card priority-medium">
                            <h3><i class="fas fa-balance-scale"></i> Risico Beperking</h3>
                            <p><strong>Leveranciers afhankelijkheid:</strong> 42% materiaalkosten bij 1 leverancier. AI adviseert diversificatie.</p>
                            <div class="btn-group">
                                <button class="btn btn-primary btn-sm">Leveranciers Overzicht</button>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Cashflow Projections & Project Optimization -->
                <div class="project-optimization">
                    <!-- Cashflow Projections -->
                    <section class="card">
                        <div class="card-header">
                            <h2><i class="fas fa-chart-line"></i> Cashflow Prognose 12 Maanden</h2>
                            <div class="ai-badge"><i class="fas fa-magic"></i> AI Projectie</div>
                        </div>
                        
                        <div class="chart-container">
                            <canvas id="projectionChart"></canvas>
                        </div>
                        
                        <div class="alert alert-info">
                            <i class="fas fa-lightbulb"></i>
                            <div>
                                <strong>AI INSIGHT:</strong> Op basis van historische data en huidige projecten voorspelt AI een positieve cashflow van € 450K-€ 520K voor komend kwartaal.
                            </div>
                        </div>
                    </section>
                    
                    <!-- Project Optimization -->
                    <section class="card">
                        <div class="card-header">
                            <h2><i class="fas fa-cogs"></i> Project Optimalisatie</h2>
                            <div class="ai-badge"><i class="fas fa-brain"></i> AI Aanbeveling</div>
                        </div>
                        
                        <div class="optimization-card">
                            <h3><i class="fas fa-forward"></i> Versnellen</h3>
                            <p><strong>Project Waterspiegel (BN-047):</strong> Fase 3 oplevering naar voren halen met 10 dagen. Verbetert Q2 cashflow met € 85.000.</p>
                            <p><strong>Impact:</strong> +€ 85K cashflow, +2% marge</p>
                        </div>
                        
                        <div class="optimization-card">
                            <h3><i class="fas fa-pause"></i> Vertragen</h3>
                            <p><strong>Project Groene Long (BN-049):</strong> Materiaalaankoop 2 weken uitstellen. Bespaart directe uitgave € 42.000.</p>
                            <p><strong>Impact:</strong> +€ 42K cashflow, neutrale marge impact</p>
                        </div>
                        
                        <div class="btn-group">
                            <button class="btn btn-primary"><i class="fas fa-calendar-alt"></i> Pas Planning Aan</button>
                            <button class="btn btn-secondary"><i class="fas fa-calculator"></i> Gedetailleerde Analyse</button>
                        </div>
                    </section>
                </div>
                
                <!-- Detailed Cashflow Table -->
                <section class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-table"></i> Cashflow per Project</h2>
                        <div class="ai-badge"><i class="fas fa-filter"></i> Gefilterd op Risico</div>
                    </div>
                    
                    <table class="cashflow-table">
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
                                <td class="positive">€ 65.000</td>
                                <td><span class="status" style="background-color: rgba(39, 174, 96, 0.1); color: var(--success); padding: 5px 10px; border-radius: 4px;">Optimale Cashflow</span></td>
                                <td><button class="btn btn-primary btn-sm">Versnellen</button></td>
                            </tr>
                            <tr>
                                <td><strong>De Veranda</strong></td>
                                <td>BN-2023-045</td>
                                <td>€ 280.000</td>
                                <td>€ 238.000</td>
                                <td class="positive">€ 42.000</td>
                                <td><span class="status" style="background-color: rgba(39, 174, 96, 0.1); color: var(--success); padding: 5px 10px; border-radius: 4px;">Goed</span></td>
                                <td><button class="btn btn-secondary btn-sm">Monitoring</button></td>
                            </tr>
                            <tr>
                                <td><strong>Stadshoeve</strong></td>
                                <td>BN-2023-046</td>
                                <td>€ 195.000</td>
                                <td>€ 213.000</td>
                                <td class="negative">-€ 18.000</td>
                                <td><span class="status" style="background-color: rgba(243, 156, 18, 0.1); color: var(--warning); padding: 5px 10px; border-radius: 4px;">Risico</span></td>
                                <td><button class="btn btn-primary btn-sm">Bijsturen</button></td>
                            </tr>
                            <tr>
                                <td><strong>Zonnewende</strong></td>
                                <td>BN-2023-048</td>
                                <td>€ 310.000</td>
                                <td>€ 342.000</td>
                                <td class="negative">-€ 32.000</td>
                                <td><span class="status" style="background-color: rgba(231, 76, 60, 0.1); color: var(--danger); padding: 5px 10px; border-radius: 4px;">Kritiek</span></td>
                                <td><button class="btn btn-primary btn-sm">Actie Vereist</button></td>
                            </tr>
                            <tr>
                                <td><strong>Groene Long</strong></td>
                                <td>BN-2023-049</td>
                                <td>€ 175.000</td>
                                <td>€ 187.000</td>
                                <td class="negative">-€ 12.000</td>
                                <td><span class="status" style="background-color: rgba(243, 156, 18, 0.1); color: var(--warning); padding: 5px 10px; border-radius: 4px;">Risico</span></td>
                                <td><button class="btn btn-primary btn-sm">Vertragen</button></td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Cashflow Chart
            const cashflowCtx = document.getElementById('cashflowChart').getContext('2d');
            const cashflowChart = new Chart(cashflowCtx, {
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
            
            // Projection Chart
            const projectionCtx = document.getElementById('projectionChart').getContext('2d');
            const projectionChart = new Chart(projectionCtx, {
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
            
            // Project selection
            const projectItems = document.querySelectorAll('.project-list li');
            projectItems.forEach(item => {
                item.addEventListener('click', function() {
                    projectItems.forEach(i => i.style.backgroundColor = '#f8f9fa');
                    this.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                    
                    const projectName = this.querySelector('strong').textContent;
                    const projectNumber = this.querySelector('.text-small').textContent.split(' | ')[1];
                    
                    // In een echte implementatie zou hier een API call komen
                    // om de project-specifieke data te laden
                    alert(`Project ${projectName} (${projectNumber}) geselecteerd. AI laadt nu de specifieke financiële data en analyses.`);
                });
            });
            
            // AI Recommendation buttons
            const aiButtons = document.querySelectorAll('.btn-primary');
            aiButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const card = this.closest('.recommendation-card, .optimization-card');
                    if(card) {
                        const title = card.querySelector('h3').textContent;
                        alert(`AI start nu actie voor: "${title}". In een volledige implementatie zou dit de planning automatisch aanpassen of facturatieprocessen starten.`);
                    }
                });
            });
            
            // Simuleer real-time AI updates
            setInterval(() => {
                const aiBadge = document.querySelector('.ai-analysis .ai-badge');
                if(aiBadge) {
                    aiBadge.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Analyseert...';
                    
                    setTimeout(() => {
                        aiBadge.innerHTML = '<i class="fas fa-bolt"></i> Real-time';
                    }, 1500);
                }
            }, 30000);
        });
    </script>
</body>
</html>
