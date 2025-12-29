import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const BouwplaatsApp = () => {
  const [uploadedPhotos, setUploadedPhotos] = useState([
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  ]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('Op basis van je vorige vraag over waterdichte afwerking, raad ik aan om eerst de ondergrond grondig te reinigen en vervolgens de voorgeschreven primer aan te brengen. Laat dit 2 uur drogen voor de volgende stap.');
  
  // Nieuwe state voor AI Inspecteur
  const [inspectionMode, setInspectionMode] = useState('veiligheid'); // veiligheid, kwaliteit, voortgang
  const [activeInspections, setActiveInspections] = useState([
    { id: 1, type: 'veiligheid', title: 'Veiligheidshelm controle', status: 'afgerond', points: 5, maxPoints: 5 },
    { id: 2, type: 'kwaliteit', title: 'Metselwerk controle', status: 'inspecteren', points: 3, maxPoints: 10 },
    { id: 3, type: 'voortgang', title: 'Fundering voortgang', status: 'afgerond', points: 8, maxPoints: 8 },
  ]);
  
  const [constructionIssues, setConstructionIssues] = useState([
    { id: 1, title: 'Onjuiste montage kozijn', location: 'Bouwnummer 046 - Keuken', severity: 'hoog', status: 'open', reportedBy: 'AI Inspectie', date: '2023-12-28' },
    { id: 2, title: 'Ontbrekende veiligheidshekken', location: 'Terrein zuidzijde', severity: 'kritiek', status: 'open', reportedBy: 'AI Veiligheidscheck', date: '2023-12-29' },
    { id: 3, title: 'Afwijking in betonsamenstelling', location: 'Bouwnummer 047 - Kelder', severity: 'middel', status: 'in behandeling', reportedBy: 'AI Kwaliteitscontrole', date: '2023-12-27' },
  ]);
  
  const [aiInstructions, setAiInstructions] = useState([
    { id: 1, title: 'Spouwmuur isolatie', steps: ['Onderlaag controleren', 'Isolatieplaat plaatsen', 'Luchtdichting aanbrengen'], status: 'volgende' },
    { id: 2, title: 'Dakbedekking plaatsen', steps: ['Onderschot controleren', 'Damprem aanbrengen', 'Plaat vastzetten'], status: 'actief' },
    { id: 3, title: 'Gevelbekleding montage', steps: ['Regelwerk controleren', 'Beplating plaatsen', 'Afwerking randen'], status: 'wachtend' },
  ]);

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Jan Visser', role: 'Uitvoerder', status: 'online', currentTask: 'Bouwtekening controle', location: 'Bouwkeet' },
    { id: 2, name: 'Peter de Jong', role: 'Metselaar', status: 'actief', currentTask: 'Spouwmuur bouwnr 046', location: 'Bouwplaats' },
    { id: 3, name: 'Mohammed Ali', role: 'Timberman', status: 'actief', currentTask: 'Kozijnen plaatsen', location: 'Bouwnr 047' },
    { id: 4, name: 'Lisa van Dijk', role: 'Elektricien', status: 'pauze', currentTask: 'Keuken installatie', location: 'Bouwkeet' },
  ]);

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

  const handleStartInspection = (type) => {
    setInspectionMode(type);
    alert(`AI start nu ${type} inspectie. Loop rond en maak foto's van belangrijke punten. AI analyseert direct en geeft feedback.`);
  };

  const handleApproveInspection = (id) => {
    setActiveInspections(prev => prev.map(insp => 
      insp.id === id ? {...insp, status: 'goedgekeurd', points: insp.maxPoints} : insp
    ));
  };

  const handleIssueResolve = (id) => {
    setConstructionIssues(prev => prev.map(issue => 
      issue.id === id ? {...issue, status: 'opgelost'} : issue
    ));
  };

  const handleSendInstruction = (id) => {
    const instruction = aiInstructions.find(inst => inst.id === id);
    if (instruction) {
      alert(`AI verstuurt instructie "${instruction.title}" naar alle teamleden op locatie.`);
    }
  };

  return (
    <>
      <Head>
        <title>AI Bouwplaats Management & Inspectie</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-hard-hat"></i>
              <h1>AI Bouwinspecteur & Uitvoerder</h1>
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
              <li><a href="#"><i className="fas fa-search"></i> AI Inspectie</a></li>
              <li><a href="#"><i className="fas fa-camera"></i> Foto Upload</a></li>
              <li><a href="#"><i className="fas fa-clipboard-check"></i> Opleverlijsten</a></li>
              <li><a href="#"><i className="fas fa-drafting-compass"></i> BIM Module</a></li>
              <li><a href="#"><i className="fas fa-truck-loading"></i> Leveringen</a></li>
              <li><a href="#"><i className="fas fa-shield-alt"></i> Veiligheid</a></li>
              <li><a href="#"><i className="fas fa-chart-line"></i> Bouwproces</a></li>
              <li><a href="#"><i className="fas fa-users"></i> Team Overzicht</a></li>
              <li><a href="#"><i className="fas fa-exclamation-triangle"></i> Issues & Problemen</a></li>
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
            
            <div className="ai-status">
              <h3><i className="fas fa-brain"></i> AI Inspecteur Status</h3>
              <div className="ai-status-item">
                <i className="fas fa-shield-alt"></i>
                <span>Veiligheid: <strong>92%</strong></span>
              </div>
              <div className="ai-status-item">
                <i className="fas fa-award"></i>
                <span>Kwaliteit: <strong>85%</strong></span>
              </div>
              <div className="ai-status-item">
                <i className="fas fa-chart-line"></i>
                <span>Voortgang: <strong>78%</strong></span>
              </div>
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
            
            {/* AI Inspector Card */}
            <section className="card ai-inspector">
              <div className="card-header">
                <h2><i className="fas fa-search"></i> AI Bouwinspecteur</h2>
                <div className="ai-badge"><i className="fas fa-eye"></i> Live monitoring</div>
              </div>
              
              <p>Start een inspectieronde. AI analyseert foto's en video's in real-time en geeft direct feedback over veiligheid, kwaliteit en voortgang.</p>
              
              <div className="inspection-actions">
                <button className="btn btn-danger" onClick={() => handleStartInspection('veiligheid')}>
                  <i className="fas fa-shield-alt"></i> Veiligheidsinspectie
                </button>
                <button className="btn btn-warning" onClick={() => handleStartInspection('kwaliteit')}>
                  <i className="fas fa-award"></i> Kwaliteitsinspectie
                </button>
                <button className="btn btn-info" onClick={() => handleStartInspection('voortgang')}>
                  <i className="fas fa-chart-line"></i> Voortgangsinspectie
                </button>
              </div>
              
              <div className="active-inspections">
                <h3><i className="fas fa-clipboard-list"></i> Actieve Inspecties</h3>
                {activeInspections.map(inspection => (
                  <div key={inspection.id} className="inspection-item">
                    <div className="inspection-info">
                      <div className="inspection-title">{inspection.title}</div>
                      <div className="inspection-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${(inspection.points / inspection.maxPoints) * 100}%` }}
                          ></div>
                        </div>
                        <span>{inspection.points}/{inspection.maxPoints} punten</span>
                      </div>
                    </div>
                    <div className="inspection-actions">
                      <span className={`status ${inspection.status}`}>{inspection.status}</span>
                      {inspection.status === 'inspecteren' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleApproveInspection(inspection.id)}>
                          <i className="fas fa-check"></i> Goedkeuren
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Team Overview & AI Instructions */}
            <div className="team-instructions-container">
              <section className="card">
                <div className="card-header">
                  <h2><i className="fas fa-users"></i> Team Overzicht & Locatie</h2>
                  <div className="ai-badge"><i className="fas fa-map-marker-alt"></i> Real-time tracking</div>
                </div>
                
                <div className="team-list">
                  {teamMembers.map(member => (
                    <div key={member.id} className="team-member">
                      <div className="member-avatar">
                        {member.name.charAt(0)}
                        <span className={`member-status ${member.status}`}></span>
                      </div>
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-role">{member.role}</div>
                        <div className="member-task">
                          <i className="fas fa-tasks"></i> {member.currentTask}
                        </div>
                        <div className="member-location">
                          <i className="fas fa-map-pin"></i> {member.location}
                        </div>
                      </div>
                      <div className="member-actions">
                        <button className="btn btn-sm btn-outline">
                          <i className="fas fa-comment"></i> Bericht
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="ai-suggestion">
                  <i className="fas fa-lightbulb"></i>
                  <div>
                    <strong>AI Suggestie:</strong> Verplaats Lisa naar bouwnummer 047 voor elektra werkzaamheden. 
                    <span className="text-muted"> Voortgang optimalisatie: +15%</span>
                  </div>
                </div>
              </section>
              
              <section className="card ai-instructions">
                <div className="card-header">
                  <h2><i className="fas fa-list-check"></i> AI Werkinstructies</h2>
                  <div className="ai-badge"><i className="fas fa-robot"></i> Automatisch</div>
                </div>
                
                <p>AI genereert stap-voor-stap instructies gebaseerd op bouwtekeningen en ervaring.</p>
                
                {aiInstructions.map(instruction => (
                  <div key={instruction.id} className="instruction-item">
                    <div className="instruction-header">
                      <h4>{instruction.title}</h4>
                      <span className={`instruction-status ${instruction.status}`}>{instruction.status}</span>
                    </div>
                    <ol className="instruction-steps">
                      {instruction.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                    <div className="instruction-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => handleSendInstruction(instruction.id)}>
                        <i className="fas fa-paper-plane"></i> Stuur naar team
                      </button>
                      <button className="btn btn-sm btn-outline">
                        <i className="fas fa-file-pdf"></i> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
            
            {/* Construction Issues & AI Assistant */}
            <div className="issues-assistant-container">
              <section className="card">
                <div className="card-header">
                  <h2><i className="fas fa-exclamation-triangle"></i> Bouwproblemen & Issues</h2>
                  <div className="ai-badge"><i className="fas fa-bug"></i> AI Gedetecteerd</div>
                </div>
                
                <div className="issues-list">
                  {constructionIssues.map(issue => (
                    <div key={issue.id} className={`issue-item ${issue.severity}`}>
                      <div className="issue-icon">
                        <i className={`fas fa-${issue.severity === 'kritiek' ? 'fire' : 'exclamation-circle'}`}></i>
                      </div>
                      <div className="issue-content">
                        <div className="issue-title">{issue.title}</div>
                        <div className="issue-details">
                          <span><i className="fas fa-map-marker-alt"></i> {issue.location}</span>
                          <span><i className="fas fa-user"></i> {issue.reportedBy}</span>
                          <span><i className="fas fa-calendar"></i> {issue.date}</span>
                        </div>
                      </div>
                      <div className="issue-actions">
                        <span className={`status ${issue.status}`}>{issue.status}</span>
                        {issue.status === 'open' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleIssueResolve(issue.id)}>
                            <i className="fas fa-wrench"></i> Oplossen
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="ai-analysis">
                  <i className="fas fa-chart-bar"></i>
                  <div>
                    <strong>AI Analyse:</strong> 3 kritieke issues gedetecteerd. Prioriteit: 
                    <span className="text-danger"> Veiligheidshekken plaatsen</span>. 
                    <span className="text-muted"> Geschatte impact: 2 dagen vertraging</span>
                  </div>
                </div>
              </section>
              
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
                
                <div className="quick-questions">
                  <h4>Snelle vragen:</h4>
                  <div className="quick-buttons">
                    <button className="btn btn-sm btn-outline" onClick={() => setAiQuestion('Hoe controleer ik betonkwaliteit?')}>
                      Beton kwaliteit
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={() => setAiQuestion('Veiligheidseisen steiger?')}>
                      Steiger veiligheid
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={() => setAiQuestion('Materiaallijst spouwmuur?')}>
                      Materiaallijst
                    </button>
                  </div>
                </div>
              </section>
            </div>
            
            {/* Photo Upload & BIM Module */}
            <div className="upload-bim-container">
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
              
              <section className="card bim-module">
                <div className="card-header">
                  <h2><i className="fas fa-drafting-compass"></i> BIM Module & Tekeningen</h2>
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
                  <button className="btn btn-outline">
                    <i className="fas fa-vr-cardboard"></i> AR View
                  </button>
                </div>
                
                <div className="bim-stats">
                  <div className="bim-stat">
                    <i className="fas fa-ruler-combined"></i>
                    <div>
                      <div className="stat-value">98%</div>
                      <div className="stat-label">Nauwkeurigheid</div>
                    </div>
                  </div>
                  <div className="bim-stat">
                    <i className="fas fa-clock"></i>
                    <div>
                      <div className="stat-value">2 min</div>
                      <div className="stat-label">Generatietijd</div>
                    </div>
                  </div>
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
              
              <div className="ai-prognosis">
                <i className="fas fa-chart-line"></i>
                <div>
                  <strong>AI Prognose:</strong> Oplevering op 15 januari 2024. 
                  <span className="text-success"> Vertraging: -2 dagen</span>. 
                  <span className="text-muted"> Kritieke pad: binnenkozijnen</span>
                </div>
              </div>
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
          --info: #17a2b8;
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
          max-width: 1600px;
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
          grid-template-columns: 320px 1fr;
          gap: 30px;
        }
        
        /* Sidebar */
        .sidebar {
          background-color: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          height: fit-content;
          position: sticky;
          top: 20px;
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
          margin: 25px 0;
          padding: 20px 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
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
        
        .ai-status {
          margin-top: 25px;
        }
        
        .ai-status h3 {
          margin-bottom: 15px;
          color: var(--primary);
          font-size: 1.2rem;
        }
        
        .ai-status-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 15px;
          background-color: #f8f9fa;
          margin-bottom: 8px;
          border-radius: 6px;
        }
        
        .ai-status-item i {
          color: var(--secondary);
          width: 20px;
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
          gap: 30px;
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
        
        /* AI Inspector */
        .ai-inspector {
          background-color: rgba(87, 197, 182, 0.05);
          border-left: 4px solid var(--secondary);
        }
        
        .inspection-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
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
        
        .btn-danger {
          background-color: var(--danger);
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #b21f2d;
        }
        
        .btn-warning {
          background-color: var(--warning);
          color: var(--dark);
        }
        
        .btn-warning:hover {
          background-color: #d39e00;
        }
        
        .btn-info {
          background-color: var(--info);
          color: white;
        }
        
        .btn-info:hover {
          background-color: #138496;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 0.9rem;
        }
        
        .btn-outline {
          background-color: transparent;
          border: 1px solid #ddd;
          color: var(--dark);
        }
        
        .btn-outline:hover {
          background-color: #f8f9fa;
        }
        
        .active-inspections {
          margin-top: 25px;
        }
        
        .active-inspections h3 {
          margin-bottom: 15px;
          color: var(--primary);
          font-size: 1.2rem;
        }
        
        .inspection-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        
        .inspection-info {
          flex-grow: 1;
        }
        
        .inspection-title {
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .inspection-progress {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .progress-bar {
          flex-grow: 1;
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background-color: var(--success);
          transition: width 0.3s;
        }
        
        .inspection-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        /* Team Overview */
        .team-instructions-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        
        .team-list {
          margin-bottom: 20px;
        }
        
        .team-member {
          display: flex;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #eee;
          gap: 15px;
        }
        
        .team-member:last-child {
          border-bottom: none;
        }
        
        .member-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          position: relative;
        }
        
        .member-status {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        .member-status.online { background-color: var(--success); }
        .member-status.actief { background-color: var(--info); }
        .member-status.pauze { background-color: var(--warning); }
        
        .member-info {
          flex-grow: 1;
        }
        
        .member-name {
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .member-role {
          color: var(--gray);
          font-size: 0.9rem;
          margin-bottom: 5px;
        }
        
        .member-task, .member-location {
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--dark);
        }
        
        .ai-suggestion {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 15px;
          background-color: rgba(87, 197, 182, 0.1);
          border-radius: 8px;
          margin-top: 15px;
        }
        
        .ai-suggestion i {
          color: var(--secondary);
          font-size: 1.2rem;
        }
        
        /* AI Instructions */
        .ai-instructions {
          background-color: rgba(26, 95, 122, 0.05);
          border-left: 4px solid var(--primary);
        }
        
        .instruction-item {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .instruction-item:last-child {
          border-bottom: none;
        }
        
        .instruction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .instruction-header h4 {
          margin: 0;
        }
        
        .instruction-status {
          font-size: 0.8rem;
          padding: 3px 10px;
          border-radius: 4px;
        }
        
        .instruction-status.volgende { background-color: rgba(23, 162, 184, 0.1); color: var(--info); }
        .instruction-status.actief { background-color: rgba(40, 167, 69, 0.1); color: var(--success); }
        .instruction-status.wachtend { background-color: rgba(108, 117, 125, 0.1); color: var(--gray); }
        
        .instruction-steps {
          padding-left: 20px;
          margin-bottom: 15px;
        }
        
        .instruction-steps li {
          margin-bottom: 5px;
        }
        
        .instruction-actions {
          display: flex;
          gap: 10px;
        }
        
        /* Issues & AI Assistant */
        .issues-assistant-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        
        .issues-list {
          margin-bottom: 20px;
        }
        
        .issue-item {
          display: flex;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          gap: 15px;
        }
        
        .issue-item.kritiek { background-color: rgba(220, 53, 69, 0.05); border-left: 4px solid var(--danger); }
        .issue-item.hoog { background-color: rgba(255, 193, 7, 0.05); border-left: 4px solid var(--warning); }
        .issue-item.middel { background-color: rgba(23, 162, 184, 0.05); border-left: 4px solid var(--info); }
        
        .issue-icon {
          font-size: 1.5rem;
          color: var(--accent);
        }
        
        .issue-content {
          flex-grow: 1;
        }
        
        .issue-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .issue-details {
          display: flex;
          gap: 15px;
          font-size: 0.9rem;
          color: var(--gray);
        }
        
        .issue-details span {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .issue-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .ai-analysis {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 15px;
          background-color: rgba(255, 193, 7, 0.1);
          border-radius: 8px;
        }
        
        .ai-analysis i {
          color: var(--warning);
          font-size: 1.2rem;
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
        
        .ai-response {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid var(--primary);
        }
        
        .quick-questions {
          margin-top: 20px;
        }
        
        .quick-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        
        /* Upload & BIM */
        .upload-bim-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        
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
          margin: 20px 0;
        }
        
        .bim-stats {
          display: flex;
          gap: 20px;
          margin-top: 25px;
        }
        
        .bim-stat {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          flex: 1;
        }
        
        .bim-stat i {
          font-size: 1.5rem;
          color: var(--primary);
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--primary);
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: var(--gray);
        }
        
        /* Completion Lists */
        .ai-prognosis {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 15px;
          background-color: rgba(23, 162, 184, 0.1);
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .ai-prognosis i {
          color: var(--info);
          font-size: 1.2rem;
        }
        
        /* Text Utilities */
        .text-muted { color: var(--gray); }
        .text-danger { color: var(--danger); }
        .text-success { color: var(--success); }
        .text-primary { color: var(--primary); }
        
        /* Responsive */
        @media (max-width: 1400px) {
          .dashboard {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            position: static;
          }
          
          .team-instructions-container,
          .issues-assistant-container,
          .upload-bim-container {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .inspection-actions,
          .ai-input-area,
          .bim-actions,
          .instruction-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
          
          .issue-details {
            flex-direction: column;
            gap: 5px;
          }
          
          .team-instructions-container,
          .issues-assistant-container,
          .upload-bim-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};
export default BouwplaatsApp;
