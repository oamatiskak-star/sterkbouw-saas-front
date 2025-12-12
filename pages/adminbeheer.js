import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Adminbeheer() {
const [gebruikers, setGebruikers] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
const fetchGebruikers = async () => {
const { data, error } = await supabase.from("gebruikers").select("*")
if (error) console.error(error)
setGebruikers(data || [])
setLoading(false)
}
fetchGebruikers()
}, [])

return (
<div>
{loading ? "Gebruikers laden..." : gebruikers.length}
</div>
)
}
