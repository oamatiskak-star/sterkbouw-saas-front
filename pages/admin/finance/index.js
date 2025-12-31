import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
} from '@mui/material'
import { Add, Edit, Delete, Receipt } from '@mui/icons-material'

export default function AdminFinance() {
  const router = useRouter()
  const { user, loading, isAdmin } = useAuth()

  const [financials, setFinancials] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    client: '',
    amount: 0,
    dueDate: '',
    status: 'pending',
  })

  useEffect(() => {
    if (loading) return
    if (!user || !isAdmin) {
      router.push('/auth/login')
      return
    }

    // Mock data – vervangt Redux slice
    setFinancials([
      {
        id: 1001,
        client: 'Project BV',
        amount: 12500,
        dueDate: '2025-01-15',
        status: 'pending',
      },
      {
        id: 1002,
        client: 'Ontwikkeling NV',
        amount: 8420,
        dueDate: '2024-12-20',
        status: 'paid',
      },
    ])
  }, [user, isAdmin, loading, router])

  if (loading || !user) {
    return null
  }

  const handleCreate = () => {
    setFinancials(prev => [
      ...prev,
      {
        id: Date.now(),
        ...newInvoice,
      },
    ])
    setOpenDialog(false)
    setNewInvoice({ client: '', amount: 0, dueDate: '', status: 'pending' })
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Financial Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          New Invoice
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {financials.map(invoice => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.client}</TableCell>
                <TableCell>
                  €{invoice.amount.toLocaleString()}
                </TableCell>
                <TableCell>{invoice.dueDate}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor:
                        invoice.status === 'paid'
                          ? 'success.light'
                          : invoice.status === 'overdue'
                          ? 'error.light'
                          : 'warning.light',
                      color: 'white',
                    }}
                  >
                    {invoice.status}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton>
                    <Receipt />
                  </IconButton>
                  <IconButton>
                    <Edit />
                  </IconButton>
                  <IconButton>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Client"
            fullWidth
            value={newInvoice.client}
            onChange={e =>
              setNewInvoice({ ...newInvoice, client: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Amount (€)"
            type="number"
            fullWidth
            value={newInvoice.amount}
            onChange={e =>
              setNewInvoice({
                ...newInvoice,
                amount: parseInt(e.target.value || '0', 10),
              })
            }
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            value={newInvoice.dueDate}
            onChange={e =>
              setNewInvoice({ ...newInvoice, dueDate: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Status"
            select
            fullWidth
            value={newInvoice.status}
            onChange={e =>
              setNewInvoice({ ...newInvoice, status: e.target.value })
            }
            SelectProps={{ native: true }}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
