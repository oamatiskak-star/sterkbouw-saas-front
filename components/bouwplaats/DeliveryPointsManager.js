export default function DeliveryPointsManager() {
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Leverpunten Beheer</h3>
      <p>Beheer alle leverpunten op de bouwplaats.</p>
      <div style={{ marginTop: '10px' }}>
        <button style={{ padding: '8px 16px', marginRight: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Nieuw Leverpunt
        </button>
        <button style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          Overzicht
        </button>
      </div>
    </div>
  );
}
