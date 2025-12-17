import "../styles/globals.css"
import TablerLayout from "../components/TablerLayout"

export default function App({ Component, pageProps }) {
  return (
    <TablerLayout>
      <Component {...pageProps} />
    </TablerLayout>
  )
}
