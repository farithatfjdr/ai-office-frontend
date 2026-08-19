import { useState } from 'react'
import { Bell, ChevronRight, ListTodo, Menu } from 'lucide-react'
import { AGENTS, T } from '../data/constants'

export default function TopBar({ onMenu, view, onOpenRight, showRightToggle, activity = [] }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const title =
    view.type === 'agent' ? AGENTS.find((a) => a.id === view.id)?.name :
    view.type === 'warroom' ? 'War Room' :
    view.type === 'projects' ? 'Projects' :
    view.type === 'tasks' ? 'Tasks' :
    view.type === 'files' ? 'Files' :
    view.type === 'knowledge' ? 'Knowledge' :
    view.type === 'activity' ? 'Activity' :
    view.type === 'settings' ? 'Settings' : ''

  return (
    <div className="h-14 flex items-center gap-3 px-3 md:px-4 flex-shrink-0" style={{ backgroundColor: T.surface, borderBottom: `1px solid ${T.border}` }}>
      <button onClick={onMenu} className="md:hidden w-8 h-8 flex items-center justify-center rounded" style={{ color: T.textDim }}>
        <Menu size={18} />
      </button>
      <div className="text-[13.5px] font-semibold md:hidden" style={{ color: T.text }}>{title}</div>
      <div className="hidden md:flex items-center gap-1.5 text-[12.5px]" style={{ color: T.textFaint }}>
        <span>Office</span>
        <ChevronRight size={12} />
        <span style={{ color: T.textDim }}>{title}</span>
      </div>
      <div className="flex-1" />
      <div className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-md relative"
          style={{ color: T.textDim, backgroundColor: T.surfaceRaised }}
        >
          <Bell size={15} />
          {activity.length > 0 && (
            <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: T.accent }} />
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-lg overflow-hidden z-30" style={{ backgroundColor: T.surfaceRaised, border: `1px solid ${T.border}`, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
            <div className="px-3.5 py-2.5 text-[11.5px] font-semibold" style={{ borderBottom: `1px solid ${T.border}`, color: T.textDim }}>Notifications</div>
            {activity.length === 0 ? (
              <div className="px-3.5 py-3 text-[12.5px]" style={{ color: T.textFaint }}>No notifications</div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {activity.map((a, i) => (
                  <div
                    key={a.id}
                    className="px-3.5 py-2.5 text-[12.5px]"
                    style={{ borderBottom: i < activity.length - 1 ? `1px solid ${T.borderSoft}` : 'none', color: T.text }}
                  >
                    {a.time ? (
                      <div className="text-[10.5px] font-mono mb-0.5" style={{ color: T.textFaint }}>{a.time}</div>
                    ) : null}
                    <div className="leading-snug">{a.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {showRightToggle && (
        <button onClick={onOpenRight} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md" style={{ color: T.textDim, backgroundColor: T.surfaceRaised }}>
          <ListTodo size={15} />
        </button>
      )}
    </div>
  )
}
