import {
  BookOpen, ChevronRight, FileText, FolderKanban, MoreHorizontal,
} from 'lucide-react'
import { AGENTS, FILES, T } from '../data/constants'
import { NewButton, TaskStatusIcon, ViewHeader } from './shared'

export function ProjectsView({ projects }) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: T.bg }}>
      <ViewHeader title="Projects" subtitle={`${projects.length} active`} action={<NewButton label="New project" />} />
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {projects.map((p) => {
          const agent = AGENTS.find((a) => a.id === p.agent)
          return (
            <div key={p.id} className="rounded-lg p-4" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <FolderKanban size={15} style={{ color: T.textFaint }} />
                <span className="text-[13.5px] font-medium flex-1 truncate" style={{ color: T.text }}>{p.name}</span>
                <MoreHorizontal size={14} style={{ color: T.textFaint }} />
              </div>
              <div className="text-[11.5px] mb-3" style={{ color: T.textFaint }}>{p.done} / {p.tasks} tasks complete</div>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: T.borderSoft }}>
                <div className="h-full rounded-full" style={{ width: `${(p.done / p.tasks) * 100}%`, backgroundColor: T.accent }} />
              </div>
              {agent && (
                <div className="flex items-center gap-1.5">
                  <agent.icon size={12} style={{ color: T.textFaint }} />
                  <span className="text-[11px]" style={{ color: T.textDim }}>{agent.name}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TasksView({ tasks }) {
  const columns = ['Todo', 'In Progress', 'Waiting', 'Done']
  const priorityColor = { High: T.red, Medium: T.amber, Low: T.textFaint }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: T.bg }}>
      <ViewHeader title="Tasks" subtitle={`${tasks.length} across all projects`} action={<NewButton label="New task" />} />
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full" style={{ minWidth: 900 }}>
          {columns.map((col) => {
            const items = tasks.filter((t) => t.status === col)
            return (
              <div key={col} className="flex flex-col flex-1 min-w-[210px]">
                <div className="flex items-center gap-2 mb-3">
                  <TaskStatusIcon status={col} />
                  <span className="text-[12px] font-semibold" style={{ color: T.textDim }}>{col}</span>
                  <span className="text-[11px]" style={{ color: T.textFaint }}>{items.length}</span>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto">
                  {items.map((t) => {
                    const agent = AGENTS.find((a) => a.id === t.agent)
                    return (
                      <div key={t.id} className="rounded-lg p-3" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
                        <div className="text-[12.5px] font-medium mb-2 leading-snug" style={{ color: T.text }}>{t.title}</div>
                        <div className="text-[10.5px] mb-2.5" style={{ color: T.textFaint }}>{t.project}</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityColor[t.priority] }} />
                            <span className="text-[10.5px]" style={{ color: T.textFaint }}>{t.due}</span>
                          </div>
                          {agent && <agent.icon size={12} style={{ color: T.textFaint }} />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function FilesView() {
  const allFiles = [...FILES, 'invoice-july.pdf', 'campaign-brief.docx', 'scraper-config.json']
  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: T.bg }}>
      <ViewHeader title="Files" subtitle={`${allFiles.length} files`} action={<NewButton label="Upload" />} />
      <div className="p-6 flex flex-col gap-1">
        {allFiles.map((f) => (
          <div key={f} className="flex items-center gap-3 px-3 py-2.5 rounded-md" style={{ border: `1px solid ${T.borderSoft}` }}>
            <FileText size={15} style={{ color: T.textFaint }} />
            <span className="text-[13px] flex-1 truncate" style={{ color: T.text }}>{f}</span>
            <span className="text-[11px]" style={{ color: T.textFaint }}>—</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function KnowledgeView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2" style={{ backgroundColor: T.bg }}>
      <BookOpen size={22} style={{ color: T.textFaint }} />
      <div className="text-[13.5px] font-medium" style={{ color: T.text }}>No knowledge sources connected yet</div>
      <div className="text-[12px]" style={{ color: T.textFaint }}>Connect docs, sites, or databases for your employees to reference.</div>
    </div>
  )
}

export function ActivityView({ activity }) {
  const feed = [...activity].reverse()
  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: T.bg }}>
      <ViewHeader title="Activity" subtitle="Company-wide audit trail" />
      <div className="p-6 max-w-xl">
        <div className="relative pl-4">
          <div className="absolute left-[3px] top-1 bottom-1 w-px" style={{ backgroundColor: T.border }} />
          {feed.map((a, i) => (
            <div key={i} className="relative pb-4">
              <div className="absolute -left-[15px] top-[3px] w-[6px] h-[6px] rounded-full" style={{ backgroundColor: T.accent }} />
              <div className="text-[10.5px] font-mono mb-0.5" style={{ color: T.textFaint }}>{a.time}</div>
              <div className="text-[13px]" style={{ color: T.text }}>{a.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SettingsView() {
  const groups = [
    { title: 'AI Providers', items: ['OpenAI', 'Anthropic', 'Google', 'Local models'] },
    { title: 'Agents', items: ['Manage agents', 'Models', 'Tools', 'Instructions'] },
    { title: 'Integrations', items: ['n8n', 'Apify', 'Google', 'Storage', 'Database'] },
    { title: 'Appearance', items: ['Light', 'Dark', 'System'] },
    { title: 'Account', items: ['Profile', 'Billing'] },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ backgroundColor: T.bg }}>
      <ViewHeader title="Settings" />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        {groups.map((g) => (
          <div key={g.title} className="rounded-lg p-4" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
            <div className="text-[12.5px] font-semibold mb-3" style={{ color: T.text }}>{g.title}</div>
            <div className="flex flex-col gap-0.5">
              {g.items.map((it) => (
                <div key={it} className="flex items-center justify-between px-2.5 py-2 rounded-md text-[12.5px]" style={{ color: T.textDim }}>
                  {it}
                  <ChevronRight size={13} style={{ color: T.textFaint }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
