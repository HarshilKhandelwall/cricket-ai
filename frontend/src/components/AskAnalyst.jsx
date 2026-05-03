import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Sparkles, Mic2, RotateCcw } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const BASE_CHIPS = [
  { text: 'What delivery should be bowled next?', icon: '🎯' },
  { text: 'Where is the batsman most vulnerable?', icon: '🔍' },
  { text: 'What field changes would you make?', icon: '📐' },
  { text: 'Rate this shot out of 10', icon: '⭐' },
  { text: 'How would Kohli play this delivery?', icon: '👑' },
  { text: "What's the tactical battle here?", icon: '⚔️' },
]

function buildChips(ctx) {
  const frames = ctx?.frames || [ctx]
  const f = frames?.[0] || {}
  const chips = []
  if (f.shot_type && f.shot_type !== 'no shot detected')
    chips.push({ text: `Why is the ${f.shot_type} risky here?`, icon: '⚡' })
  if ((f.boundary_probability || 0) > 0.6)
    chips.push({ text: 'How can the captain stop these boundaries?', icon: '🛡️' })
  if (f.field_zone && f.field_zone !== 'unknown')
    chips.push({ text: `Is the ${f.field_zone} placement correct?`, icon: '🏟️' })
  if ((f.wicket_probability || 0) > 0.2)
    chips.push({ text: 'How close was that to a wicket?', icon: '🚨' })
  for (const d of BASE_CHIPS) {
    if (chips.length >= 4) break
    if (!chips.find(c => c.text === d.text)) chips.push(d)
  }
  return chips.slice(0, 4)
}

// Typewriter hook
function useTypewriter() {
  const [typed, setTyped] = useState({})
  const timers = useRef({})

  const write = useCallback((id, text, speed = 13) => {
    clearInterval(timers.current[id])
    let i = 0
    setTyped(p => ({ ...p, [id]: '' }))
    timers.current[id] = setInterval(() => {
      i++
      setTyped(p => ({ ...p, [id]: text.slice(0, i) }))
      if (i >= text.length) clearInterval(timers.current[id])
    }, speed)
  }, [])

  useEffect(() => () => Object.values(timers.current).forEach(clearInterval), [])
  return { typed, write }
}

const INIT_MSG = {
  role: 'assistant',
  content: "Analysis complete. I've processed every delivery — shot selection, pace, field placements, tactical patterns. Ask me anything.",
  id: 'init',
}

export default function AskAnalyst({ analysisContext, selectedFrame = 0, currentFrame = null }) {
  const [messages, setMessages] = useState([INIT_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastMode, setLastMode] = useState('demo')
  const [usedChips, setUsedChips] = useState(new Set())
  const chips = buildChips(analysisContext)
  const { typed, write } = useTypewriter()
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => { write('init', INIT_MSG.content, 16) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typed])
  useEffect(() => {
    // Fresh analysis gets a fresh chat state.
    setMessages([INIT_MSG])
    setUsedChips(new Set())
    setLoading(false)
    setInput('')
    setTimeout(() => write('init', INIT_MSG.content, 16), 40)
  }, [analysisContext, write])

  const resetChat = useCallback(() => {
    setMessages([INIT_MSG])
    setUsedChips(new Set())
    setLoading(false)
    setInput('')
    write('init', INIT_MSG.content, 16)
    inputRef.current?.focus()
  }, [write])

  const send = useCallback(async (text) => {
    const q = text.trim()
    if (!q || loading) return
    const uid = `u_${Date.now()}`
    const aid = `a_${Date.now() + 1}`
    const historyForRequest = [...messages, { role: 'user', content: q, id: uid }]

    setMessages(historyForRequest)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: analysisContext,
          question: q,
          history: historyForRequest.slice(-8).map(m => ({ role: m.role, content: m.content })),
          selected_frame_index: selectedFrame,
          selected_frame: currentFrame || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error(`Chat request failed: ${res.status}`)
      }

      const data = await res.json()
      const answer = data.answer || 'Interesting — let me think on that one.'
      setLastMode(data.demo ? 'demo' : 'live')
      setMessages(prev => [...prev, { role: 'assistant', content: answer, id: aid }])
      setLoading(false)
      setTimeout(() => write(aid, answer, 12), 60)
    } catch {
      const fallback = 'Connection dropped — but the analysis is clear. That was a decisive moment.'
      setLastMode('offline')
      setMessages(prev => [...prev, { role: 'assistant', content: fallback, id: aid }])
      setLoading(false)
      setTimeout(() => write(aid, fallback, 12), 60)
    }
  }, [loading, messages, analysisContext, selectedFrame, currentFrame, write])

  const handleChip = (chip) => {
    setUsedChips(prev => new Set([...prev, chip.text]))
    send(chip.text)
    inputRef.current?.focus()
  }

  const showChips = messages.length <= 2

  return (
    <>
      <style>{`
        @keyframes bounce3 {
          0%,80%,100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes chipPop { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px rgba(34,197,94,0.3)} 50%{box-shadow:0 0 20px rgba(34,197,94,0.6)} }
        .msg-bubble { animation: slideIn 0.3s ease both; }
        .chip-btn { animation: chipPop 0.25s ease both; }
        .chip-btn:hover { transform: translateY(-2px) scale(1.03) !important; }
        .send-btn:hover:not(:disabled) { transform: scale(1.08); background: #16a34a !important; }
        .analyst-input:focus { outline: none; border-color: rgba(34,197,94,0.5) !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.12) !important; }
      `}</style>

      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.avatarRing}>
              <div style={s.avatar}>🏏</div>
              <div style={s.livePulse} />
            </div>
            <div>
              <div style={s.analystName}>CricketIQ Analyst</div>
              <div style={s.analystSub}>
                Gemini 1.5 Pro · Delivery {selectedFrame + 1} · {lastMode === 'live' ? 'Live AI' : lastMode === 'offline' ? 'Offline fallback' : 'Demo mode'}
              </div>
            </div>
          </div>
          <div style={s.headerActions}>
            <button style={s.resetChatBtn} onClick={resetChat} title="Reset chat">
              <RotateCcw size={12} /> New Chat
            </button>
            <div style={s.aiBadge}>
              <Sparkles size={11} /> AI EXPERT
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={s.messages}>
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className="msg-bubble"
              style={{ ...s.row, ...(msg.role === 'user' ? s.rowUser : s.rowAi), animationDelay: `${idx * 0.04}s` }}
            >
              {msg.role === 'assistant' && <div style={s.aiAvatar}>🏏</div>}
              <div style={msg.role === 'user' ? s.userBubble : s.aiBubble}>
                <span>
                  {typed[msg.id] !== undefined ? typed[msg.id] : msg.content}
                </span>
                {msg.role === 'assistant' &&
                  typed[msg.id] !== undefined &&
                  typed[msg.id].length < msg.content.length && (
                    <span style={s.cursor}>|</span>
                  )}
              </div>
              {msg.role === 'user' && <div style={s.userAvatar}>👤</div>}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="msg-bubble" style={{ ...s.row, ...s.rowAi }}>
              <div style={s.aiAvatar}>🏏</div>
              <div style={s.aiBubble}>
                <div style={s.dots}>
                  {[0, 160, 320].map((delay, i) => (
                    <span key={i} style={{ ...s.dot, animation: `bounce3 1s ${delay}ms infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion Chips */}
        {showChips && (
          <div style={s.chips}>
            {chips.filter(c => !usedChips.has(c.text)).map((chip, i) => (
              <button
                key={i}
                className="chip-btn"
                style={{ ...s.chip, animationDelay: `${i * 0.07}s` }}
                onClick={() => handleChip(chip)}
              >
                <span>{chip.icon}</span>
                <span>{chip.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={s.inputRow}>
          <div style={s.inputWrap}>
            <Mic2 size={15} color="#64748b" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              className="analyst-input"
              style={s.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask anything about the match, tactics, players..."
              disabled={loading}
            />
          </div>
          <button
            className="send-btn"
            style={{ ...s.sendBtn, ...(loading || !input.trim() ? s.sendDisabled : {}) }}
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  )
}

const s = {
  container: {
    marginTop: 24,
    borderRadius: 20,
    background: 'linear-gradient(145deg, #0d1420, #111827)',
    border: '1px solid rgba(34,197,94,0.2)',
    boxShadow: '0 0 0 1px rgba(34,197,94,0.06), 0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
    overflow: 'hidden',
    animation: 'glow 4s ease infinite',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    background: 'linear-gradient(90deg, rgba(34,197,94,0.08) 0%, rgba(0,0,0,0) 60%)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  avatarRing: { position: 'relative', flexShrink: 0 },
  avatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.08))',
    border: '1.5px solid rgba(34,197,94,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
  },
  livePulse: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 6px #22c55e',
    border: '2px solid #0d1420',
  },
  analystName: { fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.2px' },
  analystSub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  aiBadge: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
    color: '#22c55e', padding: '4px 10px', borderRadius: 20,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
  },
  headerActions: { display: 'flex', alignItems: 'center', gap: 8 },
  resetChatBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#cbd5e1', padding: '6px 10px', borderRadius: 10,
    fontSize: 11, fontWeight: 600,
  },

  messages: {
    padding: '16px 20px',
    minHeight: 220,
    maxHeight: 360,
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 14,
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255,255,255,0.08) transparent',
  },
  row: { display: 'flex', alignItems: 'flex-end', gap: 10 },
  rowAi: { justifyContent: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
  },
  userAvatar: {
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
  },
  aiBubble: {
    maxWidth: '75%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px 16px 16px 16px',
    padding: '10px 14px',
    fontSize: 14, color: '#e2e8f0', lineHeight: 1.6,
    backdropFilter: 'blur(8px)',
  },
  userBubble: {
    maxWidth: '75%',
    background: 'linear-gradient(135deg, #166534, #15803d)',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '16px 4px 16px 16px',
    padding: '10px 14px',
    fontSize: 14, color: '#f0fdf4', lineHeight: 1.6,
    fontWeight: 500,
  },
  cursor: { animation: 'blink 0.9s step-end infinite', color: '#22c55e', fontWeight: 300 },
  dots: { display: 'flex', gap: 5, alignItems: 'center', padding: '2px 0' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' },

  chips: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
    padding: '0 20px 14px',
  },
  chip: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#cbd5e1', padding: '7px 14px', borderRadius: 24,
    fontSize: 13, cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Space Grotesk, sans-serif',
  },

  inputRow: {
    display: 'flex', gap: 10, alignItems: 'center',
    padding: '14px 20px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(0,0,0,0.2)',
  },
  inputWrap: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '10px 14px',
    transition: 'all 0.2s',
  },
  input: {
    flex: 1, background: 'transparent', border: 'none',
    color: '#f1f5f9', fontSize: 14, fontFamily: 'Space Grotesk, sans-serif',
    outline: 'none',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
    background: '#22c55e', border: 'none', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  sendDisabled: { background: 'rgba(255,255,255,0.08)', cursor: 'not-allowed' },
}
