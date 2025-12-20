<form onSubmit={(e) => e.preventDefault()}>

  <div style={{ marginBottom: 24 }}>
    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="checkbox"
        checked={facturatieGegevens}
        onChange={(e) => setFacturatieGegevens(e.target.checked)}
      />
      Facturatiegegevens kopiëren van projectadres
    </label>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 32,
      maxWidth: 900
    }}
  >

    {/* LINKER KOLOM – PROJECT */}
    <div>
      <h3 style={{ marginBottom: 16 }}>Projectgegevens</h3>

      <Field label="Naam opdrachtgever">
        <input value={naamOpdrachtgever} onChange={e => setNaamOpdrachtgever(e.target.value)} />
      </Field>

      <Field label="Omschrijving">
        <input value={omschrijving} onChange={e => setOmschrijving(e.target.value)} />
      </Field>

      <Field label="Adres">
        <input value={adres} onChange={e => setAdres(e.target.value)} />
      </Field>

      <Field label="Postcode">
        <input value={postcode} onChange={e => setPostcode(e.target.value)} />
      </Field>

      <Field label="Plaatsnaam">
        <input value={plaatsnaam} onChange={e => setPlaatsnaam(e.target.value)} />
      </Field>

      <Field label="Land">
        <select value={land} onChange={e => setLand(e.target.value)}>
          <option>Nederland</option>
          <option>België</option>
          <option>Duitsland</option>
        </select>
      </Field>

      <Field label="Telefoon">
        <input value={telefoon} onChange={e => setTelefoon(e.target.value)} />
      </Field>

      <Field label="Projecttype">
        <select value={projectType} onChange={e => setProjectType(e.target.value)}>
          <option>Nieuwbouw</option>
          <option>Utiliteitsbouw</option>
          <option>Transformatie</option>
          <option>Renovatie</option>
        </select>
      </Field>

      <Field label="Opmerking">
        <input value={opmerking} onChange={e => setOpmerking(e.target.value)} />
      </Field>
    </div>

    {/* RECHTER KOLOM – FACTURATIE */}
    <div>
      <h3 style={{ marginBottom: 16 }}>Facturatiegegevens</h3>

      <Field label="Bedrijfsnaam">
        <input value={bedrijfNaam} onChange={e => setBedrijfNaam(e.target.value)} />
      </Field>

      <Field label="Postbus">
        <input value={postbus} onChange={e => setPostbus(e.target.value)} />
      </Field>

      <Field label="Adres">
        <input
          value={adresFacturatie}
          onChange={e => setAdresFacturatie(e.target.value)}
          readOnly={facturatieGegevens}
        />
      </Field>

      <Field label="Postcode">
        <input
          value={postcodeFacturatie}
          onChange={e => setPostcodeFacturatie(e.target.value)}
          readOnly={facturatieGegevens}
        />
      </Field>

      <Field label="Plaatsnaam">
        <input
          value={plaatsnaamFacturatie}
          onChange={e => setPlaatsnaamFacturatie(e.target.value)}
          readOnly={facturatieGegevens}
        />
      </Field>

      <Field label="Land">
        <select
          value={landFacturatie}
          onChange={e => setLandFacturatie(e.target.value)}
          disabled={facturatieGegevens}
        >
          <option>Nederland</option>
          <option>België</option>
          <option>Duitsland</option>
        </select>
      </Field>

      <Field label="Email facturen">
        <input value={emailFacturen} onChange={e => setEmailFacturen(e.target.value)} />
      </Field>

      <Field label="Telefoon kantoor">
        <input value={telefoonKantoor} onChange={e => setTelefoonKantoor(e.target.value)} />
      </Field>

      <Field label="Projectleider">
        <input value={naamProjectleider} onChange={e => setNaamProjectleider(e.target.value)} />
      </Field>

      <Field label="Tel. projectleider">
        <input value={telefoonProjectleider} onChange={e => setTelefoonProjectleider(e.target.value)} />
      </Field>
    </div>
  </div>

  <div style={{ marginTop: 32 }}>
    <button type="button" onClick={handleStartClick}>
      Start calculatie
    </button>
  </div>
</form>
