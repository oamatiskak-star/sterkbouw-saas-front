export default function FormLayout({ title, children }) {
  return (
    <section style={{ maxWidth: 900 }}>
      {title && <h1 style={{ marginBottom: 24 }}>{title}</h1>}
      <div className="sb-form-grid">{children}</div>
    </section>
  )
}
