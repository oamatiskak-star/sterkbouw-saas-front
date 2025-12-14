import "../styles/global.css"
import "../styles/dashboard.css"
import "../styles/admin.css"

import DashboardLayout from "../components/DashboardLayout"

export default function App({ Component, pageProps }) {
return (
<DashboardLayout>
<Component {...pageProps} />
</DashboardLayout>
)
}
