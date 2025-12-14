export default function ModuleRenderer({ config, data }) {
  if (!config) {
    return <div className="card">Module niet geconfigureerd</div>
  }

  if (!data) {
    return <div className="card">Data laden…</div>
  }

  if (config.type === "list") {
    return (
      <div className="card">
        <h3>{config.title}</h3>
        <ul>
          {data.map((row, i) => (
            <li key={i}>{row.name || JSON.stringify(row)}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (config.type === "tool") {
    return (
      <div className="card">
        <h3>{config.title}</h3>
        <p>Tool actief</p>
      </div>
    )
  }

  if (config.type === "analysis") {
    return (
      <div className="card">
        <h3>{config.title}</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  }

  if (config.type === "portal") {
    return (
      <div className="card">
        <h3>{config.title}</h3>
        <p>Portaal actief</p>
      </div>
    )
  }

  return <div className="card">Onbekend type</div>
}
