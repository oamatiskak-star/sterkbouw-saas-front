import AuditLogTable from "../../components/AuditLogTable"
import { fetchAuditLogs } from "../../lib/auditFetch"

export async function getServerSideProps() {
  const logs = await fetchAuditLogs({ limit: 200 })
  return { props: { logs } }
}

export default function AuditPage({ logs }) {
  return (
    <div>
      <h1 className="mb-4">Audit logs</h1>
      <AuditLogTable logs={logs} />
    </div>
  )
}
