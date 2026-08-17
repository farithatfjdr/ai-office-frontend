import {
  ChevronLeft, ChevronRight, Sparkles, FolderKanban, CheckSquare, FileText,
  BookOpen, Activity as ActivityIcon, Settings as SettingsIcon, LogOut,
} from 'lucide-react'
import { AGENTS, T, WARROOM_AGENT } from '../data/constants'
import { SectionLabel, StatusDot } from './shared'

export default function LeftSidebar({ collapsed, setCollapsed, view, onNavigate, onLogout }) {
  const NavRow = ({ active, icon: Icon, label, onClick, right }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors"
      style={{
        backgroundColor: active ? T.surfaceRaised : 'transparent',
        color: active ? T.text : T.textDim,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = T.borderSoft }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {Icon && <Icon size={16} strokeWidth={1.75} className="flex-shrink-0" />}
      {!collapsed && <span className="text-[13.5px] font-medium truncate flex-1">{label}</span>}
      {!collapsed && right}
    </button>
  )

  return (
    <div
      className="h-full flex flex-col flex-shrink-0 transition-all duration-200"
      style={{ width: collapsed ? 64 : 248, backgroundColor: T.surface, borderRight: `1px solid ${T.border}` }}
    >
      <div className="flex items-center gap-2 px-3 h-14 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.accentDim }}>
          <Sparkles size={14} color={T.accent} strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate" style={{ color: T.text }}>Northgate Office</div>
            <div className="text-[10.5px] truncate" style={{ color: T.textFaint }}>1-person company</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto w-6 h-6 flex items-center justify-center rounded flex-shrink-0"
          style={{ color: T.textFaint }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-2 pt-2">
          <NavRow active={view.type === 'warroom'} icon={WARROOM_AGENT.icon} label={WARROOM_AGENT.name} onClick={() => onNavigate({ type: 'warroom' })} />
        </div>
        <div className="mx-3 my-2" style={{ borderTop: `1px solid ${T.borderSoft}` }} />
        {!collapsed && <SectionLabel>AI Employees</SectionLabel>}
        <div className="px-2 flex flex-col gap-0.5">
          {AGENTS.map((a) => (
            <NavRow
              key={a.id}
              active={view.type === 'agent' && view.id === a.id}
              icon={a.icon}
              label={a.name}
              onClick={() => onNavigate({ type: 'agent', id: a.id })}
              right={<StatusDot status={a.status} />}
            />
          ))}
        </div>
        {!collapsed && <SectionLabel>Workspace</SectionLabel>}
        <div className="px-2 flex flex-col gap-0.5">
          <NavRow active={view.type === 'projects'} icon={FolderKanban} label="Projects" onClick={() => onNavigate({ type: 'projects' })} />
          <NavRow active={view.type === 'tasks'} icon={CheckSquare} label="Tasks" onClick={() => onNavigate({ type: 'tasks' })} />
          <NavRow active={view.type === 'files'} icon={FileText} label="Files" onClick={() => onNavigate({ type: 'files' })} />
          <NavRow active={view.type === 'knowledge'} icon={BookOpen} label="Knowledge" onClick={() => onNavigate({ type: 'knowledge' })} />
        </div>
        {!collapsed && <SectionLabel>System</SectionLabel>}
        <div className="px-2 flex flex-col gap-0.5">
          <NavRow active={view.type === 'activity'} icon={ActivityIcon} label="Activity" onClick={() => onNavigate({ type: 'activity' })} />
          <NavRow active={view.type === 'settings'} icon={SettingsIcon} label="Settings" onClick={() => onNavigate({ type: 'settings' })} />
        </div>
      </div>

      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ backgroundColor: T.surfaceRaised, color: T.textDim }}>
            YO
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-medium truncate" style={{ color: T.text }}>You</div>
              <div className="text-[10.5px] truncate" style={{ color: T.textFaint }}>Operator</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={onLogout} title="Sign out" className="w-7 h-7 flex items-center justify-center rounded-md" style={{ color: T.textFaint }}>
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
