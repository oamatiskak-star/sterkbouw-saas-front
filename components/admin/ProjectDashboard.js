import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, ProgressBar, Button, Form, Modal, Badge } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTasks, faCalendarAlt, faExclamationTriangle, faEdit, faTrash, faEye, faPlus } from '@fortawesome/free-solid-svg-icons';

const ProjectDashboard = () => {
const [projects, setProjects] = useState([]);
const [filter, setFilter] = useState('all');
const [showModal, setShowModal] = useState(false);
const [selectedProject, setSelectedProject] = useState(null);
const [newProject, setNewProject] = useState({ name: '', budget: '', deadline: '', status: 'active' });

const sampleData = [
{ id: 1, name: 'Website Redesign', progress: 75, budget: 50000, spent: 42000, deadline: '2023-12-15', status: 'active', team: 8 },
{ id: 2, name: 'Mobile App Launch', progress: 30, budget: 120000, spent: 35000, deadline: '2024-02-28', status: 'active', team: 12 },
{ id: 3, name: 'CRM Migration', progress: 100, budget: 80000, spent: 78000, deadline: '2023-10-30', status: 'completed', team: 6 },
{ id: 4, name: 'Infrastructure Upgrade', progress: 45, budget: 200000, spent: 85000, deadline: '2024-03-15', status: 'active', team: 15 },
{ id: 5, name: 'Marketing Campaign', progress: 10, budget: 40000, spent: 5000, deadline: '2024-01-20', status: 'planned', team: 5 },
];

const timelineData = [
{ month: 'Jan', active: 4, completed: 2 },
{ month: 'Feb', active: 5, completed: 3 },
{ month: 'Mar', active: 6, completed: 3 },
{ month: 'Apr', active: 7, completed: 4 },
{ month: 'May', active: 8, completed: 4 },
{ month: 'Jun', active: 8, completed: 5 },
];

useEffect(() => {
setProjects(sampleData);
}, []);

const handleEdit = (project) => {
setSelectedProject(project);
setNewProject(project);
setShowModal(true);
};

const handleDelete = (id) => {
if (window.confirm('Are you sure you want to delete this project?')) {
setProjects(projects.filter(p => p.id !== id));
}
};

const handleSave = () => {
if (selectedProject) {
setProjects(projects.map(p => p.id === selectedProject.id ? newProject : p));
} else {
const id = Math.max(...projects.map(p => p.id)) + 1;
setProjects([...projects, { ...newProject, id }]);
}
setShowModal(false);
setSelectedProject(null);
setNewProject({ name: '', budget: '', deadline: '', status: 'active' });
};

const getStatusBadge = (status) => {
switch (status) {
case 'active': return <Badge bg="success">Active</Badge>;
case 'completed': return <Badge bg="secondary">Completed</Badge>;
case 'planned': return <Badge bg="info">Planned</Badge>;
case 'delayed': return <Badge bg="warning">Delayed</Badge>;
default: return <Badge bg="light">Unknown</Badge>;
}
};

const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.status === filter);

return (
<div className="project-dashboard">
<Row className="mb-4">
<Col>
<h2>Project Dashboard</h2>
<p className="text-muted">Overview of all projects, timelines, and progress</p>
</Col>
<Col className="text-end">
<Button variant="primary" onClick={() => setShowModal(true)}>
<FontAwesomeIcon icon={faPlus} className="me-2" />
New Project
</Button>
</Col>
</Row>

text
  <Row className="mb-4">
    <Col md={8}>
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Project Timeline</Card.Title>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="active" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="completed" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    </Col>
    <Col md={4}>
      <Card className="h-100">
        <Card.Header>
          <Card.Title>Quick Stats</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <FontAwesomeIcon icon={faTasks} className="text-primary fs-4 me-3" />
            <div>
              <h5 className="mb-0">{projects.length}</h5>
              <small className="text-muted">Total Projects</small>
            </div>
          </div>
          <div className="d-flex align-items-center mb-3">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-success fs-4 me-3" />
            <div>
              <h5 className="mb-0">{projects.filter(p => p.status === 'active').length}</h5>
              <small className="text-muted">Active Projects</small>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning fs-4 me-3" />
            <div>
              <h5 className="mb-0">{projects.filter(p => new Date(p.deadline) < new Date() && p.status !== 'completed').length}</h5>
              <small className="text-muted">Behind Schedule</small>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Card>
    <Card.Header>
      <Row>
        <Col>
          <Card.Title>Project List</Card.Title>
        </Col>
        <Col className="text-end">
          <Form.Select style={{ width: 'auto', display: 'inline-block' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Projects</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="planned">Planned</option>
            <option value="delayed">Delayed</option>
          </Form.Select>
        </Col>
      </Row>
    </Card.Header>
    <Card.Body>
      <Table responsive hover>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Progress</th>
            <th>Budget</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Team Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map(project => (
            <tr key={project.id}>
              <td className="fw-bold">{project.name}</td>
              <td>
                <div className="d-flex align-items-center">
                  <ProgressBar now={project.progress} label={`${project.progress}%`} style={{ width: '100px' }} className="me-2" />
                  <small>{project.progress}%</small>
                </div>
              </td>
              <td>${project.budget.toLocaleString()}</td>
              <td>{new Date(project.deadline).toLocaleDateString()}</td>
              <td>{getStatusBadge(project.status)}</td>
              <td>{project.team} members</td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(project)}>
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
                <Button variant="outline-danger" size="sm" className="me-1" onClick={() => handleDelete(project.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
                <Button variant="outline-success" size="sm">
                  <FontAwesomeIcon icon={faEye} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>

  <Modal show={showModal} onHide={() => setShowModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>{selectedProject ? 'Edit Project' : 'New Project'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Project Name</Form.Label>
          <Form.Control
            type="text"
            value={newProject.name}
            onChange={(e) => setNewProject({...newProject, name: e.target.value})}
            placeholder="Enter project name"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Budget ($)</Form.Label>
          <Form.Control
            type="number"
            value={newProject.budget}
            onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
            placeholder="Enter budget"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Deadline</Form.Label>
          <Form.Control
            type="date"
            value={newProject.deadline}
            onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={newProject.status}
            onChange={(e) => setNewProject({...newProject, status: e.target.value})}
          >
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </Form.Select>
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Save Project
      </Button>
    </Modal.Footer>
  </Modal>
</div>
);
};

export default ProjectDashboard;
