import { Mic2 } from 'lucide-react'

export default function CommentaryCard({ commentary }) {
  if (!commentary || !commentary.length) return null

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <Mic2 size={16} color="#f59e0b" />
        <span style={styles.headerText}>Live Commentary</span>
        <span style={styles.live}>● LIVE</span>
      </div>
      <div style={styles.lines}>
        {commentary.map((line, i) => (
          <div key={i} style={{ ...styles.line, animationDelay: `${i * 0.2}s` }}>
            <span style={{ ...styles.lineNum, background: i === 2 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: i === 2 ? '#22c55e' : '#f59e0b' }}>
              {i === 0 ? '🎙' : i === 1 ? '🏏' : '📣'}
            </span>
            <span style={styles.lineText}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  card: { background: '#111827', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 20 },
  header: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  headerText: { fontSize: 14, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', flex: 1 },
  live: { fontSize: 11, color: '#ef4444', fontWeight: 700, fontFamily: 'DM Mono, monospace', animation: 'pulse 2s infinite' },
  lines: { display: 'flex', flexDirection: 'column', gap: 12 },
  line: { display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'fadeUp 0.5s ease both' },
  lineNum: { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  lineText: { fontSize: 14, lineHeight: 1.6, color: '#e2e8f0', paddingTop: 4 },
}
