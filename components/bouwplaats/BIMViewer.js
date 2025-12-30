export default function BIMViewer() {
  return (
    <div style={{ padding: '20px', background: '#e2e3e5', borderRadius: '8px', marginBottom: '20px', border: '1px solid #d6d8db' }}>
      <h3>BIM Viewer</h3>
      <p>Bekijk 3D modellen van het bouwproject.</p>
      <div style={{ height: '300px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>🏗️</div>
          <div>3D Model Viewer</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={{ flex: 1, padding: '10px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}>
          Laad Model
        </button>
        <button style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
          Metingen
        </button>
        <button style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
          Annotaties
        </button>
      </div>
    </div>
  );
}
