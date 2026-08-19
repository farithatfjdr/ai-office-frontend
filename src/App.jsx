import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  sendMessage, getMessages, toApiAgentId,
  getProjects, getTasks, createProject, createTask,
} from './api/client'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import LeftSidebar from './components/LeftSidebar'
import TopBar from './components/TopBar'
import MainWorkspace from './components/MainWorkspace'
import RightPanel, { RightPanelForceVisible } from './components/RightPanel'
import {
  ActivityView, FilesView, KnowledgeView, ProjectsView, SettingsView, TasksView,
} from './components/Views'
import {
  AGENTS,
  buildInitialMessages,
  INITIAL_ACTIVITY,
  T,
  WARROOM_AGENT,
} from './data/constants'

function OfficeApp() {
  const { logout } = useAuth()
  const [view, setView] = useState({ type: 'warroom' })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileRightOpen, setMobileRightOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [boardError, setBoardError] = useState(null)
  const [activityLog, setActivityLog] = useState(INITIAL_ACTIVITY)
  const [messagesByAgent, setMessagesByAgent] = useState(buildInitialMessages)
  const [sendingAgent, setSendingAgent] = useState(null)
  const chatId = view.type === 'agent' || view.type === 'warroom'
    ? (view.type === 'warroom' ? 'warroom' : view.id)
    : null

  const applyBoardResults = (projectResult, taskResult) => {
    const errors = []
    if (projectResult.status === 'fulfilled') {
      setProjects(projectResult.value.projects || [])
    } else {
      errors.push(`Could not load projects: ${projectResult.reason?.message || projectResult.reason}`)
    }
    if (taskResult.status === 'fulfilled') {
      setTasks(taskResult.value.tasks || [])
    } else {
      errors.push(`Could not load tasks: ${taskResult.reason?.message || taskResult.reason}`)
    }
    setBoardError(errors.join(' ') || null)
  }

  const refreshBoard = async () => {
    const [projectResult, taskResult] = await Promise.allSettled([getProjects(), getTasks()])
    applyBoardResults(projectResult, taskResult)
  }

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getProjects(), getTasks()]).then(([projectResult, taskResult]) => {
      if (cancelled) return
      applyBoardResults(projectResult, taskResult)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!chatId) return undefined

    let cancelled = false
    getMessages(chatId)
      .then((data) => {
        const loaded = (data.messages || [])
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({ role: m.role, text: m.content || m.text || '' }))
        if (cancelled || loaded.length === 0) return
        setMessagesByAgent((prev) => ({ ...prev, [chatId]: loaded }))
      })
      .catch((err) => {
        if (cancelled) return
        setMessagesByAgent((prev) => ({
          ...prev,
          [chatId]: [
            ...(prev[chatId] || []),
            { role: 'tool', text: `Could not load chat history: ${err.message}` },
          ],
        }))
      })

    return () => {
      cancelled = true
    }
  }, [chatId])

  const navigate = (v) => {
    setView(v)
    setMobileSidebarOpen(false)
  }

  const agentLabel = (agentId) =>
    agentId === 'warroom' ? 'War Room' : AGENTS.find((a) => a.id === agentId)?.name || 'Agent'

  const appendMessage = (agentId, message) => {
    setMessagesByAgent((prev) => ({
      ...prev,
      [agentId]: [...prev[agentId], message],
    }))
  }

  const removePendingTools = (agentId) => {
    setMessagesByAgent((prev) => ({
      ...prev,
      [agentId]: prev[agentId].filter((m) => !m.pending),
    }))
  }

  const callAgentApi = async (uiAgentId, text, thread = uiAgentId) => {
    const apiAgentId = toApiAgentId(uiAgentId)
    const name = agentLabel(uiAgentId)

    appendMessage(uiAgentId, { role: 'tool', text: `${name} is working on it...`, pending: true })
    setSendingAgent(uiAgentId)

    try {
      const project = projects.find((p) => p.agent === apiAgentId)
      const projectContext = project ? `Project: ${project.name}` : ''
      const result = await sendMessage(uiAgentId, text, projectContext, thread)

      removePendingTools(uiAgentId)
      appendMessage(uiAgentId, { role: 'assistant', text: result.agentResponse.content })

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setActivityLog((prev) => [...prev, { time, text: `${name} responded` }])
    } catch (err) {
      removePendingTools(uiAgentId)
      appendMessage(uiAgentId, { role: 'assistant', text: `Something went wrong: ${err.message}` })
    } finally {
      setSendingAgent(null)
    }
  }

  const handleSend = async (agentId, text) => {
    appendMessage(agentId, { role: 'user', text })

    const mentioned = AGENTS.find((a) => a.id !== agentId && text.includes(`@${a.name}`))
    if (mentioned) {
      const sourceLabel = agentLabel(agentId)
      const cleanText = text.replaceAll(`@${mentioned.name}`, '').trim()

      appendMessage(agentId, {
        role: 'assistant',
        text: `Looping in **${mentioned.name}** — they'll pick this up and you'll see updates here.`,
      })

      appendMessage(mentioned.id, { role: 'tool', text: `New request from ${sourceLabel}` })
      appendMessage(mentioned.id, { role: 'user', text: cleanText || text })

      await callAgentApi(mentioned.id, cleanText || text, agentId)
      return
    }

    await callAgentApi(agentId, text)
  }

  const handleCreate = async (kind, rawText, deptId) => {
    const dept = AGENTS.find((a) => a.id === deptId)
    const title = rawText.replace(/\*\*/g, '').split('\n')[0].slice(0, 80)

    try {
      if (kind === 'task') {
        const { task } = await createTask({ title, project: 'From War Room', agent: deptId })
        setTasks((prev) => [...prev, task])
      } else {
        const { project } = await createProject({ name: title, agent: deptId })
        setProjects((prev) => [...prev, project])
      }

      await refreshBoard()
      setActivityLog((prev) => [...prev, { time: 'Now', text: `${kind === 'task' ? 'Task' : 'Project'} created in War Room → assigned to ${dept.name}: "${title}"` }])
      appendMessage('warroom', { role: 'tool', text: `Created ${kind} "${title}" and assigned it to ${dept.name}.` })
      appendMessage(deptId, { role: 'tool', text: `New ${kind} from War Room: "${title}"` })
    } catch (err) {
      appendMessage('warroom', { role: 'tool', text: `Could not create ${kind}: ${err.message}` })
    }
  }

  const agent = view.type === 'agent'
    ? AGENTS.find((a) => a.id === view.id)
    : view.type === 'warroom'
      ? WARROOM_AGENT
      : null

  const renderMain = () => {
    switch (view.type) {
      case 'agent':
      case 'warroom':
        return (
          <MainWorkspace
            agent={agent}
            messages={messagesByAgent[agent.id]}
            onSend={(t) => handleSend(agent.id, t)}
            onCreate={handleCreate}
            sending={sendingAgent === agent.id}
          />
        )
      case 'projects':
        return <ProjectsView projects={projects} />
      case 'tasks':
        return <TasksView tasks={tasks} />
      case 'files':
        return <FilesView />
      case 'knowledge':
        return <KnowledgeView />
      case 'activity':
        return <ActivityView activity={activityLog} />
      case 'settings':
        return <SettingsView />
      default:
        return null
    }
  }

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", backgroundColor: T.bg }}
    >
      <div className="flex flex-1 min-h-0">
        <div className="hidden md:block h-full">
          <LeftSidebar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            view={view}
            onNavigate={navigate}
            onLogout={logout}
          />
        </div>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative h-full">
              <LeftSidebar collapsed={false} setCollapsed={() => {}} view={view} onNavigate={navigate} onLogout={logout} />
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-4 right-[-44px] w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: T.surfaceRaised, color: T.text }}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            onMenu={() => setMobileSidebarOpen(true)}
            view={view}
            onOpenRight={() => setMobileRightOpen(true)}
            showRightToggle={view.type === 'agent'}
          />
          {boardError && (
            <div className="px-4 py-2 text-[12.5px] italic flex-shrink-0" style={{ color: T.textFaint, borderBottom: `1px solid ${T.border}` }}>
              {boardError}
            </div>
          )}
          <div className="flex flex-1 min-h-0">
            {renderMain()}
            {view.type === 'agent' && (
              <RightPanel
                agent={agent}
                collapsed={rightCollapsed}
                setCollapsed={setRightCollapsed}
                tasks={tasks}
                projects={projects}
                activity={activityLog}
              />
            )}
          </div>
        </div>

        {mobileRightOpen && view.type === 'agent' && (
          <div className="fixed inset-0 z-40 lg:hidden flex justify-end">
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileRightOpen(false)} />
            <div className="relative h-full w-[300px]" style={{ backgroundColor: T.surface }}>
              <button onClick={() => setMobileRightOpen(false)} className="absolute top-4 left-[-44px] w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: T.surfaceRaised, color: T.text }}>
                <X size={16} />
              </button>
              <div className="h-full overflow-y-auto">
                <RightPanelForceVisible agent={agent} tasks={tasks} projects={projects} activity={activityLog} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: T.bg, color: T.textDim }}>
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return <OfficeApp />
}
