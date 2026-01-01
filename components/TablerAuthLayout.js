import Head from 'next/head'

export default function TablerAuthLayout({ children }) {
  return (
    <>
      <Head>
        <title>SterkBouw – Inloggen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page page-center">
        <div className="container container-tight py-4">
          <div className="text-center mb-4">
            <span className="h1">SterkBouw</span>
          </div>

          <div className="card card-md">
            <div className="card-body">
              {children}
            </div>
          </div>

          <div className="text-center text-muted mt-3">
            © {new Date().getFullYear()} SterkBouw
          </div>
        </div>
      </div>
    </>
  )
}
