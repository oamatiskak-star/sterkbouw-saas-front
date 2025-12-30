export default function SafetyInspector() {
  return (
    <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeaa7' }}>
      <h3>Veiligheidsinspectie</h3>
      <p>Voer veiligheidsinspecties uit en documenteer bevindingen.</p>
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, padding: '10px', background: '#d4edda', borderRadius: '4px' }}>
            <strong>Veiligheidsscore</strong>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>92%</div>
          </div>
          <div style={{ flex: 1, padding: '10px', background: '#f8d7da', borderRadius: '4px' }}>
            <strong>Open Issues</strong>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>3</div>
          </div>
        </div>
        <button style={{ marginTop: '10px', padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Start Inspectie
        </button>
      </div>
    </div>
  );
}
