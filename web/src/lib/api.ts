export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function gql<T = any>(query: string, variables?: any, token?: string) {
  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  
  return json.data as T
}
