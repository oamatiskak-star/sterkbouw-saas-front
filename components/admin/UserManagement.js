import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Form, Modal, Badge, InputGroup, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus, faUserEdit, faKey, faEnvelope, faPhone, faCalendarAlt, faChartBar, faFilter, faBan, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const UserManagement = () => {
const [users, setUsers] = useState([]);
const [filteredUsers, setFilteredUsers] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [selectedRole, setSelectedRole] = useState('all');
const [showModal, setShowModal] = useState(false);
const [showPasswordModal, setShowPasswordModal] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [newUser, setNewUser] = useState({
name: '',
email: '',
role: 'User',
department: 'Engineering',
status: 'active',
joinDate: new Date().toISOString().split('T')[0]
});
const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

const initialUsers = [
{ id: 1, name: 'John Smith', email: 'john.smith@company.com', role: 'Admin', department: 'Engineering', status: 'active', lastLogin: '2023-11-15 14:30', joinDate: '2023-01-15' },
{ id: 2, name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'Project Manager', department: 'Management', status: 'active', lastLogin: '2023-11-15 09:15', joinDate: '2023-02-20' },
{ id: 3, name: 'Mike Chen', email: 'mike.chen@company.com', role: 'Designer', department: 'Design', status: 'active', lastLogin: '2023-11-14 16:45', joinDate: '2023-03-10' },
{ id: 4, name: 'Emily Davis', email: 'emily.d@company.com', role: 'Developer', department: 'Engineering', status: 'inactive', lastLogin: '2023-10-30 11:20', joinDate: '2023-04-05' },
{ id: 5, name: 'Robert Wilson', email: 'robert.w@company.com', role: 'Analyst', department: 'Marketing', status: 'active', lastLogin: '2023-11-15 10:00', joinDate: '2023-05-12' },
{ id: 6, name: 'Lisa Brown', email: 'lisa.b@company.com', role: 'Viewer', department: 'Operations', status: 'pending', lastLogin: 'Never', joinDate: '2023-11-01' },
{ id: 7, name: 'David Lee', email: 'david.lee@company.com', role: 'Developer', department: 'Engineering', status: 'active', lastLogin: '2023-11-15 08:45', joinDate: '2023-06-18' },
{ id: 8, name: 'Alex Garcia', email: 'alex.g@company.com', role: 'Admin', department: 'IT', status: 'active', lastLogin: '2023-11-14 17:30', joinDate: '2023-07-22' },
];

useEffect(() => {
setUsers(initialUsers);
setFilteredUsers(initialUsers);
}, []);

useEffect(() => {
let result = users;

text
if (searchTerm) {
  result = result.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

if (selectedRole !== 'all') {
  result = result.filter(user => user.role === selectedRole);
}

setFilteredUsers(result);
}, [searchTerm, selectedRole, users]);

const getStatusBadge = (status) => {
switch (status) {
case 'active': return <Badge bg="success">Active</Badge>;
case 'inactive': return <Badge bg="secondary">Inactive</Badge>;
case 'pending': return <Badge bg="warning">Pending</Badge>;
case 'suspended': return <Badge bg="danger">Suspended</Badge>;
default: return <Badge bg="light">Unknown</Badge>;
}
};

const getRoleBadge = (role) => {
const colors = {
'Admin': 'danger',
'Project Manager': 'primary',
'Developer': 'info',
'Designer': 'warning',
'Analyst': 'success',
'Viewer': 'secondary'
};
return <Badge bg={colors[role] || 'light'}>{role}</Badge>;
};

const handleSaveUser = () => {
if (selectedUser) {
setUsers(users.map(u => u.id === selectedUser.id ? newUser : u));
} else {
const id = Math.max(...users.map(u => u.id)) + 1;
setUsers([...users, { ...newUser, id }]);
}
setShowModal(false);
setSelectedUser(null);
setNewUser({ name: '', email: '', role: 'User', department: 'Engineering', status: 'active', joinDate: new Date().toISOString().split('T')[0] });
};

const handleEdit = (user) => {
setSelectedUser(user);
setNewUser(user);
setShowModal(true);
};

const handlePasswordReset = (user) => {
setSelectedUser(user);
setPasswordData({ newPassword: '', confirmPassword: '' });
setShowPasswordModal(true);
};

const handleStatusToggle = (userId, currentStatus) => {
const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
setUsers(users.map(user =>
user.id === userId ? { ...user, status: newStatus } : user
));
};

const handleResetPassword = () => {
if (passwordData.newPassword !== passwordData.confirmPassword) {
alert('Passwords do not match!');
return;
}
alert(Password for ${selectedUser.name} has been reset successfully!);
setShowPasswordModal(false);
setPasswordData({ newPassword: '', confirmPassword: '' });
setSelectedUser(null);
};

const roles = ['all', ...new Set(users.map(user => user.role))];
const departments = [...new Set(users.map(user => user.department))];

const stats = {
total: users.length,
active: users.filter(u => u.status === 'active').length,
admins: users.filter(u => u.role === 'Admin').length,
newThisMonth: users.filter(u => new Date(u.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
};

return (
<div className="user-management">
<Row className="mb-4">
<Col>
<h2>User Management</h2>
<p className="text-muted">Manage team members, roles, and permissions</p>
</Col>
<Col className="text-end">
<Button variant="primary" onClick={() => setShowModal(true)}>
<FontAwesomeIcon icon={faUserPlus} className="me-2" />
Add User
</Button>
</Col>
</Row>

text
  <Row className="mb-4">
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faUsers} className="text-primary fs-1 mb-2" />
          <h3>{stats.total}</h3>
          <Card.Text className="text-muted">Total Users</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-1 mb-2" />
          <h3>{stats.active}</h3>
          <Card.Text className="text-muted">Active Users</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faKey} className="text-danger fs-1 mb-2" />
          <h3>{stats.admins}</h3>
          <Card.Text className="text-muted">Administrators</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faChartBar} className="text-warning fs-1 mb-2" />
          <h3>{stats.newThisMonth}</h3>
          <Card.Text className="text-muted">New This Month</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  <Row className="mb-4">
    <Col>
      <Card>
        <Card.Header>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faFilter} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search users by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  Role: {selectedRole === 'all' ? 'All' : selectedRole}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {roles.map(role => (
                    <Dropdown.Item 
                      key={role} 
                      onClick={() => setSelectedRole(role)}
                      active={selectedRole === role}
                    >
                      {role === 'all' ? 'All Roles' : role}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="fw-bold">{user.name}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2 text-muted" />
                      {user.email}
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <Badge bg="light" text="dark" className="border">
                      {user.department}
                    </Badge>
                  </td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    <small>
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                      {user.lastLogin}
                    </small>
                  </td>
                  <td>{user.joinDate}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(user)}>
                      <FontAwesomeIcon icon={faUserEdit} />
                    </Button>
                    <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handlePasswordReset(user)}>
                      <FontAwesomeIcon icon={faKey} />
                    </Button>
                    <Button 
                      variant={user.status === 'active' ? 'outline-danger' : 'outline-success'} 
                      size="sm"
                      onClick={() => handleStatusToggle(user.id, user.status)}
                    >
                      <FontAwesomeIcon icon={user.status === 'active' ? faBan : faCheckCircle} />
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

  <Modal show={showModal} onHide={() => setShowModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>{selectedUser ? 'Edit User' : 'Add New User'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="Enter full name"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="Enter email"
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option>User</option>
                <option>Admin</option>
                <option>Project Manager</option>
                <option>Developer</option>
                <option>Designer</option>
                <option>Analyst</option>
                <option>Viewer</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select
                value={newUser.department}
                onChange={(e) => setNewUser({...newUser, department: e.target.value})}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={newUser.status}
            onChange={(e) => setNewUser({...newUser, status: e.target.value})}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </Form.Select>
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSaveUser}>
        {selectedUser ? 'Update User' : 'Create User'}
      </Button>
    </Modal.Footer>
  </Modal>

  <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>Reset Password for {selectedUser?.name}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            placeholder="Enter new password"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            placeholder="Confirm new password"
          />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleResetPassword}>
        Reset Password
      </Button>
    </Modal.Footer>
  </Modal>
</div>
);
};

export default UserManagement;
