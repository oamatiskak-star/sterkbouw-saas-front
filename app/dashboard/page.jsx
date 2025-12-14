app/dashboard/Dashboard.jsx

Volledig bestand:

export default function Dashboard() {
return (
<div className="dashboard-grid">

  <div className="card">
    <h3>Project voortgang</h3>
    <p>Breskens, Hilversum, Apeldoorn</p>
  </div>

  <div className="card">
    <h3>Cashflow</h3>
    <p>Overzicht lopende calculaties</p>
  </div>

  <div className="card">
    <h3>Laatste uploads</h3>
    <ul>
      <li>STABU calculatie.xlsx</li>
      <li>BIM model.ifc</li>
      <li>Contract.pdf</li>
    </ul>
  </div>

  <div className="card">
    <h3>Open acties</h3>
    <ul>
      <li>Calculatie afronden</li>
      <li>Risico analyse check</li>
      <li>Document uploaden</li>
    </ul>
  </div>

</div>


)
}
