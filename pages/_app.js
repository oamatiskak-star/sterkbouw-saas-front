import "@tabler/core/dist/css/tabler.min.css"
import "@tabler/core/dist/css/tabler-flags.min.css"
import "@tabler/core/dist/css/tabler-payments.min.css"
import "@tabler/core/dist/css/tabler-vendors.min.css"

import TablerLayout from "../components/TablerLayout"

export default function App({ Component, pageProps }) {
  return (
    <TablerLayout>
      <Component {...pageProps} />
    </TablerLayout>
  )
}
