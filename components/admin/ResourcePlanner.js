import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Form, Modal, Badge, ProgressBar, Dropdown } from 'react-bootstrap';
import { Gantt, Task, EventOption, StylingOption, ViewMode, DisplayOption } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus, faCalendarAlt, faFilter, faEdit, faTrash, faSave, faChartBar } from '@fortawesome/free-solid-svg-icons';

const ResourcePlanner = () => {
const [resources, setResources] = useState([]);
const [projects, setProjects] = useState([]);
const [showModal, setShowModal] = useState(false);
const [selectedResource, setSelectedResource] = useState(null);
const [newResource, setNewResource] = useState({
name: '',
role: 'Developer',
department: 'Engineering',
allocation: 100,
skills: [],
currentProject: ''
});
const [skillInput, setSkillInput] = useState('');
const [viewMode, setViewMode] = useState(ViewMode.Day);

const initialResources = [
{ id: 1, name: 'John Smith', role: 'Senior Developer', department: 'Engineering', allocation: 80, skills: ['React', 'Node.js', 'AWS'], currentProject: 'Website Redesign', availability: 'high' },
{ id: 2, name: 'Sarah Johnson', role: 'Project Manager', department: 'Management', allocation: 100, skills: ['Agile', 'Scrum', 'Budgeting'], currentProject: 'Mobile App Launch', availability: 'medium' },
{ id: 3, name: 'Mike Chen', role: 'UX Designer', department: 'Design', allocation: 60, skills: ['Figma', 'UI/UX', 'Prototyping'], currentProject: 'Website Redesign', availability: 'high' },
{ id: 4, name: 'Emily Davis', role: 'DevOps Engineer', department: 'Engineering', allocation: 90, skills: ['Docker', 'Kubernetes', 'CI/CD'], currentProject: 'Infrastructure Upgrade', availability: 'low' },
{ id: 5, name: 'Robert Wilson', role: 'Marketing Specialist', department: 'Marketing', allocation: 70, skills: ['SEO', 'Content', 'Analytics'], currentProject: 'Marketing Campaign', availability: 'medium' },
];

const initialProjects = [
{ id: 1, name: 'Website Redesign', start: new Date(2023, 10, 1), end: new Date(2023, 11, 15), progress: 75 },
{ id: 2, name: 'Mobile App Launch', start: new Date(2023, 10, 15), end: new Date(2024, 1, 28), progress: 30 },
{ id: 3, name: 'Infrastructure Upgrade', start: new Date(2023, 11, 1), end: new Date(2024, 2, 15), progress: 45 },
];

const ganttTasks = projects.map(project => ({
start: project.start,
end: project.end,
name: project.name,
id: Project-${project.id},
type: 'task',
progress: project.progress,
isDisabled: false,
styles: { progressColor: '#ff9f0a', progressSelectedColor: '#ff9f0a' }
}));

useEffect(() => {
setResources(initialResources);
setProjects(initialProjects);
}, []);

const handleAddSkill = () => {
if (skillInput.trim() && !newResource.skills.includes(skillInput.trim())) {
setNewResource({
...newResource,
skills: [...newResource.skills, skillInput.trim()]
});
setSkillInput('');
}
};

const handleRemoveSkill = (skillToRemove) => {
setNewResource({
...newResource,
skills: newResource.skills.filter(skill => skill !== skillToRemove)
});
};

const handleSaveResource = () => {
if (selectedResource) {
setResources(resources.map(r => r.id === selectedResource.id ? newResource : r));
} else {
const id = Math.max(...resources.map(r => r.id)) + 1;
setResources([...resources, { ...newResource, id, availability: 'high' }]);
}
setShowModal(false);
setSelectedResource(null);
setNewResource({ name: '', role: 'Developer', department: 'Engineering', allocation: 100, skills: [], currentProject: '' });
setSkillInput('');
};

const handleEdit = (resource) => {
setSelectedResource(resource);
setNewResource(resource);
setShowModal(true);
};

const handleDelete = (id) => {
if (window.confirm('Are you sure you want to remove this resource?')) {
setResources(resources.filter(r => r.id !== id));
}
};

const getAvailabilityBadge = (availability) => {
switch (availability) {
case 'high': return <Badge bg="success">High</Badge>;
case 'medium': return <Badge bg="warning">Medium</Badge>;
case 'low': return <Badge bg="danger">Low</Badge>;
default: return <Badge bg="secondary">Unknown</Badge>;
}
};

const getAllocationColor = (allocation) => {
if (allocation >= 90) return 'danger';
if (allocation >= 75) return 'warning';
return 'success';
};

const totalResources = resources.length;
const avgAllocation = resources.reduce((sum, r) => sum + r.allocation, 0) / totalResources;
const highAvailability = resources.filter(r => r.availability === 'high').length;

return (
<div className="resource-planner">
<Row className="mb-4">
<Col>
<h2>Resource Planner</h2>
<p className="text-muted">Manage team allocation, skills, and project assignments</p>
</Col>
<Col className="text-end">
<Button variant="primary" onClick={() => setShowModal(true)}>
<FontAwesomeIcon icon={faUserPlus} className="me-2" />
Add Resource
</Button>
</Col>
</Row>

text
  <Row className="mb-4">
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faUsers} className="text-primary fs-1 mb-2" />
          <h3>{totalResources}</h3>
          <Card.Text className="text-muted">Total Resources</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faChartBar} className="text-info fs-1 mb-2" />
          <h3>{avgAllocation.toFixed(0)}%</h3>
          <Card.Text className="text-muted">Avg. Allocation</Card.Text>
          <ProgressBar now={avgAllocation} variant={getAllocationColor(avgAllocation)} />
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faCalendarAlt} className="text-success fs-1 mb-2" />
          <h3>{highAvailability}</h3>
          <Card.Text className="text-muted">High Availability</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faFilter} className="text-warning fs-1 mb-2" />
          <h3>{resources.filter(r => r.allocation < 100).length}</h3>
          <Card.Text className="text-muted">Available for New Projects</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Row className="mb-4">
    <Col>
      <Card>
        <Card.Header>
          <Row>
            <Col>
              <Card.Title>Project Timeline</Card.Title>
            </Col>
            <Col className="text-end">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  View: {viewMode}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setViewMode(ViewMode.Hour)}>Hour</Dropdown.Item>
                  <Dropdown.Item onClick={() => setViewMode(ViewMode.Day)}>Day</Dropdown.Item>
                  <Dropdown.Item onClick={() => setViewMode(ViewMode.Week)}>Week</Dropdown.Item>
                  <Dropdown.Item onClick={() => setViewMode(ViewMode.Month)}>Month</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <div style={{ height: '300px', overflow: 'auto' }}>
            <Gantt
              tasks={ganttTasks}
              viewMode={viewMode}
              listCellWidth=""
              columnWidth={80}
            />
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Row>
    <Col>
      <Card>
        <Card.Header>
          <Card.Title>Resource Allocation</Card.Title>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Skills</th>
                <th>Current Project</th>
                <th>Allocation</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(resource => (
                <tr key={resource.id}>
                  <td className="fw-bold">{resource.name}</td>
                  <td>{resource.role}</td>
                  <td><Badge bg="secondary">{resource.department}</Badge></td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {resource.skills.map((skill, index) => (
                        <Badge key={index} bg="light" text="dark" className="border">{skill}</Badge>
                      ))}
                    </div>
                  </td>
                  <td>{resource.currentProject}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <ProgressBar 
                        now={resource.allocation} 
                        style={{ width: '100px' }} 
                        className="me-2"
                        variant={getAllocationColor(resource.allocation)}
                      />
                      <small>{resource.allocation}%</small>
                    </div>
                  </td>
                  <td>{getAvailabilityBadge(resource.availability)}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(resource)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(resource.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{selectedResource ? 'Edit Resource' : 'Add New Resource'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={newResource.name}
              onChange={(e) => setNewResource({...newResource, name: e.target.value})}
              placeholder="Enter full name"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              value={newResource.role}
              onChange={(e) => setNewResource({...newResource, role: e.target.value})}
            >
              <option>Developer</option>
              <option>Senior Developer</option>
              <option>Project Manager</option>
              <option>UX Designer</option>
              <option>DevOps Engineer</option>
              <option>Marketing Specialist</option>
              <option>QA Engineer</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Select
              value={newResource.department}
              onChange={(e) => setNewResource({...newResource, department: e.target.value})}
            >
              <option>Engineering</option>
              <option>Design</option>
              <option>Marketing</option>
              <option>Management</option>
              <option>Operations</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Allocation (%)</Form.Label>
            <Form.Control
              type="range"
              min="0"
              max="100"
              value={newResource.allocation}
              onChange={(e) => setNewResource({...newResource, allocation: parseInt(e.target.value)})}
            />
            <div className="text-center mt-1">{newResource.allocation}%</div>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <Form.Label>Skills</Form.Label>
        <div className="d-flex mb-2">
          <Form.Control
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add a skill"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
          />
          <Button variant="outline-secondary" onClick={handleAddSkill} className="ms-2">
            Add
          </Button>
        </div>
        <div className="d-flex flex-wrap gap-1">
          {newResource.skills.map((skill, index) => (
            <Badge key={index} bg="light" text="dark" className="border p-2 d-flex align-items-center">
              {skill}
              <Button variant="link" size="sm" className="text-danger p-0 ms-1" onClick={() => handleRemoveSkill(skill)}>
                ×
              </Button>
            </Badge>
          ))}
        </div>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Current Project</Form.Label>
        <Form.Select
          value={newResource.currentProject}
          onChange={(e) => setNewResource({...newResource, currentProject: e.target.value})}
        >
          <option value="">Select a project</option>
          <option>Website Redesign</option>
          <option>Mobile App Launch</option>
          <option>Infrastructure Upgrade</option>
          <option>Marketing Campaign</option>
          <option>CRM Migration</option>
        </Form.Select>
      </Form.Group>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSaveResource}>
        <FontAwesomeIcon icon={faSave} className="me-2" />
        Save Resource
      </Button>
    </Modal.Footer>
  </Modal>
</div>
);
};

export default ResourcePlanner;
