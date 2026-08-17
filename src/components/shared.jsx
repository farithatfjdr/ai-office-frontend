import { CheckCircle2, Clock, PauseCircle, Circle, Plus } from 'lucide-react'
import { STATUS_META, T } from '../data/constants'

export function StatusDot({ status }) {
  const meta = STATUS_META[status] || STATUS_META.idle
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: 7,
        height: 7,
        backgroundColor: meta.color,
        boxShadow: status === 'working' ? `0 0 0 3px ${meta.color}22` : 'none',
      }}
    />
  )
}

export function SectionLabel({ children }) {
  return (
    <div
      className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest uppercase"
      style={{ color: T.textFaint }}
    >
      {children}
    </div>
  )
}

export function MessageBubble({ msg }) {
  if (msg.role === 'tool') {
    return (
      <div className="flex items-center gap-2 pl-1 py-1">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: T.accent }} />
        <span className="text-[12.5px] italic" style={{ color: T.textFaint }}>{msg.text}</span>
      </div>
    )
  }

  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[80%] md:max-w-[65%] rounded-xl px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap"
        style={{
          backgroundColor: isUser ? T.accentDim : T.surfaceRaised,
          color: T.text,
          border: `1px solid ${isUser ? 'transparent' : T.border}`,
        }}
      >
        {msg.text.split('\n').map((line, i) => (
          <div key={i}>
            {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j} style={{ color: T.text }}>{part.slice(2, -2)}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ViewHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center px-6 h-16 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
      <div>
        <div className="text-[15px] font-semibold" style={{ color: T.text }}>{title}</div>
        {subtitle && <div className="text-[11.5px]" style={{ color: T.textFaint }}>{subtitle}</div>}
      </div>
      <div className="flex-1" />
      {action}
    </div>
  )
}

export function NewButton({ label }) {
  return (
    <button
      className="flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-md"
      style={{ backgroundColor: T.surfaceRaised, color: T.text, border: `1px solid ${T.border}` }}
    >
      <Plus size={14} /> {label}
    </button>
  )
}

export function PanelBlock({ title, children, last }) {
  return (
    <div className="px-4 py-3.5" style={{ borderBottom: last ? 'none' : `1px solid ${T.borderSoft}` }}>
      <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: T.textFaint }}>{title}</div>
      {children}
    </div>
  )
}

export function TaskStatusIcon({ status }) {
  const map = {
    Done: <CheckCircle2 size={14} style={{ color: T.green }} />,
    'In Progress': <Clock size={14} style={{ color: T.accent }} />,
    Waiting: <PauseCircle size={14} style={{ color: T.amber }} />,
    Todo: <Circle size={14} style={{ color: T.textFaint }} />,
  }
  return map[status] || map.Todo
}
