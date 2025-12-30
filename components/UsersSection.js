// components/UsersSection.js
import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Badge,
  Tooltip,
  Popconfirm,
  Card,
  message,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'

export default function UsersSection() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [users, setUsers] = useState([])
  const [fetching, setFetching] = useState(true)

  /* =========================
     AUTH / ROLE GUARD
     ========================= */
  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      message.error('Geen toegang tot gebruikersbeheer')
      router.replace('/admin/dashboard')
    }
  }, [user, loading, router])

  /* =========================
     DATA FETCH (API)
     ========================= */
  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return

    async function fetchUsers() {
      try {
        setFetching(true)

        // 🔒 Verwacht backend endpoint (service-role)
        const res = await fetch('/api/admin/users')
        if (!res.ok) throw new Error('Users ophalen mislukt')

        const data = await res.json()
        setUsers(data || [])
      } catch (e) {
        message.error('Kon gebruikers niet laden')
      } finally {
        setFetching(false)
      }
    }

    fetchUsers()
  }, [user])

  /* =========================
     TABLE DEFINITIE
     ========================= */
  const columns = [
    {
      title: 'Naam',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.full_name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          SUPER_ADMIN: 'red',
          ADMIN: 'blue',
          PROJECT_MANAGER: 'green',
          VIEWER: 'default',
        }
        return <Tag color={colors[role] || 'default'}>{role}</Tag>
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Badge
          status={active ? 'success' : 'default'}
          text={active ? 'Actief' : 'Inactief'}
        />
      ),
    },
    {
      title: 'Laatste login',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (v) => (v ? new Date(v).toLocaleString('nl-NL') : '—'),
    },
    {
      title: 'Acties',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Bewerken">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => router.push(`/admin/users/${record.id}`)}
            />
          </Tooltip>

          <Tooltip title="Wachtwoord resetten">
            <Button icon={<LockOutlined />} size="small" />
          </Tooltip>

          <Popconfirm
            title="Gebruiker definitief verwijderen?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Verwijderen">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  /* =========================
     DELETE HANDLER
     ========================= */
  async function handleDelete(userId) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error()

      setUsers((prev) => prev.filter((u) => u.id !== userId))
      message.success('Gebruiker verwijderd')
    } catch {
      message.error('Verwijderen mislukt')
    }
  }

  /* =========================
     RENDER
     ========================= */
  if (loading || fetching) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Card
      title="Gebruikersbeheer"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/admin/users/new')}
        >
          Nieuwe gebruiker
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  )
}
