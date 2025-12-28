import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const BouwplaatsApp = () => {
  const [uploadedPhotos, setUploadedPhotos] = useState([
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  ]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('Op basis van je vorige vraag over waterdichte afwerking, raad ik aan om eerst de ondergrond grondig te reinigen en vervolgens de voorgeschreven primer aan te brengen. Laat dit 2 uur drogen voor de volgende stap.');

  const handleAiQuestion = () => {
    if (aiQuestion.trim()) {
      setAiResponse(`AI antwoord: Bedankt voor je vraag over "${aiQuestion}". Ik analyseer dit nu en geef je gedetailleerde instructies. Voor dit onderwerp raad ik aan om eerst de materiaalspecificaties te controleren en vervolgens de stappen in de bouwtekening te volgen. Controleer ook of alle benodigde materialen aanwezig zijn.`);
      setAiQuestion('');
    }
  };

  const handleUploadClick = () => {
    alert('In een volledige implementatie zou hier een bestandsupload venster openen. De AI zou de foto direct analyseren voor problemen en veiligheid.');
  };

  const handleBimGenerate = () => {
    alert('AI genereert nu een gedetailleerde BIM-tekening voor het gerapporteerde probleem. De tekening wordt direct naar je tablet gestuurd en is over 2 minuten beschikbaar.');
  };

  const handleDeliveryVerify = () => {
    alert('AI start nu de verificatie van de levering. Gebruik de tabletcamera om de QR-codes op de materialen te scannen. AI vergelijkt dit met de bestelling en geeft direct aan of er iets ontbreekt.');
  };

  return (
    <>
      <Head>
        <title>AI Bouwplaats Management</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-hard-hat"></i>
              <h1>AI Bouwplaats Management</h1>
            </div>
            <div className="user-info">
              <div>
                <p>Welkom, <strong>Jan Visser</strong></p>
                <p>Bouwplaats: <strong>De Veranda - Amsterdam</strong></p>
              </div>
              <div className="user-avatar">JV</div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container">
        <div className="dashboard">
          <aside className="sidebar">
            <ul className="nav-menu">
              <li><a href="#" className="active"><i className="fas fa-calendar-day"></i> Dagelijkse Planning</a></li>
              <li><a href="#"><i className="fas fa-robot"></i> AI Assistent</a></li>
              <li><a href="#"><i className="fas fa-camera"></i> Foto Upload</a></li>
              <li><a href="#"><i className="fas fa-clipboard-check"></i> Opleverlijsten</a></li>
              <li><a href="#"><i className="fas fa-drafting-compass"></i> BIM Module</a></li>
              <li><a href="#"><i className="fas fa-truck-loading"></i> Leveringen</a></li>
              <li><a href="#"><i className="fas fa-shield-alt"></i> Veiligheid</a></li>
              <li><a href="#"><i className="fas fa-chart-line"></i> Bouwproces</a></li>
            </ul>
            
            <div className="bouw-nummers">
              <h3><i className="fas fa-list-ol"></i> Bouwnummers</h3>
              <ul className="bouw-list">
                <li>BN-2023-045 <span className="status completed">Voltooid</span></li>
                <li>BN-2023-046 <span className="status in-progress">Bezig</span></li>
                <li>BN-2023-047 <span className="status in-progress">Bezig</span></li>
                <li>BN-2023-048 <span className="status pending">In planning</span></li>
                <li>BN-2023-049 <span className="status pending">In planning</span></li>
              </ul>
            </div>
          </aside>
          
          <main className="main-content">
            {/* Daily Planning Card */}
            <section className="card">
              <div className="card-header">
                <h2><i className="fas fa-calendar-day"></i> Dagelijkse Planning</h2>
                <div className="ai-badge"><i className="fas fa-robot"></i> AI-gegenereerd</div>
              </div>
              
              <ul className="planning-list">
                <li>
                  <div className="planning-time">08:00 - 10:30</div>
                  <div className="planning-task">Fundering afwerken bouwnummer 046</div>
                  <div><span className="status in-progress">Bezig</span></div>
                </li>
                <li>
                  <div className="planning-time">10:30 - 12:00</div>
                  <div className="planning-task">Beton storten kelder bouwnummer 047</div>
                  <div><span className="status pending">Volgende</span></div>
                </li>
                <li>
                  <div className="planning-time">13:00 - 14:30</div>
                  <div className="planning-task">Spouwmuur bouwnummer 046 controleren</div>
                  <div><span className="status pending">Later vandaag</span></div>
                </li>
                <li>
                  <div className="planning-time">14:30 - 16:00</div>
                  <div className="planning-task">Kozijnen plaatsen bouwnummer 047</div>
                  <div><span className="status pending">Later vandaag</span></div>
                </li>
              </ul>
            </section>
            
            {/* AI Assistant Card */}
            <section className="card ai-assistant">
              <div className="card-header">
                <h2><i className="fas fa-robot"></i> AI Bouw Assistent</h2>
                <div className="ai-badge"><i className="fas fa-bolt"></i> Live</div>
              </div>
              
              <p>Stel hier je vraag als je vastloopt. De AI analyseert je vraag en geeft gedetailleerde instructies.</p>
              
              <div className="ai-input-area">
                <input 
                  type="text" 
                  className="ai-input" 
                  placeholder="Bijv: Hoe plaats ik een deursponning volgens de nieuwste normen?"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiQuestion()}
                />
                <button className="btn btn-primary" onClick={handleAiQuestion}>
                  <i className="fas fa-paper-plane"></i> Vraag AI
                </button>
              </div>
              
              <div className="ai-response">
                <p><strong>AI antwoord:</strong> {aiResponse}</p>
              </div>
            </section>
            
            {/* Photo Upload & Analysis */}
            <section className="card">
              <div className="card-header">
                <h2><i className="fas fa-camera"></i> Foto Upload & AI Analyse</h2>
                <div className="ai-badge"><i className="fas fa-eye"></i> Monitort veiligheid</div>
              </div>
              
              <p>Upload een foto van een probleem. AI analyseert de foto en geeft een oplossing. <strong>Let op:</strong> AI controleert ook op veiligheidsvoorschriften en VCA-normen.</p>
              
              <div className="upload-area" onClick={handleUploadClick}>
                <div className="upload-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <p>Sleep je foto hierheen of klik om te uploaden</p>
                <p className="text-muted">Max. bestandsgrootte: 10MB (JPEG, PNG)</p>
              </div>
              
              <div className="photo-preview">
                {uploadedPhotos.map((photo, index) => (
                  <img key={index} src={photo} alt={`Bouwplaats foto ${index + 1}`} />
                ))}
              </div>
              
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i>
                <div>
                  <strong>Veiligheidscheck geslaagd:</strong> AI heeft geüploade foto&apos;s geanalyseerd en geconstateerd dat alle medewerkers veiligheidshelmen dragen en de juiste PBM&apos;s gebruiken.
                </div>
              </div>
            </section>
            
            {/* Deliveries & BIM */}
            <div className="delivery-bim-container">
              {/* Deliveries Card */}
              <section className="card">
                <div className="card-header">
                  <h2><i className="fas fa-truck-loading"></i> Leveringen Vandaag</h2>
                  <div className="ai-badge"><i className="fas fa-bell"></i> AI Waarschuwing</div>
                </div>
                
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div>
                    <strong>Verwachte levering: 14:30</strong><br />
                    500 stuks bakstenen (type Waalformat) - Locatie: Hoek zuidzijde terrein
                  </div>
                </div>
                
                <div className="alert alert-success">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <strong>Levering ontvangen: 09:15</strong><br />
                    40 zakken cement (25kg) - Volledig geleverd en gecontroleerd door AI
                  </div>
                </div>
                
                <button className="btn btn-secondary" style={{width: '100%', marginTop: '15px'}} onClick={handleDeliveryVerify}>
                  <i className="fas fa-clipboard-check"></i> Levering Verifiëren
                </button>
              </section>
              
              {/* BIM Module Card */}
              <section className="card bim-module">
                <div className="card-header">
                  <h2><i className="fas fa-drafting-compass"></i> BIM Module</h2>
                  <div className="ai-badge"><i className="fas fa-magic"></i> Automatisch</div>
                </div>
                
                <p>Geen tekening van een probleem? AI genereert direct een gedetailleerde tekening met de BIM-module.</p>
                
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-circle"></i>
                  <div>
                    <strong>Probleem gemeld:</strong> Afwijking in muurplaat bouwnummer 047. 
                  </div>
                </div>
                
                <div className="bim-actions">
                  <button className="btn btn-primary" onClick={handleBimGenerate}>
                    <i className="fas fa-drafting-compass"></i> Genereer BIM Tekening
                  </button>
                  <button className="btn btn-secondary">
                    <i className="fas fa-download"></i> Download PDF
                  </button>
                </div>
              </section>
            </div>
            
            {/* Completion Lists */}
            <section className="card">
              <div className="card-header">
                <h2><i className="fas fa-clipboard-check"></i> Opleverlijst Bouwnummer 046</h2>
                <div className="ai-badge"><i className="fas fa-list-check"></i> AI Bijgewerkt</div>
              </div>
              
              <p>AI houdt het bouwproces bij en toont exact wat er nog moet gebeuren voor oplevering.</p>
              
              <ul className="planning-list">
                <li>
                  <div style={{flexGrow: 1}}>Electra installatie keuken</div>
                  <div><span className="status completed">Voltooid</span></div>
                </li>
                <li>
                  <div style={{flexGrow: 1}}>Sanitair plaatsen badkamer</div>
                  <div><span className="status completed">Voltooid</span></div>
                </li>
                <li>
                  <div style={{flexGrow: 1}}>Binnenkozijnen afwerken</div>
                  <div><span className="status in-progress">Bezig (2/5)</span></div>
                </li>
                <li>
                  <div style={{flexGrow: 1}}>Vloer afwerking woonkamer</div>
                  <div><span className="status pending">Nog beginnen</span></div>
                </li>
                <li>
                  <div style={{flexGrow: 1}}>Schilderwerk slaapkamer 2</div>
                  <div><span className="status pending">Nog beginnen</span></div>
                </li>
              </ul>
            </section>
          </main>
        </div>
      </div>

      <style jsx global>{`
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
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background-color: #f5f7fa;
          color: var(--dark);
          line-height: 1.6;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* Header */
        header {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
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
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: white;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
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
          background-color: rgba(26, 95, 122, 0.1);
          color: var(--primary);
        }
        
        .nav-menu i {
          width: 20px;
          text-align: center;
        }
        
        .bouw-nummers {
          margin-top: 20px;
        }
        
        .bouw-nummers h3 {
          margin-bottom: 15px;
          color: var(--primary);
          font-size: 1.2rem;
        }
        
        .bouw-list {
          list-style: none;
        }
        
        .bouw-list li {
          padding: 10px 15px;
          background-color: #f8f9fa;
          margin-bottom: 8px;
          border-radius: 6px;
          border-left: 4px solid var(--secondary);
          display: flex;
          justify-content: space-between;
        }
        
        .bouw-list .status {
          font-size: 0.8rem;
          padding: 3px 8px;
          border-radius: 4px;
        }
        
        .status.completed {
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success);
        }
        
        .status.in-progress {
          background-color: rgba(255, 193, 7, 0.1);
          color: var(--warning);
        }
        
        .status.pending {
          background-color: rgba(108, 117, 125, 0.1);
          color: var(--gray);
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
        }
        
        .card-header h2 {
          color: var(--primary);
          font-size: 1.5rem;
        }
        
        .ai-badge {
          background-color: rgba(87, 197, 182, 0.2);
          color: var(--secondary);
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        /* Daily Planning */
        .planning-list {
          list-style: none;
        }
        
        .planning-list li {
          padding: 15px;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .planning-list li:last-child {
          border-bottom: none;
        }
        
        .planning-time {
          background-color: #f8f9fa;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: bold;
          min-width: 100px;
        }
        
        .planning-task {
          flex-grow: 1;
        }
        
        /* AI Assistant */
        .ai-assistant {
          background-color: rgba(87, 197, 182, 0.05);
          border-left: 4px solid var(--secondary);
        }
        
        .ai-input-area {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .ai-input {
          flex-grow: 1;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }
        
        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
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
          background-color: #144b60;
        }
        
        .btn-secondary {
          background-color: var(--secondary);
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #45a99a;
        }
        
        .ai-response {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 15px;
          border-left: 4px solid var(--primary);
        }
        
        /* Upload Section */
        .upload-area {
          border: 2px dashed var(--secondary);
          border-radius: 10px;
          padding: 40px 20px;
          text-align: center;
          margin-bottom: 20px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .upload-area:hover {
          background-color: rgba(87, 197, 182, 0.05);
        }
        
        .upload-icon {
          font-size: 3rem;
          color: var(--secondary);
          margin-bottom: 15px;
        }
        
        .photo-preview {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin-top: 20px;
        }
        
        .photo-preview img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
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
          background-color: rgba(255, 193, 7, 0.1);
          border-left: 4px solid var(--warning);
        }
        
        .alert-success {
          background-color: rgba(40, 167, 69, 0.1);
          border-left: 4px solid var(--success);
        }
        
        .alert-danger {
          background-color: rgba(242, 76, 61, 0.1);
          border-left: 4px solid var(--accent);
        }
        
        /* BIM Module */
        .bim-module {
          background-color: rgba(26, 95, 122, 0.05);
          border-left: 4px solid var(--primary);
        }
        
        .bim-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .delivery-bim-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
          .dashboard {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            order: 2;
          }
          
          .delivery-bim-container {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .ai-input-area {
            flex-direction: column;
          }
          
          .bim-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};
