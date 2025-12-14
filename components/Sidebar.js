export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        SterkBouw
      </div>

      <nav className="flex-1 p-4 space-y-2 text-sm">
        <Link label="Dashboard" link="/dashboard" />
        <Link label="Projecten" link="/projecten" />
        <Link label="Calculaties" link="/calculator" />
        <Link label="STABU" link="/stabu-calculator" />
        <Link label="Fixed Price" link="/fixed-price" />
        <Link label="BIM" link="/bim" />
        <Link label="Constructeurs" link="/constructeurs" />
        <Link label="E/W" link="/ew" />
        <Link label="Risico" link="/risico" />
        <Link label="Kopersportaal" link="/kopersportaal" />
        <Link label="Documenten" link="/documenten" />
        <Link label="Uploads" link="/uploads" />
        <Link label="Team" link="/team" />
        <Link label="Notificaties" link="/notificaties" />
        <Link label="Instellingen" link="/admin" />
      </nav>
    </aside>
  )
}

function Link({ label, link }) {
  return (
    <a href={link} className="block px-3 py-2 rounded hover:bg-gray-800">
      {label}
    </a>
  )
}
