const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL ontbreekt")
}

async function request(method, path, body) {
  try {
    const res = await fetch(API_URL + path, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`API ${method} fout:`, path, text)
      return null
    }

    const contentType = res.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      return await res.json()
    }

    return null
  } catch (err) {
    console.error(`API ${method} exception:`, path, err.message)
    return null
  }
}

export function apiGet(path) {
  return request("GET", path)
}

export async function fetchModule(pageSlug) {
  const res = await apiGet(`/ui/${pageSlug}`)
  if (!res || !res.ok) return null
  return res.components || []
}
