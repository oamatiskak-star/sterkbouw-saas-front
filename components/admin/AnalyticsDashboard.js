import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Form, Dropdown, Button, ProgressBar, Badge } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faChartBar, faChartPie, faCalendarAlt, faFilter, faDownload, faArrowUp, faArrowDown, faUsers, faDollarSign, faTasks, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const AnalyticsDashboard = () => {
const [timeRange, setTimeRange] = useState('monthly');
const [activeTab, setActiveTab] = useState('overview');

const revenueData = [
{ month: 'Jan', revenue: 85000, expenses: 45000, profit: 40000 },
{ month: 'Feb', revenue: 92000, expenses: 48000, profit: 44000 },
{ month: 'Mar', revenue: 78000, expenses: 52000, profit: 26000 },
{ month: 'Apr', revenue: 105000, expenses: 55000, profit: 50000 },
{ month: 'May', revenue: 115000, expenses: 60000, profit: 55000 },
{ month: 'Jun', revenue: 125000, expenses: 65000, profit: 60000 },
];

const projectPerformance = [
{ name: 'Website Redesign', completion: 75, budget: 50000, spent: 42000, timeline: 80 },
{ name: 'Mobile App Launch', completion: 30, budget: 120000, spent: 35000, timeline: 45 },
{ name: 'CRM Migration', completion: 100, budget: 80000, spent: 78000, timeline: 100 },
{ name: 'Infrastructure Upgrade', completion: 45, budget: 200000, spent: 85000, timeline: 50 },
{ name: 'Marketing Campaign', completion: 10, budget: 40000, spent: 5000, timeline: 15 },
];

const teamProductivity = [
{ name: 'Engineering', tasks: 245, completed: 210, efficiency: 85.7 },
{ name: 'Design', tasks: 128, completed: 115, efficiency: 89.8 },
{ name: 'Marketing', tasks: 89, completed: 82, efficiency: 92.1 },
{ name: 'Management', tasks: 56, completed: 48, efficiency: 85.7 },
{ name: 'Operations', tasks: 167, completed: 145, efficiency: 86.8 },
];

const kpiData = [
{ name: 'Revenue Growth', current: 25, target: 20, unit: '%', trend: 'up' },
{ name: 'Project On-Time', current: 78, target: 85, unit: '%', trend: 'down' },
{ name: 'Budget Adherence', current: 92, target: 90, unit: '%', trend: 'up' },
{ name: 'Team Utilization', current: 84, target: 80, unit: '%', trend: 'up' },
{ name: 'Client Satisfaction', current: 4.5, target: 4.3, unit: '/5', trend: 'up' },
];

const pieData = [
{ name: 'Development', value: 35 },
{ name: 'Marketing', value: 20 },
{ name: 'Operations', value: 15 },
{ name: 'Personnel', value: 25 },
{ name: 'Other', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const formatCurrency = (value) => {
return new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
minimumFractionDigits: 0,
maximumFractionDigits: 0,
}).format(value);
};

const getTrendIcon = (trend) => {
return trend === 'up' ?
<FontAwesomeIcon icon={faArrowUp} className="text-success" /> :
<FontAwesomeIcon icon={faArrowDown} className="text-danger" />;
};

const stats = {
totalRevenue: 610000,
activeProjects: 8,
teamMembers: 42,
documents: 156,
revenueGrowth: 25,
projectCompletion: 78,
budgetUtilization: 92,
clientSatisfaction: 4.5
};

return (
<div className="analytics-dashboard">
<Row className="mb-4">
<Col>
<h2>Analytics Dashboard</h2>
<p className="text-muted">Insights, reports, and performance metrics</p>
</Col>
<Col className="text-end">
<Dropdown className="d-inline-block me-2">
<Dropdown.Toggle variant="outline-secondary">
<FontAwesomeIcon icon={faFilter} className="me-2" />
{timeRange}
</Dropdown.Toggle>
<Dropdown.Menu>
<Dropdown.Item onClick={() => setTimeRange('weekly')}>Weekly</Dropdown.Item>
<Dropdown.Item onClick={() => setTimeRange('monthly')}>Monthly</Dropdown.Item>
<Dropdown.Item onClick={() => setTimeRange('quarterly')}>Quarterly</Dropdown.Item>
<Dropdown.Item onClick={() => setTimeRange('yearly')}>Yearly</Dropdown.Item>
</Dropdown.Menu>
</Dropdown>
<Button variant="outline-primary">
<FontAwesomeIcon icon={faDownload} className="me-2" />
Export Report
</Button>
</Col>
</Row>

text
  <Row className="mb-4">
    <Col md={3}>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="text-muted mb-1">Total Revenue</h6>
              <h3>{formatCurrency(stats.totalRevenue)}</h3>
              <div className="d-flex align-items-center">
                {getTrendIcon('up')}
                <small className="text-success ms-1">{stats.revenueGrowth}% growth</small>
              </div>
            </div>
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
              <FontAwesomeIcon icon={faDollarSign} className="text-primary fs-4" />
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="text-muted mb-1">Active Projects</h6>
              <h3>{stats.activeProjects}</h3>
              <div className="d-flex align-items-center">
                {getTrendIcon('up')}
                <small className="text-success ms-1">{stats.projectCompletion}% on-time</small>
              </div>
            </div>
            <div className="bg-success bg-opacity-10 p-3 rounded-circle">
              <FontAwesomeIcon icon={faTasks} className="text-success fs-4" />
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="text-muted mb-1">Team Members</h6>
              <h3>{stats.teamMembers}</h3>
              <div className="d-flex align-items-center">
                {getTrendIcon('up')}
                <small className="text-success ms-1">{stats.budgetUtilization}% utilization</small>
              </div>
            </div>
            <div className="bg-info bg-opacity-10 p-3 rounded-circle">
              <FontAwesomeIcon icon={faUsers} className="text-info fs-4" />
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="text-muted mb-1">Documents</h6>
              <h3>{stats.documents}</h3>
              <div className="d-flex align-items-center">
                {getTrendIcon('up')}
                <small className="text-success ms-1">12 new this month</small>
              </div>
            </div>
            <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
              <FontAwesomeIcon icon={faFileAlt} className="text-warning fs-4" />
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Row className="mb-4">
    <Col md={8}>
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Financial Performance</Card.Title>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
              <Area type="monotone" dataKey="profit" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </Col>
    <Col md={4}>
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Expense Distribution</Card.Title>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            </PieChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Row className="mb-4">
    <Col md={6}>
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Project Performance</Card.Title>
        </Card.Header>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Project</th>
                <th>Completion</th>
                <th>Budget</th>
                <th>Timeline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projectPerformance.map((project, index) => (
                <tr key={index}>
                  <td className="fw-bold">{project.name}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <ProgressBar 
                        now={project.completion} 
                        style={{ width: '100px' }} 
                        className="me-2"
                        variant={project.completion >= 100 ? 'success' : project.completion >= 75 ? 'primary' : project.completion >= 50 ? 'warning' : 'danger'}
                      />
                      <small>{project.completion}%</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>${project.spent.toLocaleString()}</div>
                      <small className="text-muted">of ${project.budget.toLocaleString()}</small>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <ProgressBar 
                        now={project.timeline} 
                        style={{ width: '100px' }} 
                        className="me-2"
                        variant={project.timeline >= 100 ? 'success' : project.timeline >= 75 ? 'primary' : project.timeline >= 50 ? 'warning' : 'danger'}
                      />
                      <small>{project.timeline}%</small>
                    </div>
                  </td>
                  <td>
                    {project.completion >= 100 ? 
                      <Badge bg="success">Completed</Badge> : 
                      project.completion >= 75 ? 
                      <Badge bg="primary">On Track</Badge> : 
                      project.completion >= 50 ? 
                      <Badge bg="warning">Delayed</Badge> : 
                      <Badge bg="danger">At Risk</Badge>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
    <Col md={6}>
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Team Productivity</Card.Title>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamProductivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#8884d8" name="Completed Tasks" />
              <Bar dataKey="tasks" fill="#82ca9d" name="Total Tasks" />
            </BarChart>
          </ResponsiveContainer>
          <Table className="mt-3" hover responsive size="sm">
            <thead>
              <tr>
                <th>Department</th>
                <th>Tasks</th>
                <th>Completed</th>
                <th>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {teamProductivity.map((team, index) => (
                <tr key={index}>
                  <td>{team.name}</td>
                  <td>{team.tasks}</td>
                  <td>{team.completed}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <ProgressBar 
                        now={team.efficiency} 
                        style={{ width: '80px' }} 
                        className="me-2"
                        variant={team.efficiency >= 90 ? 'success' : team.efficiency >= 80 ? 'primary' : 'warning'}
                      />
                      <small>{team.efficiency}%</small>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Row>
    <Col>
      <Card>
        <Card.Header>
          <Card.Title>Key Performance Indicators</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row>
            {kpiData.map((kpi, index) => (
              <Col md={4} key={index} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">{kpi.name}</h6>
                      {getTrendIcon(kpi.trend)}
                    </div>
                    <div className="d-flex align-items-end">
                      <h2 className="mb-0">{kpi.current}{kpi.unit}</h2>
                      <small className="text-muted ms-2">Target: {kpi.target}{kpi.unit}</small>
                    </div>
                    <ProgressBar 
                      now={(kpi.current / kpi.target) * 100} 
                      className="mt-2"
                      variant={kpi.current >= kpi.target ? 'success' : 'warning'}
                    />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Col>
  </Row>
</div>
);
};

export default AnalyticsDashboard;

