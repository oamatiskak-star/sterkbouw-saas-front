import Head from "next/head";

export default function BouwplaatsAppIndex() {
  return (
    <>
      <Head>
        <title>Bouwplaats App – SterkBouw</title>
        <meta
          name="description"
          content="De Bouwplaats App draait in een aparte applicatie. Bekijk de broncode via GitHub."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fa",
          padding: 40,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            background: "#ffffff",
            borderRadius: 12,
            padding: 40,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ fontSize: 28, marginBottom: 16 }}>
            Bouwplaats App
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
            De Bouwplaats App draait in een aparte applicatie en is bewust
            losgekoppeld van het web-dashboard.
            <br />
            <br />
            De volledige implementatie is te vinden in de aparte repository.
          </p>

          <a
            href="https://github.com/oamatiskak-star/bouwplaatsweb/blob/main/pages/bouwplaatsApp/index.js"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 20px",
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Bekijk Bouwplaats App op GitHub
          </a>
        </div>
      </div>
    </>
  );
}
