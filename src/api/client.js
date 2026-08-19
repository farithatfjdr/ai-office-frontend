const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export function getToken() {
  return localStorage.getItem('token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = {
    ...(!isForm && options.body ? { 'Content-Type': 'application/json' } : {}),
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

export async function sendMessage(agentId, content, projectContext = '', thread = '', tools = []) {
  const historyId = thread || agentId
  return apiFetch(`/api/message/${encodeURIComponent(agentId)}`, {
    method: 'POST',
    body: JSON.stringify({
      content,
      projectContext,
      thread: historyId,
      ...(Array.isArray(tools) && tools.length ? { tools } : {}),
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

const TASK_STATUS_TO_UI = {
  todo: 'Todo',
  in_progress: 'In Progress',
  waiting: 'Waiting',
  done: 'Done',
}
const TASK_STATUS_TO_API = {
  Todo: 'todo',
  'In Progress': 'in_progress',
  Waiting: 'waiting',
  Done: 'done',
}
const TASK_PRIORITY_TO_UI = { high: 'High', medium: 'Medium', low: 'Low' }
const TASK_PRIORITY_TO_API = { High: 'high', Medium: 'medium', Low: 'low' }
const PROJECT_STATUS_TO_UI = { active: 'Active', archived: 'Archived' }
const PROJECT_STATUS_TO_API = { Active: 'active', Archived: 'archived' }

function mapEnum(value, table) {
  if (value == null || value === '') return value
  return table[value] || value
}

export function toUiProject(project) {
  if (!project) return project
  return {
    ...project,
    status: mapEnum(project.status, PROJECT_STATUS_TO_UI),
    tasks: project.tasks || 0,
    done: project.done || 0,
  }
}

export function toUiTask(task) {
  if (!task) return task
  return {
    ...task,
    status: mapEnum(task.status, TASK_STATUS_TO_UI),
    priority: mapEnum(task.priority, TASK_PRIORITY_TO_UI),
    due: task.due || 'Unscheduled',
    project: task.project || '',
  }
}

function toApiProjectBody(fields = {}) {
  const body = {}
  if (fields.name !== undefined) body.name = fields.name
  if (fields.agent !== undefined) body.agent = fields.agent
  if (fields.context !== undefined) body.context = fields.context
  if (fields.status !== undefined) body.status = mapEnum(fields.status, PROJECT_STATUS_TO_API)
  return body
}

function toApiTaskBody(fields = {}) {
  const body = {}
  if (fields.title !== undefined) body.title = fields.title
  if (fields.projectId !== undefined) body.projectId = fields.projectId
  if (fields.project !== undefined) body.project = fields.project
  if (fields.agent !== undefined) body.agent = fields.agent
  if (fields.status !== undefined) body.status = mapEnum(fields.status, TASK_STATUS_TO_API)
  if (fields.priority !== undefined) body.priority = mapEnum(fields.priority, TASK_PRIORITY_TO_API)
  if (fields.due !== undefined) {
    body.due = fields.due === 'Unscheduled' || fields.due === '' ? null : fields.due
  }
  return body
}

export async function getProjects() {
  const data = await apiFetch('/api/projects')
  return { projects: (data.projects || []).map(toUiProject) }
}

export async function getProject(id) {
  const data = await apiFetch(`/api/projects/${encodeURIComponent(id)}`)
  return { project: toUiProject(data.project) }
}

export async function createProject(fields) {
  const data = await apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(toApiProjectBody(fields)),
  })
  return { project: toUiProject(data.project) }
}

export async function updateProject(id, fields) {
  const data = await apiFetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(toApiProjectBody(fields)),
  })
  return { project: toUiProject(data.project) }
}

export async function deleteProject(id) {
  return apiFetch(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getTasks() {
  const data = await apiFetch('/api/tasks')
  return { tasks: (data.tasks || []).map(toUiTask) }
}

export async function getTask(id) {
  const data = await apiFetch(`/api/tasks/${encodeURIComponent(id)}`)
  return { task: toUiTask(data.task) }
}

export async function createTask(fields) {
  const data = await apiFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(toApiTaskBody(fields)),
  })
  return { task: toUiTask(data.task) }
}

export async function updateTask(id, fields) {
  const data = await apiFetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(toApiTaskBody(fields)),
  })
  return { task: toUiTask(data.task) }
}

export async function deleteTask(id) {
  return apiFetch(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getFiles() {
  const data = await apiFetch('/api/files')
  return { files: data.files || [] }
}

export async function uploadFile(file) {
  const body = new FormData()
  body.append('file', file)
  const data = await apiFetch('/api/files', { method: 'POST', body })
  return { file: data.file }
}

export async function downloadFile(id, name) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api/files/${encodeURIComponent(id)}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || res.statusText || 'Download failed')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name || 'file'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function getActivity() {
  const data = await apiFetch('/api/activity')
  return { activity: data.activity || [] }
}

export async function getTools() {
  const data = await apiFetch('/api/tools')
  return { tools: data.tools || [] }
}
