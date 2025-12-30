import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Form, Button, ProgressBar, Badge, Dropdown } from 'react-bootstrap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faMoneyBillWave, faChartLine, faDownload, faFilter, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const FinancialOverview = () => {
const [transactions, setTransactions] = useState([]);
const [budgets, setBudgets] = useState([]);
const [timeRange, setTimeRange] = useState('monthly');
const [selectedCategory, setSelectedCategory] = useState('all');

const budgetData = [
{ category: 'Development', allocated: 150000, spent: 125000, remaining: 25000 },
{ category: 'Marketing', allocated: 80000, spent: 65000, remaining: 15000 },
{ category: 'Infrastructure', allocated: 120000, spent: 95000, remaining: 25000 },
{ category: 'Personnel', allocated: 300000, spent: 285000, remaining: 15000 },
{ category: 'Operations', allocated: 60000, spent: 45000, remaining: 15000 },
];

const expenseData = [
{ name: 'Jan', development: 40000, marketing: 20000, infrastructure: 35000, personnel: 90000 },
{ name: 'Feb', development: 45000, marketing: 22000, infrastructure: 38000, personnel: 95000 },
{ name: 'Mar', development: 42000, marketing: 21000, infrastructure: 36000, personnel: 92000 },
{ name: 'Apr', development: 48000, marketing: 23000, infrastructure: 40000, personnel: 98000 },
{ name: 'May', development: 50000, marketing: 25000, infrastructure: 42000, personnel: 100000 },
];

const pieData = [
{ name: 'Development', value: 125000 },
{ name: 'Marketing', value: 65000 },
{ name: 'Infrastructure', value: 95000 },
{ name: 'Personnel', value: 285000 },
{ name: 'Operations', value: 45000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const transactionSample = [
{ id: 1, date: '2023-11-15', description: 'Software License Renewal', category: 'Development', amount: -2500, vendor: 'Microsoft' },
{ id: 2, date: '2023-11-14', description: 'Client Payment', category: 'Revenue', amount: 15000, vendor: 'ABC Corp' },
{ id: 3, date: '2023-11-13', description: 'Office Supplies', category: 'Operations', amount: -800, vendor: 'Office Depot' },
{ id: 4, date: '2023-11-12', description: 'Cloud Services', category: 'Infrastructure', amount: -3200, vendor: 'AWS' },
{ id: 5, date: '2023-11-11', description: 'Marketing Campaign', category: 'Marketing', amount: -5000, vendor: 'Google Ads' },
{ id: 6, date: '2023-11-10', description: 'Consulting Services', category: 'Development', amount: -7500, vendor: 'Tech Solutions Inc.' },
];

useEffect(() => {
setTransactions(transactionSample);
setBudgets(budgetData);
}, []);

const totalAllocated = budgets.reduce((sum, item) => sum + item.allocated, 0);
const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
const totalRemaining = totalAllocated - totalSpent;
const spendingPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

const filteredTransactions = selectedCategory === 'all'
? transactions
: transactions.filter(t => t.category === selectedCategory);

const getAmountColor = (amount) => {
return amount >= 0 ? 'text-success' : 'text-danger';
};

const exportToCSV = () => {
const headers = ['Date', 'Description', 'Category', 'Amount', 'Vendor'];
const csvContent = [
headers.join(','),
...transactions.map(t => [
t.date,
t.description,
t.category,
t.amount,
t.vendor
].join(','))
].join('\n');

text
const blob = new Blob([csvContent], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'financial_transactions.csv';
a.click();
};

return (
<div className="financial-overview">
<Row className="mb-4">
<Col>
<h2>Financial Overview</h2>
<p className="text-muted">Budget tracking, expenses, and financial analytics</p>
</Col>
<Col className="text-end">
<Button variant="outline-primary" className="me-2" onClick={exportToCSV}>
<FontAwesomeIcon icon={faDownload} className="me-2" />
Export CSV
</Button>
<Dropdown>
<Dropdown.Toggle variant="outline-secondary">
<FontAwesomeIcon icon={faFilter} className="me-2" />
Filter: {timeRange}
</Dropdown.Toggle>
<Dropdown.Menu>
<Dropdown.Item onClick={() => setTimeRange('weekly')}>Weekly</Dropdown.Item>
<Dropdown.Item onClick={() => setTimeRange('monthly')}>Monthly</Dropdown.Item>
<Dropdown.Item onClick={() => setTimeRange('quarterly')}>Quarterly</Dropdown.Item>
<Dropdown.Item onClick={() => setTimeRange('yearly')}>Yearly</Dropdown.Item>
</Dropdown.Menu>
</Dropdown>
</Col>
</Row>

text
  <Row className="mb-4">
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faDollarSign} className="text-primary fs-1 mb-2" />
          <h3>${totalAllocated.toLocaleString()}</h3>
          <Card.Text className="text-muted">Total Budget</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faMoneyBillWave} className="text-success fs-1 mb-2" />
          <h3>${totalSpent.toLocaleString()}</h3>
          <Card.Text className="text-muted">Total Spent</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faChartLine} className="text-info fs-1 mb-2" />
          <h3>${totalRemaining.toLocaleString()}</h3>
          <Card.Text className="text-muted">Remaining</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning fs-1 mb-2" />
          <h3>{spendingPercentage.toFixed(1)}%</h3>
          <Card.Text className="text-muted">Spending Progress</Card.Text>
          <ProgressBar now={spendingPercentage} variant={spendingPercentage > 90 ? 'danger' : spendingPercentage > 75 ? 'warning' : 'success'} />
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Row className="mb-4">
    <Col md={8}>
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Expense Trends</Card.Title>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="development" fill="#8884d8" />
              <Bar dataKey="marketing" fill="#82ca9d" />
              <Bar dataKey="infrastructure" fill="#ffc658" />
              <Bar dataKey="personnel" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </Col>
    <Col md={4}>
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Budget Distribution</Card.Title>
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
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Row>
    <Col md={6}>
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Budget Overview</Card.Title>
        </Card.Header>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Category</th>
                <th>Allocated</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget, index) => {
                const percentage = (budget.spent / budget.allocated) * 100;
                return (
                  <tr key={index}>
                    <td>{budget.category}</td>
                    <td>${budget.allocated.toLocaleString()}</td>
                    <td>${budget.spent.toLocaleString()}</td>
                    <td>${budget.remaining.toLocaleString()}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <ProgressBar 
                          now={percentage} 
                          style={{ width: '100px' }} 
                          className="me-2"
                          variant={percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : 'success'}
                        />
                        <small>{percentage.toFixed(1)}%</small>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
    <Col md={6}>
      <Card className="h-100">
        <Card.Header>
          <Row>
            <Col>
              <Card.Title>Recent Transactions</Card.Title>
            </Col>
            <Col className="text-end">
              <Form.Select 
                size="sm" 
                style={{ width: 'auto', display: 'inline-block' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Development">Development</option>
                <option value="Marketing">Marketing</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Operations">Operations</option>
                <option value="Revenue">Revenue</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredTransactions.map(transaction => (
              <div key={transaction.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                  <div className="fw-bold">{transaction.description}</div>
                  <small className="text-muted">
                    {transaction.date} • {transaction.category} • {transaction.vendor}
                  </small>
                </div>
                <div className={`fw-bold ${getAmountColor(transaction.amount)}`}>
                  {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>
</div>
);
};

export default FinancialOverview;
