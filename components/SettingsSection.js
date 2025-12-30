// components/SettingsSection.js
import { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Divider,
  Tabs,
  Spin,
  message,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'

const { Option } = Select
const { TabPane } = Tabs

export default function SettingsSection() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [form] = Form.useForm()
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)

  /* =========================
     ROLE GUARD
     ========================= */
  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      message.error('Geen toegang tot systeeminstellingen')
      router.replace('/admin/dashboard')
    }
  }, [user, loading, router])

  /* =========================
     LOAD SETTINGS
     ========================= */
  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return

    async function loadSettings() {
      try {
        setFetching(true)

        // Verwacht backend endpoint:
        // GET /api/admin/settings
        const res = await fetch('/api/admin/settings')
        if (!res.ok) throw new Error()

        const data = await res.json()

        form.setFieldsValue({
          portal_name: data.portal_name,
          timezone: data.timezone,
          language: data.language,
          auto_logout: data.auto_logout,
          two_factor: data.two_factor,
          email_notifications: data.email_notifications,
          contract_notifications: data.contract_notifications,
        })
      } catch {
        message.error('Instellingen konden niet worden geladen')
      } finally {
        setFetching(false)
      }
    }

    loadSettings()
  }, [user, form])

  /* =========================
     SAVE SETTINGS
     ========================= */
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      // Verwacht backend endpoint:
      // PUT /api/admin/settings
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) throw new Error()

      message.success('Instellingen opgeslagen')
    } catch {
      message.error('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  /* =========================
     LOADING
     ========================= */
  if (loading || fetching) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <Card title="Systeeminstellingen">
      <Form form={form} layout="vertical">
        <Tabs defaultActiveKey="general">
          {/* =========================
             ALGEMEEN
             ========================= */}
          <TabPane tab="Algemeen" key="general">
            <Form.Item
              label="Portaalnaam"
              name="portal_name"
              rules={[{ required: true, message: 'Portaalnaam is verplicht' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Tijdzone" name="timezone">
              <Select>
                <Option value="Europe/Amsterdam">Amsterdam (CET)</Option>
                <Option value="UTC">UTC</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Taal" name="language">
              <Select>
                <Option value="nl">Nederlands</Option>
                <Option value="en">English</Option>
              </Select>
            </Form.Item>
          </TabPane>

          {/* =========================
             BEVEILIGING
             ========================= */}
          <TabPane tab="Beveiliging" key="security">
            <Form.Item
              label="Automatisch uitloggen"
              name="auto_logout"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="Twee-factor authenticatie"
              name="two_factor"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </TabPane>

          {/* =========================
             NOTIFICATIES
             ========================= */}
          <TabPane tab="Notificaties" key="notifications">
            <Form.Item
              label="E-mail notificaties"
              name="email_notifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="Contractgoedkeuringen"
              name="contract_notifications"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </TabPane>
        </Tabs>

        <Divider />

        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
        >
          Instellingen opslaan
        </Button>
      </Form>
    </Card>
  )
}
