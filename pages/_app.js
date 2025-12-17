import "../styles/globals.css"
import "@tabler/core/dist/css/tabler.min.css"
import { useState, createContext } from "react"
import TablerLayout from "../components/TablerLayout"
import Sidebar from "../components/Sidebar"

export const AppContext = createContext(null)

export default function MyApp({ Component, pageProps }) {
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  export default function MyApp({ Component, pageProps }) {
return (
<div style={{ display: "flex" }}>
<Sidebar />
<main style={{ flex: 1, padding: 24 }}>
<Component {...pageProps} />
</main>
</div>
)
}

const toggleSidebar = () => {
setSidebarCollapsed(prev => {
const next = !prev
if (typeof window !== "undefined") {
localStorage.setItem("sb-sidebar-collapsed", next ? "1" : "0")
}
return next
})
}

const contextValue = {
sidebarCollapsed,
toggleSidebar,
user: pageProps.user || null,
role: pageProps.role || "admin"
}

return (
<AppContext.Provider value={contextValue}>
<TablerLayout>
<Component {...pageProps} />
</TablerLayout>
</AppContext.Provider>
)
}
