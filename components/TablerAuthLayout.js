import Head from 'next/head'

export default function TablerAuthLayout({ children }) {
  return (
    <>
      <Head>
        <title>SterkBouw – Inloggen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="page page-center"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f7fb',
        }}
      >
        <div className="container-tight py-4" style={{ maxWidth: 420 }}>
          <div className="card card-md shadow-sm">
            <div className="card-body">
              <h2 className="h2 text-center mb-2">Welkom terug</h2>
              <p className="text-muted text-center mb-4">
                Log in om verder te gaan
              </p>

              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
