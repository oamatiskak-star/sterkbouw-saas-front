export default function MaterialScanner() {
  return (
    <div style={{ padding: '20px', background: '#d1ecf1', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bee5eb' }}>
      <h3>Materiaal Scanner</h3>
      <p>Scan materialen met QR/barcode.</p>
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <div style={{ width: '200px', height: '200px', margin: '0 auto', background: 'linear-gradient(45deg, #007bff, #0056b3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'white', fontSize: '24px' }}>📱 Scan Area</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          Start Scanner
        </button>
        <button style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
          Handmatig Invoeren
        </button>
      </div>
    </div>
  );
}
