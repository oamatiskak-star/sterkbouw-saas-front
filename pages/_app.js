import "../styles/global.css"
import Layout from "../components/Layout"
import { useRouter } from "next/router"

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const path = router.pathname
  const active = path.split("/")[1]

  return (
    <Layout active={active}>
      <Component {...pageProps} />
    </Layout>
  )
}
