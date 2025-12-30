import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

const AuditTrail = ({ auditLogs = [] }) => {
  // Mock data if none provided
  const logs = auditLogs.length > 0 ? auditLogs : [
    {
      id: 1,
      action: 'DOCUMENT_CREATED',
      documentName: 'Project Plan.pdf',
      user: 'John Doe',
      timestamp: '2024-01-15 10:30:00',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      action: 'DOCUMENT_UPDATED',
      documentName: 'Budget Overview.xlsx',
      user: 'Jane Smith',
      timestamp: '2024-01-15 11:45:00',
      ipAddress: '192.168.1.101'
    },
    {
      id: 3,
      action: 'DOCUMENT_DELETED',
      documentName: 'Old Specifications.doc',
      user: 'Bob Johnson',
      timestamp: '2024-01-14 09:15:00',
      ipAddress: '192.168.1.102'
    },
    {
      id: 4,
      action: 'DOCUMENT_VIEWED',
      documentName: 'Safety Protocol.pdf',
      user: 'Alice Brown',
      timestamp: '2024-01-14 14:20:00',
      ipAddress: '192.168.1.103'
    }
  ];

  const getActionColor = (action) => {
    switch (action) {
      case 'DOCUMENT_CREATED':
        return 'success';
      case 'DOCUMENT_UPDATED':
        return 'info';
      case 'DOCUMENT_DELETED':
        return 'error';
      case 'DOCUMENT_VIEWED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Audit Trail
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Document</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Chip 
                    label={log.action.replace('_', ' ')}
                    color={getActionColor(log.action)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.documentName}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>{log.ipAddress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditTrail;
