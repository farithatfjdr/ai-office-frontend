import { useEffect, useRef, useState } from 'react'
import {
  AtSign, CheckSquare, FolderKanban, Paperclip, Send, Wrench,
} from 'lucide-react'
import { AGENTS, STATUS_META, T } from '../data/constants'
import { MessageBubble, StatusDot } from './shared'

export default function MainWorkspace({ agent, messages, onSend, onCreate, sending, tools = [] }) {
  const [input, setInput] = useState('')
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [actionMenu, setActionMenu] = useState(null)
  const [toolMenuOpen, setToolMenuOpen] = useState(false)
  const [selectedTools, setSelectedTools] = useState([])
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const match = input.match(/@([A-Za-z ]*)$/)
    if (match) {
      setMentionOpen(true)
      setMentionFilter(match[1].toLowerCase())
    } else {
      setMentionOpen(false)
    }
  }, [input])

  useEffect(() => {
    const ids = new Set(tools.map((t) => t.id))
    setSelectedTools((prev) => prev.filter((id) => ids.has(id)))
  }, [tools])

  const mentionTargets = AGENTS.filter(
    (a) => a.id !== agent.id && a.name.toLowerCase().includes(mentionFilter)
  )

  const insertMention = (a) => {
    setInput((prev) => prev.replace(/@([A-Za-z ]*)$/, `@${a.name} `))
    setMentionOpen(false)
    textareaRef.current?.focus()
  }

  const openMentionPicker = () => {
    setInput((prev) => (prev === '' || prev.endsWith(' ') ? `${prev}@` : `${prev} @`))
    textareaRef.current?.focus()
  }

  const handleSend = () => {
    if (!input.trim() || sending) return
    onSend(input.trim(), selectedTools)
    setInput('')
    setMentionOpen(false)
    setToolMenuOpen(false)
  }

  const toggleTool = (id) => {
    setSelectedTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const status = STATUS_META[sending ? 'working' : agent.status] || STATUS_META.idle

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: T.bg }}>
      <div className="flex items-center gap-3 px-5 h-16 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.surfaceRaised }}>
          <agent.icon size={17} color={T.textDim} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold truncate" style={{ color: T.text }}>{agent.name}</div>
          <div className="text-[11.5px] truncate" style={{ color: T.textFaint }}>{agent.title}</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: T.surfaceRaised }}>
          <StatusDot status={sending ? 'working' : agent.status} />
          <span className="text-[11px] font-medium" style={{ color: T.textDim }}>{status.label}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <MessageBubble msg={m} />
            {agent.id === 'warroom' && m.role === 'assistant' && i > 0 && (
              <div className="relative flex items-center gap-2 pl-1">
                <button
                  onClick={() => setActionMenu(actionMenu?.msgIndex === i && actionMenu?.kind === 'task' ? null : { msgIndex: i, kind: 'task' })}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md"
                  style={{ color: T.textFaint, border: `1px solid ${T.border}` }}
                >
                  <CheckSquare size={11} /> Turn into task
                </button>
                <button
                  onClick={() => setActionMenu(actionMenu?.msgIndex === i && actionMenu?.kind === 'project' ? null : { msgIndex: i, kind: 'project' })}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md"
                  style={{ color: T.textFaint, border: `1px solid ${T.border}` }}
                >
                  <FolderKanban size={11} /> Turn into project
                </button>
                {actionMenu?.msgIndex === i && (
                  <div className="absolute top-full left-1 mt-1 w-52 rounded-lg overflow-hidden z-20" style={{ backgroundColor: T.surfaceRaised, border: `1px solid ${T.border}`, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
                    <div className="px-3 py-2 text-[10.5px] font-semibold tracking-widest uppercase" style={{ borderBottom: `1px solid ${T.border}`, color: T.textFaint }}>Assign to</div>
                    {AGENTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { onCreate(actionMenu.kind, m.text, a.id); setActionMenu(null) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
                        style={{ color: T.text }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = T.borderSoft }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <a.icon size={13} style={{ color: T.textFaint }} />
                        <span className="text-[12px] font-medium">{a.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 pb-5 pt-2 flex-shrink-0 relative">
        {mentionOpen && mentionTargets.length > 0 && (
          <div className="absolute bottom-full left-5 mb-2 w-64 rounded-lg overflow-hidden z-20" style={{ backgroundColor: T.surfaceRaised, border: `1px solid ${T.border}`, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
            <div className="px-3 py-2 text-[10.5px] font-semibold tracking-widest uppercase" style={{ borderBottom: `1px solid ${T.border}`, color: T.textFaint }}>Hand off to</div>
            {mentionTargets.map((a) => (
              <button
                key={a.id}
                onClick={() => insertMention(a)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
                style={{ color: T.text }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = T.borderSoft }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <a.icon size={14} style={{ color: T.textFaint }} />
                <span className="text-[12.5px] font-medium">{a.name}</span>
                <span className="text-[11px] ml-auto truncate" style={{ color: T.textFaint }}>{a.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
        {toolMenuOpen && tools.length > 0 && (
          <div className="absolute bottom-full left-5 mb-2 w-64 rounded-lg overflow-hidden z-20" style={{ backgroundColor: T.surfaceRaised, border: `1px solid ${T.border}`, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
            <div className="px-3 py-2 text-[10.5px] font-semibold tracking-widest uppercase" style={{ borderBottom: `1px solid ${T.border}`, color: T.textFaint }}>Tools for this send</div>
            {tools.map((tool) => {
              const on = selectedTools.includes(tool.id)
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => toggleTool(tool.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
                  style={{ color: T.text }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = T.borderSoft }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span className="text-[12.5px] font-medium flex-1">{tool.name}</span>
                  <span className="text-[11px]" style={{ color: on ? T.accent : T.textFaint }}>{on ? 'On' : 'Off'}</span>
                </button>
              )
            })}
          </div>
        )}
        <div className="rounded-xl px-3.5 pt-3 pb-2" style={{ backgroundColor: T.surface, border: `1px solid ${T.border}` }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !mentionOpen) {
                e.preventDefault()
                handleSend()
              }
              if (e.key === 'Escape') {
                setMentionOpen(false)
                setToolMenuOpen(false)
              }
            }}
            placeholder={agent.id === 'warroom' ? 'Think out loud, or type @ to tag an employee...' : `Ask ${agent.name} anything...`}
            rows={1}
            disabled={sending}
            className="w-full bg-transparent resize-none outline-none text-[13.5px] leading-relaxed"
            style={{ color: T.text, minHeight: 22, maxHeight: 120 }}
          />
          <div className="flex items-center gap-1 mt-2">
            <button title="Attach (coming soon)" className="w-7 h-7 flex items-center justify-center rounded-md" style={{ color: T.textFaint }}>
              <Paperclip size={14} />
            </button>
            <button onClick={openMentionPicker} title="Mention an employee" className="w-7 h-7 flex items-center justify-center rounded-md" style={{ color: T.textFaint }}>
              <AtSign size={14} />
            </button>
            <button
              type="button"
              title={tools.length ? 'Tools' : 'No tools connected'}
              disabled={!tools.length}
              onClick={() => setToolMenuOpen((open) => !open)}
              className="h-7 px-2 flex items-center gap-1 rounded-md text-[11.5px] disabled:opacity-40"
              style={{ color: selectedTools.length ? T.accent : T.textFaint }}
            >
              <Wrench size={13} /> Tools
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0 transition-opacity"
              style={{ backgroundColor: T.accent, color: '#0E1013', opacity: input.trim() && !sending ? 1 : 0.35 }}
            >
              <Send size={13} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
