import "../styles/global.css"
import "../styles/dashboard.css"
import "../styles/admin.css"
import Layout from "../components/Layout"

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
