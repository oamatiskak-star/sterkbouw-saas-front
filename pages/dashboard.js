export default function Dashboard() {
  return (
    <div className="dashboard-grid">

      <a className="card" href="/workspace?action=calculaties:bouw">
        Start bouwcalculatie
      </a>

      <a className="card" href="/workspace?action=calculaties:ew">
        Start E en W calculatie
      </a>

      <a className="card" href="/workspace?action=architecten:bouwtekening">
        Genereer bouwtekening
      </a>

      <a className="card" href="/workspace?action=planning:genereer">
        Genereer planning
      </a>

      <a className="card" href="/workspace?action=documenten:upload">
        Upload bestanden
      </a>

    </div>
  )
}
