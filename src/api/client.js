const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export function getToken() {
  return localStorage.getItem('token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed')
  }

  return data
}

export async function login(code) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export async function verifyToken() {
  return apiFetch('/api/auth/verify')
}

export async function sendMessage(agentId, content, projectContext = '', thread = '') {
  const historyId = thread || agentId
  return apiFetch(`/api/message/${encodeURIComponent(agentId)}`, {
    method: 'POST',
    body: JSON.stringify({
      content,
      projectContext,
      thread: historyId,
    }),
  })
}

export async function getMessages(agentId) {
  const id = encodeURIComponent(agentId)
  return apiFetch(`/api/message/${id}?thread=${id}`)
}

export function toApiAgentId(agentId) {
  return agentId === 'warroom' ? 'chief-of-staff' : agentId
}
