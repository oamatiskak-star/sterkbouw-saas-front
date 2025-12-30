import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Form, Modal, Badge, InputGroup, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFilePdf, faFileWord, faFileExcel, faFileImage, faSearch, faUpload, faDownload, faEdit, faTrash, faFolder, faShareAlt, faCalendarAlt, faUser } from '@fortawesome/free-solid-svg-icons';

const DocumentManager = () => {
const [documents, setDocuments] = useState([]);
const [filteredDocs, setFilteredDocs] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [selectedCategory, setSelectedCategory] = useState('all');
const [showModal, setShowModal] = useState(false);
const [selectedDocument, setSelectedDocument] = useState(null);
const [newDocument, setNewDocument] = useState({
title: '',
category: 'Project',
description: '',
size: '',
tags: []
});
const [tagInput, setTagInput] = useState('');

const initialDocuments = [
{ id: 1, title: 'Project Requirements.pdf', category: 'Project', size: '2.4 MB', uploadDate: '2023-11-15', uploader: 'John Smith', downloads: 42, type: 'pdf', tags: ['requirements', 'specs'] },
{ id: 2, title: 'Budget_2023.xlsx', category: 'Financial', size: '1.8 MB', uploadDate: '2023-11-10', uploader: 'Sarah Johnson', downloads: 38, type: 'excel', tags: ['budget', 'financial'] },
{ id: 3, title: 'Design_Mockups.fig', category: 'Design', size: '4.2 MB', uploadDate: '2023-11-12', uploader: 'Mike Chen', downloads: 56, type: 'image', tags: ['design', 'mockups'] },
{ id: 4, title: 'Meeting_Minutes.docx', category: 'Meeting', size: '0.8 MB', uploadDate: '2023-11-14', uploader: 'Emily Davis', downloads: 24, type: 'word', tags: ['minutes', 'meeting'] },
{ id: 5, title: 'API_Documentation.pdf', category: 'Technical', size: '3.1 MB', uploadDate: '2023-11-08', uploader: 'Robert Wilson', downloads: 89, type: 'pdf', tags: ['api', 'documentation'] },
{ id: 6, title: 'Marketing_Plan.pptx', category: 'Marketing', size: '5.6 MB', uploadDate: '2023-11-05', uploader: 'Lisa Brown', downloads: 31, type: 'word', tags: ['marketing', 'plan'] },
{ id: 7, title: 'Contract_Agreement.pdf', category: 'Legal', size: '1.5 MB', uploadDate: '2023-11-03', uploader: 'David Lee', downloads: 18, type: 'pdf', tags: ['contract', 'legal'] },
{ id: 8, title: 'Infrastructure_Diagram.png', category: 'Technical', size: '2.9 MB', uploadDate: '2023-11-01', uploader: 'Alex Garcia', downloads: 47, type: 'image', tags: ['infrastructure', 'diagram'] },
];

useEffect(() => {
setDocuments(initialDocuments);
setFilteredDocs(initialDocuments);
}, []);

useEffect(() => {
let result = documents;

text
if (searchTerm) {
  result = result.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
}

if (selectedCategory !== 'all') {
  result = result.filter(doc => doc.category === selectedCategory);
}

setFilteredDocs(result);
}, [searchTerm, selectedCategory, documents]);

const getFileIcon = (type) => {
switch (type) {
case 'pdf': return <FontAwesomeIcon icon={faFilePdf} className="text-danger" />;
case 'word': return <FontAwesomeIcon icon={faFileWord} className="text-primary" />;
case 'excel': return <FontAwesomeIcon icon={faFileExcel} className="text-success" />;
case 'image': return <FontAwesomeIcon icon={faFileImage} className="text-warning" />;
default: return <FontAwesomeIcon icon={faFileAlt} className="text-secondary" />;
}
};

const getCategoryBadge = (category) => {
const colors = {
'Project': 'primary',
'Financial': 'success',
'Design': 'warning',
'Meeting': 'info',
'Technical': 'dark',
'Marketing': 'danger',
'Legal': 'secondary'
};
return <Badge bg={colors[category] || 'light'}>{category}</Badge>;
};

const handleUpload = () => {
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.onchange = (e) => {
const file = e.target.files[0];
if (file) {
const newDoc = {
id: documents.length + 1,
title: file.name,
category: newDocument.category,
size: ${(file.size / (1024 * 1024)).toFixed(1)} MB,
uploadDate: new Date().toISOString().split('T')[0],
uploader: 'Current User',
downloads: 0,
type: file.name.split('.').pop(),
tags: newDocument.tags
};
setDocuments([newDoc, ...documents]);
setNewDocument({ title: '', category: 'Project', description: '', size: '', tags: [] });
alert(File "${file.name}" uploaded successfully!);
}
};
fileInput.click();
};

const handleDelete = (id) => {
if (window.confirm('Are you sure you want to delete this document?')) {
setDocuments(documents.filter(doc => doc.id !== id));
}
};

const handleAddTag = () => {
if (tagInput.trim() && !newDocument.tags.includes(tagInput.trim())) {
setNewDocument({
...newDocument,
tags: [...newDocument.tags, tagInput.trim()]
});
setTagInput('');
}
};

const handleRemoveTag = (tagToRemove) => {
setNewDocument({
...newDocument,
tags: newDocument.tags.filter(tag => tag !== tagToRemove)
});
};

const categories = ['all', ...new Set(documents.map(doc => doc.category))];

const stats = {
total: documents.length,
totalSize: documents.reduce((sum, doc) => sum + parseFloat(doc.size), 0).toFixed(1),
pdfCount: documents.filter(doc => doc.type === 'pdf').length,
recentUploads: documents.filter(doc => new Date(doc.uploadDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
};

return (
<div className="document-manager">
<Row className="mb-4">
<Col>
<h2>Document Manager</h2>
<p className="text-muted">Central repository for all project documents and files</p>
</Col>
<Col className="text-end">
<Button variant="primary" onClick={() => setShowModal(true)}>
<FontAwesomeIcon icon={faUpload} className="me-2" />
Upload Document
</Button>
</Col>
</Row>

text
  <Row className="mb-4">
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faFileAlt} className="text-primary fs-1 mb-2" />
          <h3>{stats.total}</h3>
          <Card.Text className="text-muted">Total Documents</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faFolder} className="text-success fs-1 mb-2" />
          <h3>{stats.totalSize} MB</h3>
          <Card.Text className="text-muted">Total Size</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faFilePdf} className="text-danger fs-1 mb-2" />
          <h3>{stats.pdfCount}</h3>
          <Card.Text className="text-muted">PDF Files</Card.Text>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FontAwesomeIcon icon={faCalendarAlt} className="text-warning fs-1 mb-2" />
          <h3>{stats.recentUploads}</h3>
          <Card.Text className="text-muted">Recent (7 days)</Card.Text>
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
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search documents by name, tags, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  Category: {selectedCategory === 'all' ? 'All' : selectedCategory}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {categories.map(category => (
                    <Dropdown.Item 
                      key={category} 
                      onClick={() => setSelectedCategory(category)}
                      active={selectedCategory === category}
                    >
                      {category === 'all' ? 'All Categories' : category}
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
                <th>Category</th>
                <th>Size</th>
                <th>Upload Date</th>
                <th>Uploader</th>
                <th>Downloads</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="me-2 fs-5">
                        {getFileIcon(doc.type)}
                      </span>
                      <div>
                        <div className="fw-bold">{doc.title}</div>
                        {doc.description && <small className="text-muted">{doc.description}</small>}
                      </div>
                    </div>
                  </td>
                  <td>{getCategoryBadge(doc.category)}</td>
                  <td>{doc.size}</td>
                  <td>{doc.uploadDate}</td>
                  <td>
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {doc.uploader}
                  </td>
                  <td>
                    <Badge bg="light" text="dark" className="border">
                      {doc.downloads}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {doc.tags.map((tag, index) => (
                        <Badge key={index} bg="light" text="dark" className="border small">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1">
                      <FontAwesomeIcon icon={faDownload} />
                    </Button>
                    <Button variant="outline-success" size="sm" className="me-1">
                      <FontAwesomeIcon icon={faShareAlt} />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(doc.id)}>
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
      <Modal.Title>Upload New Document</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Document Title</Form.Label>
            <Form.Control
              type="text"
              value={newDocument.title}
              onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
              placeholder="Enter document title"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={newDocument.category}
              onChange={(e) => setNewDocument({...newDocument, category: e.target.value})}
            >
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={newDocument.description}
          onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
          placeholder="Enter document description"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Tags</Form.Label>
        <div className="d-flex mb-2">
          <Form.Control
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button variant="outline-secondary" onClick={handleAddTag} className="ms-2">
            Add
          </Button>
        </div>
        <div className="d-flex flex-wrap gap-1">
          {newDocument.tags.map((tag, index) => (
            <Badge key={index} bg="light" text="dark" className="border p-2 d-flex align-items-center">
              {tag}
              <Button variant="link" size="sm" className="text-danger p-0 ms-1" onClick={() => handleRemoveTag(tag)}>
                ×
              </Button>
            </Badge>
          ))}
        </div>
      </Form.Group>
      <div className="text-center mt-4">
        <Button variant="outline-primary" size="lg" onClick={handleUpload}>
          <FontAwesomeIcon icon={faUpload} className="me-2" />
          Select File to Upload
        </Button>
        <p className="text-muted mt-2">Supported formats: PDF, DOCX, XLSX, PPTX, PNG, JPG</p>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={() => setShowModal(false)}>
        Save Metadata
      </Button>
    </Modal.Footer>
  </Modal>
</div>
);
};

export default DocumentManager;
