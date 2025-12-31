// pages/dashboard/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [kpiData, setKpiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial data
  useEffect(() => {
    // Dit zou normaal een API call zijn
    setKpiData({
      activeProjects: 12,
      ongoingCalculations: 8,
      openChangeOrders: 5,
      pendingApprovals: 3,
      financialExposure: '€2.8M',
      alerts: 2,
      blocks: 1,
    });
    setIsLoading(false);
  }, []);

  const [timeframe, setTimeframe] = useState({
    days: false,
    weeks: false,
    months: true,
    quarters: false,
    years: false,
    disableNotifications: false
  });

  const projects = [
    {
      id: 1,
      name: 'Waterfall - Implementation',
      manager: 'Easy Admin',
      status: 'active',
      priority: 'Regular',
      startDate: '08 Jul 2022',
      dueDate: '01 May 2024'
    },
    {
      id: 2,
      name: 'Client Zone Development',
      manager: 'Easy Admin',
      status: 'active',
      priority: 'High',
      startDate: '15 Mar 2023',
      dueDate: '30 Dec 2023'
    },
    {
      id: 3,
      name: 'Building a house',
      manager: 'Easy Admin',
      status: 'on-hold',
      priority: 'Medium',
      startDate: '01 Jan 2023',
      dueDate: '01 Jun 2024'
    },
    {
      id: 4,
      name: 'Company Processes',
      manager: 'V Franzen Finance Director',
      status: 'completed',
      priority: 'Low',
      startDate: '10 Nov 2022',
      dueDate: '15 Sep 2023'
    },
    {
      id: 5,
      name: 'GDPR Implementation',
      manager: 'Franz Finance Director',
      status: 'active',
      priority: 'High',
      startDate: '05 Feb 2023',
      dueDate: '05 Feb 2024'
    }
  ];

  const moduleStatus = [
    { name: 'Administratie', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'BIM', status: 'warning', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { name: 'Bouwplaats', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'Calculatie', status: 'error', color: 'bg-red-100 text-red-800 border-red-300' },
    { name: 'Constructie', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'Documenten', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'Financiën', status: 'warning', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { name: 'Financieringen', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'Inkoop', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'Kopersportaal', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'Mail', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'Planning', status: 'warning', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { name: 'Projecten', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
    { name: 'Projectportaal', status: 'success', color: 'bg-green-100 text-green-800 border-green-300' },
  ];

  const recentEvents = [
    { id: 1, title: 'Calculatie goedgekeurd', project: 'Project Alpha', time: '10 min geleden', user: 'Executor' },
    { id: 2, title: 'Bouwplaats gestart', project: 'Project Beta', time: '1 uur geleden', user: 'Builder' },
    { id: 3, title: 'Meerwerk gesignaleerd', project: 'Project Gamma', time: '2 uur geleden', user: 'Builder' },
    { id: 4, title: 'Financiering rond', project: 'Project Delta', time: '5 uur geleden', user: 'Executor' },
  ];

  const quickActions = [
    { label: 'Nieuw project', link: '/projects/new', icon: '📁' },
    { label: 'Nieuwe calculatie', link: '/calculations/new', icon: '🧮' },
    { label: 'Open bouwplaats', link: '/construction-site', icon: '🏗️' },
    { label: 'Financiering', link: '/financing', icon: '💰' },
    { label: 'Bouwinspectie', link: '/inspections', icon: '🔍' },
  ];

  const pmTechniques = [
    { id: 1, name: 'Client Zone Development', manager: 'Easy Admin' },
    { id: 2, name: 'Building a house', manager: 'Easy Admin' },
    { id: 3, name: 'Waterfall - Implement', manager: 'Easy Admin' },
    { id: 4, name: 'Company Processes', manager: 'V Franzen Finance Director' },
    { id: 5, name: 'GDPR', manager: 'Franz Finance Director' }
  ];

  const financialData = [
    { id: 1, month: 'Feb', amount: -120000 },
    { id: 2, month: 'Mar', amount: -352000 },
    { id: 3, month: 'Apr May', amount: -350000 },
    { id: 4, month: 'Jun Jul', amount: -400000 },
    { id: 5, month: 'Aug Sep', amount: -400000 },
    { id: 6, month: 'Sep Oct', amount: -300000 },
    { id: 7, month: 'Nov Dec', amount: -300000 },
    { id: 8, month: 'Jan Feb', amount: -400000 },
    { id: 9, month: 'Mar Apr', amount: -300000 }
  ];

  const allModules = [
    { name: 'Dashboard', link: '/dashboard', icon: '📊' },
    { name: 'Administratie', link: '/administration', icon: '📋' },
    { name: 'BIM', link: '/bim', icon: '🏢' },
    { name: 'Bouwplaats', link: '/construction-site', icon: '🚧' },
    { name: 'Calculatie', link: '/calculation', icon: '🧮' },
    { name: 'Constructie', link: '/construction', icon: '⚙️' },
    { name: 'Documenten', link: '/documents', icon: '📄' },
    { name: 'Financiën', link: '/finance', icon: '💶' },
    { name: 'Financieringen', link: '/financing', icon: '🏦' },
    { name: 'Inkoop', link: '/procurement', icon: '📦' },
    { name: 'Kopersportaal', link: '/buyer-portal', icon: '👥' },
    { name: 'Mail', link: '/mail', icon: '✉️' },
    { name: 'Planning', link: '/planning', icon: '📅' },
    { name: 'Projecten', link: '/projects', icon: '📁' },
    { name: 'Projectportaal', link: '/client-portal', icon: '👨‍💼' },
    { name: 'Instellingen', link: '/settings', icon: '⚙️' },
  ];

  const handleTimeframeChange = (key) => {
    setTimeframe(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const maxAmount = Math.max(...financialData.map(item => Math.abs(item.amount)))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Projects I manage <span className="text-blue-600">({projects.length})</span>
          </h1>
          <p className="text-gray-600">
            Totaaloverzicht en directe sturing van het SterkBouw platform
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            New Project
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            Export
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {Object.entries(timeframe).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleTimeframeChange(key)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Alerts & Blokkades */}
      {(kpiData.alerts > 0 || kpiData.blocks > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {kpiData.alerts > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span className="font-medium text-yellow-800">
                    {kpiData.alerts} actieve alert(s)
                  </span>
                </div>
                <Link href="/alerts" className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded hover:bg-yellow-600 transition">
                  Bekijken
                </Link>
              </div>
            </div>
          )}
          {kpiData.blocks > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">🚨</span>
                  <span className="font-medium text-red-800">
                    {kpiData.blocks} blokkade(s)
                  </span>
                </div>
                <Link href="/blocks" className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition">
                  Oplossen
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Tegels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-gray-500 text-sm font-medium mb-2">Actieve projecten</div>
          <div className="text-3xl font-bold text-gray-900">{kpiData.activeProjects}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-gray-500 text-sm font-medium mb-2">Lopende calculaties</div>
          <div className="text-3xl font-bold text-gray-900">{kpiData.ongoingCalculations}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-gray-500 text-sm font-medium mb-2">Open meerwerk</div>
          <div className="text-3xl font-bold text-gray-900">{kpiData.openChangeOrders}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-gray-500 text-sm font-medium mb-2">Openstaande akkoorden</div>
          <div className="text-3xl font-bold text-gray-900">{kpiData.pendingApprovals}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-gray-500 text-sm font-medium mb-2">Financiële exposure</div>
          <div className="text-3xl font-bold text-red-600">{kpiData.financialExposure}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-gray-500 text-sm font-medium mb-2">Systeemevents</div>
          <div className="text-3xl font-bold text-gray-900">{recentEvents.length}</div>
        </div>
      </div>

      {/* Snelle Acties */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Snelle acties</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.link}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow transition duration-150"
              >
                <span className="text-2xl mb-2">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Financial Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Financial Overview</h2>
              <p className="text-sm text-gray-600 mt-1">Cash flow per month</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {financialData.map((item) => {
                  const percentage = (Math.abs(item.amount) / maxAmount) * 100
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-gray-600 font-medium">
                        {item.month}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${item.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.amount < 0 ? '-' : '+'}€{Math.abs(item.amount / 1000)}k
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Projects I manage <span className="text-blue-600">({projects.length})</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PROJECT MANAGER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRIORITY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      START DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DUE DATE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{project.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{project.manager}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.priority === 'High' ? 'bg-red-100 text-red-800' :
                          project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {project.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{project.startDate}</td>
                      <td className="px-6 py-4 text-gray-600">{project.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* PM Techniques */}
          <div className="bg-white rounded-lg border border-gray-200 shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">PM techniques examples</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pmTechniques.map((tech) => (
                  <div key={tech.id} className="flex justify-between items-center group hover:bg-gray-50 p-2 -mx-2 rounded">
                    <div>
                      <div className="font-medium text-gray-900">{tech.name}</div>
                      <div className="text-sm text-gray-500">{tech.manager}</div>
                    </div>
                    <Link 
                      href={`/projecten/${tech.id}`}
                      className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Print Button */}
          <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
            <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 shadow p-6">
            <h3 className="font-medium text-gray-800 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Calculations</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">€2.8M</div>
                <div className="text-sm text-gray-600">Exposure</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Twee kolommen onderaan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Laatste systeemevents */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Laatste systeemevents (executor / builder)
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">📋</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-500">
                      {event.project} • {event.time} • Door: {event.user}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status per module */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Status per module</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {moduleStatus.map((module, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg text-center ${module.color}`}
                >
                  <div className="font-medium text-sm">{module.name}</div>
                  <div className="text-xs mt-1">
                    {module.status === 'success' && '✓ Actief'}
                    {module.status === 'warning' && '⚠ Waarschuwing'}
                    {module.status === 'error' && '✗ Probleem'}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-6 pt-6 border-t border-gray-200">
              <span className="inline-flex items-center text-sm">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Actief
              </span>
              <span className="inline-flex items-center text-sm">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Waarschuwing
              </span>
              <span className="inline-flex items-center text-sm">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Probleem
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alle modules */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Alle modules</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {allModules.map((module, index) => (
              <Link
                key={index}
                href={module.link}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow transition duration-150"
              >
                <span className="text-2xl mb-2">{module.icon}</span>
                <span className="text-sm font-medium text-gray-700 text-center">{module.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
