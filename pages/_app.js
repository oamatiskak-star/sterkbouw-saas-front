import "../styles/globals.css"
import "@tabler/core/dist/css/tabler.min.css"
import TablerLayout from "../components/TablerLayout"

export default function MyApp({ Component, pageProps }) {
return (
<TablerLayout>
<Component {...pageProps} />
</TablerLayout>
)
}
