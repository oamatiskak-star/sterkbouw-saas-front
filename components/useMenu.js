import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function useMenu(role = "admin") {
const [menu, setMenu] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
fetch(${API}/api/menu, {
headers: {
"x-role": role
}
})
.then(r => r.json())
.then(data => {
setMenu(Array.isArray(data) ? data : [])
setLoading(false)
})
.catch(() => {
setMenu([])
setLoading(false)
})
}, [role])

return { menu, loading }
}
