// components/Login.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Form, Input, Button, Card, Row, Col, Typography, Alert, Divider } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '@/lib/auth'
import './Login.css'

const { Title, Text } = Typography

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (values) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const result = await login({
        email: values.username,
        password: values.password,
      })

      if (result?.success) {
        router.replace('/admin/dashboard')
      } else {
        setError(result?.error || 'Inloggen mislukt')
      }
    } catch (e) {
      setError('Authenticatie mislukt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={22} sm={18} md={14} lg={10} xl={8}>
          <Card className="login-card" hoverable>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: '#206bc4',
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <LockOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <Title level={2} style={{ marginBottom: 4 }}>
                ProjectPortaal
              </Title>
              <Text type="secondary">
                Beveiligde toegang tot projecten en documentatie
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ marginBottom: 24 }}
              />
            )}

            <Form
              name="login"
              layout="vertical"
              size="large"
              onFinish={handleSubmit}
              autoComplete="on"
            >
              <Form.Item
                name="username"
                label="E-mailadres"
                rules={[
                  { required: true, message: 'Voer uw e-mailadres in' },
                  { type: 'email', message: 'Ongeldig e-mailadres' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="naam@bedrijf.nl"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Wachtwoord"
                rules={[
                  { required: true, message: 'Voer uw wachtwoord in' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Wachtwoord"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  Inloggen
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                © {new Date().getFullYear()} SterkBouw • ProjectPortaal
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
