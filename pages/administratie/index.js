import React, { useState, useEffect } from 'react';
import WeekView from './WeekView';
import ConsolidatedView from './ConsolidatedView';
import RiskAlerts from '../../components/ai/RiskAlert';
import CashflowCard from '../../components/finance/CashflowCard';
import { getWeeklyForecast, getActiveSignals } from '../../utils/api';

export default function Dashboard() {
  const [selectedCompanies, setSelectedCompanies] = useState(['all']);
  const [weekData, setWeekData] = useState({});
  const [signals, setSignals] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, [selectedCompanies, currentWeek]);

  const loadDashboardData = async () => {
    const [forecast, riskSignals] = await Promise.all([
      getWeeklyForecast({
        companies: selectedCompanies,
        week: getWeekNumber(currentWeek),
        weeksAhead: 8
      }),
      getActiveSignals({ companies: selectedCompanies })
    ]);
    
    setWeekData(forecast);
    setSignals(riskSignals);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Financieel Commandocentrum</h1>
        <CompanySelector 
          selected={selectedCompanies}
          onChange={setSelectedCompanies}
        />
      </div>
      
      <div className="dashboard-grid">
        <div className="main-content">
          <WeekView 
            data={weekData}
            week={currentWeek}
            onWeekChange={setCurrentWeek}
          />
          
          {selectedCompanies.length > 1 && (
            <ConsolidatedView data={weekData} />
          )}
        </div>
        
        <div className="sidebar">
          <RiskAlerts signals={signals} />
          <CashflowCard 
            data={weekData.currentWeek}
            companies={selectedCompanies}
          />
        </div>
      </div>
    </div>
  );
}
