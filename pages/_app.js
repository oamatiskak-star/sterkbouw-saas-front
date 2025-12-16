import "../styles/global.css"
import Layout from "../components/Layout"
import { useRouter } from "next/router"

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

  /*
    Bepaal actieve sidebar sectie
  */
  const path = router.pathname

  let active = ""

  if (path.startsWith("/dashboard")) active = "dashboard"
  else if (path.startsWith("/projecten")) active = "projecten"
  else if (path.startsWith("/calculaties")) active = "calculaties"
  else if (path.startsWith("/project-ontwikkeling")) active = "project-ontwikkeling"
  else if (path.startsWith("/uploads")) active = "uploads"
  else if (path.startsWith("/bim")) active = "bim"
  else if (path.startsWith("/planning")) active = "planning"
  else if (path.startsWith("/inkoop")) active = "inkoop"
  else if (path.startsWith("/risico")) active = "risico"

  return (
    <Layout active={active}>
      <Component {...pageProps} />
    </Layout>
  )
}
