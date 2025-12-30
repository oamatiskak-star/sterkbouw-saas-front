// components/ReportsSection.js
import { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  DatePicker,
  Space,
  Spin,
  message,
} from 'antd'
import {
  DownloadOutlined,
  PrinterOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'

const { RangePicker } = DatePicker
const { Option } = Select

export default function ReportsSection() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [period, setPeriod] = useState('monthly')
  const [fetching, setFetching] = useState(false)

  /* =========================
     ROLE GUARD
     ========================= */
  useEffect(() => {
    if (!loading && (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role))) {
      message.error('Geen toegang tot rapportages')
      router.replace('/admin/dashboard')
    }
  }, [user, loading, router])

  /* =========================
     HANDLERS (PLACEHOLDERS)
     ========================= */
  const handleExport = async () => {
    try {
      setFetching(true)
      message.info('Export wordt voorbereid')
      // Verwacht backend endpoint:
      // GET /api/admin/reports/export
    } catch {
      message.error('Export mislukt')
    } finally {
      setFetching(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  /* =========================
     LOADING STATE
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
    <Card
      title="Rapportages"
      extra={
        <Space>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 130 }}
          >
            <Option value="daily">Dagelijks</Option>
            <Option value="weekly">Wekelijks</Option>
            <Option value="monthly">Maandelijks</Option>
            <Option value="yearly">Jaarlijks</Option>
          </Select>

          <RangePicker />

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Exporteren
          </Button>

          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Printen
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Projectvoortgang">
            <div
              style={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888',
              }}
            >
              <LineChartOutlined style={{ fontSize: 64 }} />
              <div style={{ marginLeft: 16 }}>
                <h3>Projectvoortgang</h3>
                <p>
                  Grafieken en KPI’s worden hier geladen vanuit
                  backend-rapportages
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}
