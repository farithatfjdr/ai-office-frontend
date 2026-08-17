import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { FILES, STATUS_META, TOOLS, T } from '../data/constants'
import { PanelBlock, StatusDot, TaskStatusIcon } from './shared'

export default function RightPanel({ agent, collapsed, setCollapsed, tasks, projects, activity }) {
  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center pt-4 flex-shrink-0" style={{ width: 40, backgroundColor: T.surface, borderLeft: `1px solid ${T.border}` }}>
        <button onClick={() => setCollapsed(false)} className="w-6 h-6 flex items-center justify-center rounded" style={{ color: T.textFaint }}>
          <ChevronLeft size={14} />
        </button>
      </div>
    )
  }

  const relatedTasks = tasks.filter((t) => t.agent === agent.id)
  const project = projects.find((p) => p.agent === agent.id)

  return (
    <div className="hidden lg:flex flex-col flex-shrink-0 h-full overflow-y-auto" style={{ width: 300, backgroundColor: T.surface, borderLeft: `1px solid ${T.border}` }}>
      <div className="flex items-center px-4 h-14 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: T.textFaint }}>Context</span>
        <button onClick={() => setCollapsed(true)} className="ml-auto w-6 h-6 flex items-center justify-center rounded" style={{ color: T.textFaint }}>
          <ChevronRight size={14} />
        </button>
      </div>

      <PanelBlock title="Current task">
        {project ? (
          <>
            <div className="text-[13px] font-medium mb-1.5" style={{ color: T.text }}>{project.name}</div>
            <div className="flex items-center gap-1.5 mb-2">
              <StatusDot status={agent.status} />
              <span className="text-[11.5px]" style={{ color: T.textDim }}>{STATUS_META[agent.status].label}</span>
            </div>
            <div className="text-[11px] mb-1" style={{ color: T.textFaint }}>{project.done} / {project.tasks} stages</div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: T.borderSoft }}>
              <div className="h-full rounded-full" style={{ width: `${(project.done / project.tasks) * 100}%`, backgroundColor: T.accent }} />
            </div>
          </>
        ) : (
          <div className="text-[12px]" style={{ color: T.textFaint }}>No active project</div>
        )}
      </PanelBlock>

      <PanelBlock title="Tasks">
        <div className="flex flex-col gap-1.5">
          {(relatedTasks.length ? relatedTasks : tasks.slice(0, 3)).map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-[12.5px]">
              <TaskStatusIcon status={t.status} />
              <span className="truncate flex-1" style={{ color: t.status === 'Done' ? T.textFaint : T.text, textDecoration: t.status === 'Done' ? 'line-through' : 'none' }}>
                {t.title}
              </span>
            </div>
          ))}
        </div>
      </PanelBlock>

      <PanelBlock title="Files">
        <div className="flex flex-col gap-1.5">
          {FILES.map((f) => (
            <div key={f} className="flex items-center gap-2 text-[12.5px]" style={{ color: T.textDim }}>
              <FileText size={13} style={{ color: T.textFaint }} />
              <span className="truncate">{f}</span>
            </div>
          ))}
        </div>
      </PanelBlock>

      <PanelBlock title="Tools">
        <div className="flex flex-wrap gap-1.5">
          {TOOLS.map((tool) => (
            <span key={tool} className="text-[11px] px-2 py-1 rounded-md" style={{ backgroundColor: T.surfaceRaised, color: T.textDim, border: `1px solid ${T.border}` }}>
              {tool}
            </span>
          ))}
        </div>
      </PanelBlock>

      <PanelBlock title="Activity" last>
        <div className="flex flex-col gap-2.5 relative pl-3.5">
          <div className="absolute left-[3px] top-1 bottom-1 w-px" style={{ backgroundColor: T.border }} />
          {[...activity].reverse().slice(0, 6).map((a, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[15px] top-[3px] w-[6px] h-[6px] rounded-full" style={{ backgroundColor: T.accent }} />
              <div className="text-[10.5px] font-mono" style={{ color: T.textFaint }}>{a.time}</div>
              <div className="text-[12px]" style={{ color: T.textDim }}>{a.text}</div>
            </div>
          ))}
        </div>
      </PanelBlock>
    </div>
  )
}

export function RightPanelForceVisible({ agent, tasks, projects, activity }) {
  return (
    <div style={{ display: 'block' }}>
      <div className="[&>div]:!flex">
        <RightPanel agent={agent} collapsed={false} setCollapsed={() => {}} tasks={tasks} projects={projects} activity={activity} />
      </div>
    </div>
  )
}
