import { getMailAccounts } from "../../lib/mail"

export async function getServerSideProps() {
  const accounts = await getMailAccounts()
  return { props: { accounts } }
}

export default function MailLanding({ accounts }) {
  return (
    <div>
      <h1>Mail</h1>

      <div className="row">
        {accounts.map(acc => (
          <div key={acc.id} className="col-md-4">
            <div className="card">
              <div className="card-body">
                <div className="fw-bold">{acc.label}</div>
                <div className="text-muted">{acc.address}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
