const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export function getToken() {
  return localStorage.getItem('token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
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

function mergeMessageLists(...lists) {
  const byId = new Map()
  const unlabeled = []
  for (const list of lists) {
    for (const message of list || []) {
      if (message?.id) {
        if (!byId.has(message.id)) byId.set(message.id, message)
      } else if (message) {
        unlabeled.push(message)
      }
    }
  }
  return [...byId.values(), ...unlabeled].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : NaN
    const tb = b.createdAt ? Date.parse(b.createdAt) : NaN
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0
    if (Number.isNaN(ta)) return 1
    if (Number.isNaN(tb)) return -1
    return ta - tb
  })
}

export async function getMessages(agentId) {
  const id = encodeURIComponent(agentId)
  if (agentId !== 'warroom') {
    return apiFetch(`/api/message/${id}`)
  }

  let warroomMessages = []
  let warroomError = null
  try {
    const primary = await apiFetch(`/api/message/${id}`)
    warroomMessages = primary.messages || []
  } catch (err) {
    warroomError = err
  }

  try {
    const extra = await apiFetch('/api/message/chief-of-staff')
    return { messages: mergeMessageLists(warroomMessages, extra.messages) }
  } catch {
    if (warroomError) throw warroomError
    return { messages: warroomMessages }
  }
}

export function toApiAgentId(agentId) {
  return agentId === 'warroom' ? 'chief-of-staff' : agentId
}
