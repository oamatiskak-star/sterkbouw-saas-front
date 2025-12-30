import { useState, useEffect } from 'react';

export default function AdministratiePage() {
  // STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, cashflow, projects, moneybird, companies, risks
  const [selectedCompany, setSelectedCompany] = useState('all'); // all, holding, werk-bv, financial
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [cashflowData, setCashflowData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [riskSignals, setRiskSignals] = useState([]);
  
  // INIT DATA
  useEffect(() => {
    loadInitialData();
  }, [selectedCompany]);

  const loadInitialData = async () => {
    // Hier komen later je API calls
    setCashflowData({
      week1: { incoming: 125000, outgoing: 98000, net: 27000 },
      week2: { incoming: 89000, outgoing: 115000, net: -26000 },
    });
    
    setProjects([
      { id: 1, name: 'Villa Nova', budget: 250000, costs: 180000, margin: 70000 },
      { id: 2, name: 'Kantoor Utrecht', budget: 180000, costs: 120000, margin: 60000 },
    ]);
    
    setRiskSignals([
      { id: 1, type: 'warning', message: 'Leverancier 18% duurder', amount: 4200 },
      { id: 2, type: 'critical', message: 'Negatieve cashflow week 3', amount: 24300 },
    ]);
  };

  // RENDER FUNCTIES
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Company Selector */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex space-x-4">
          {['all', 'holding', 'werk-bv', 'financial'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedCompany(type)}
              className={`px-4 py-2 rounded-lg ${
                selectedCompany === type 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {type === 'all' ? 'Alle Bedrijven' : 
               type === 'holding' ? 'Bouwproffs Holding BV' :
               type === 'werk-bv' ? 'Bouwproffs BV' : 
               'Modiwerijo Financial Management BV'}
            </button>
          ))}
        </div>
      </div>

      {/* Cashflow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Te ontvangen</h3>
          <div className="text-3xl font-bold text-green-600">€125.430</div>
          <div className="text-sm text-gray-500">Deze week</div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Te betalen</h3>
          <div className="text-3xl font-bold text-red-600">€89.450</div>
          <div className="text-sm text-gray-500">Deze week</div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Netto Cashflow</h3>
          <div className="text-3xl font-bold text-blue-600">€35.980</div>
          <div className="text-sm text-gray-500">+23% vs vorige week</div>
        </div>
      </div>

      {/* 8-Weeks Forecast */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">8-Weken Cashflow Forecast</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(week => (
            <div key={week} className="text-center">
              <div className="font-medium text-gray-700 mb-2">Week {week}</div>
              <div className={`p-3 rounded-lg ${
                week === 2 ? 'bg-red-50 border border-red-200' : 
                week === 1 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}>
                <div className="text-xl font-bold text-gray-900">
                  €{week === 1 ? '27k' : week === 2 ? '-26k' : '15k'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Signals */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Risico Signalering</h3>
        <div className="space-y-3">
          {riskSignals.map(risk => (
            <div key={risk.id} className={`p-4 rounded-lg ${
              risk.type === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{risk.message}</div>
                  <div className="text-sm text-gray-600">Potentiële impact: €{risk.amount.toLocaleString('nl-NL')}</div>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Actie ondernemen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCashflow = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Cashflow Management</h2>
        
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">Vorige week</button>
            <div className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Week {getWeekNumber(currentWeek)} - {currentWeek.toLocaleDateString('nl-NL')}
            </div>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">Volgende week</button>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
            Exporteer naar Excel
          </button>
        </div>

        {/* Detailed Cashflow Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project/Bedrijf</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Te ontvangen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Te betalen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Netto</th>
                <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">Bouwproffs Holding BV</td>
                <td className="px-6 py-4 text-green-600 font-medium">€45.000</td>
                <td className="px-6 py-4 text-red-600 font-medium">€32.000</td>
                <td className="px-6 py-4 text-blue-600 font-bold">€13.000</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Positief</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">Bouwproffs BV</td>
                <td className="px-6 py-4 text-green-600 font-medium">€80.430</td>
                <td className="px-6 py-4 text-red-600 font-medium">€57.450</td>
                <td className="px-6 py-4 text-blue-600 font-bold">€22.980</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Positief</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">Villa Nova Project</td>
                <td className="px-6 py-4 text-green-600 font-medium">€25.000</td>
                <td className="px-6 py-4 text-red-600 font-medium">€42.000</td>
                <td className="px-6 py-4 text-red-600 font-bold">-€17.000</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Risico</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Administratie</h2>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Actief</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="text-lg font-bold">€{project.budget.toLocaleString('nl-NL')}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Kosten tot nu toe</div>
                  <div className="text-lg font-bold">€{project.costs.toLocaleString('nl-NL')}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Rest marge</div>
                  <div className={`text-lg font-bold ${
                    project.margin > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    €{project.margin.toLocaleString('nl-NL')}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Bekijk details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMoneybird = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Moneybird Synchronisatie</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 border border-gray-200 rounded-xl">
            <div className="text-4xl mb-4">📥</div>
            <div className="text-xl font-bold">124</div>
            <div className="text-gray-600">Inkoopfacturen</div>
          </div>
          
          <div className="text-center p-6 border border-gray-200 rounded-xl">
            <div className="text-4xl mb-4">📤</div>
            <div className="text-xl font-bold">89</div>
            <div className="text-gray-600">Verkoopfacturen</div>
          </div>
          
          <div className="text-center p-6 border border-gray-200 rounded-xl">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-xl font-bold">12</div>
            <div className="text-gray-600">Openstaande posten</div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Nu synchroniseren
          </button>
          <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300">
            Instellingen
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Rapport genereren
          </button>
        </div>
      </div>
    </div>
  );

  // HELPER FUNCTIONS
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // MAIN RETURN
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administratie Module</h1>
              <p className="text-gray-600">Bouwproffs Financieel Commandocentrum</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Nieuwe factuur
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">
                Exporteer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'cashflow', label: '💰 Cashflow' },
            { id: 'projects', label: '🏗️ Projecten' },
            { id: 'moneybird', label: '🔄 Moneybird' },
            { id: 'companies', label: '🏢 Bedrijven' },
            { id: 'risks', label: '⚠️ Risico\'s' },
            { id: 'overhead', label: '📈 Overhead' },
            { id: 'reports', label: '📄 Rapporten' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-lg whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'cashflow' && renderCashflow()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'moneybird' && renderMoneybird()}
          {activeTab === 'companies' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Bedrijfsstructuur</h2>
              <p>Bedrijven management komt hier...</p>
            </div>
          )}
          {activeTab === 'risks' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Risico Management</h2>
              <p>Risico signalering komt hier...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
