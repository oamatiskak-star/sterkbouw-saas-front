import "../styles/global.css"
import Layout from "../components/Layout"
import { useRouter } from "next/router"

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const path = router.pathname

  let active = ""

  if (path.startsWith("/dashboard")) active = "dashboard"
  else if (path.startsWith("/projecten")) active = "projecten"
  else if (path.startsWith("/calculator")) active = "calculaties"
  else if (path.startsWith("/stabu-calculator")) active = "stabu"
  else if (path.startsWith("/fixed-price")) active = "fixed-price"
  else if (path.startsWith("/bim")) active = "bim"
  else if (path.startsWith("/constructeurs")) active = "constructeurs"
  else if (path.startsWith("/ew")) active = "ew"
  else if (path.startsWith("/risico")) active = "risico"
  else if (path.startsWith("/kopersportaal")) active = "kopersportaal"
  else if (path.startsWith("/documenten")) active = "documenten"
  else if (path.startsWith("/uploads")) active = "uploads"
  else if (path.startsWith("/team")) active = "team"
  else if (path.startsWith("/notificaties")) active = "notificaties"
  else if (path.startsWith("/admin")) active = "admin"

  return (
    <Layout active={active}>
      <Component {...pageProps} />
    </Layout>
  )
}
