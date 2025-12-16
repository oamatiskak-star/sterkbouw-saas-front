const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL ontbreekt")
}

/*
========================
INTERN
========================
*/
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

/*
========================
PUBLIC API
========================
*/
export function apiGet(path) {
  return request("GET", path)
}

export function apiPost(path, body = {}) {
  return request("POST", path, body)
}

export function apiPut(path, body = {}) {
  return request("PUT", path, body)
}

export function apiDelete(path) {
  return request("DELETE", path)
}
