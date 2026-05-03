export default function FrameTimeline({ frames, selectedIdx, onSelect }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>🎞 Frame Timeline</div>
      <div style={styles.track}>
        {frames.map((frame, i) => {
          const bp = frame.boundary_probability || 0
          const color = bp > 0.65 ? '#22c55e' : bp > 0.35 ? '#f59e0b' : '#64748b'
          const isSelected = i === selectedIdx
          return (
            <button key={i} style={{ ...styles.frame, ...(isSelected ? styles.frameSelected : {}), borderColor: isSelected ? color : 'transparent', background: isSelected ? `${color}15` : 'rgba(255,255,255,0.03)' }}
              onClick={() => onSelect(i)}>
              <div style={{ ...styles.dot, background: color }} />
              <span style={styles.shot}>{shortShot(frame.shot_type)}</span>
              <span style={styles.ts}>{frame.timestamp_sec}s</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function shortShot(shot = '') {
  const map = {
    'cover drive': 'COV', 'pull shot': 'PUL', 'sweep': 'SWP',
    'cut shot': 'CUT', 'defensive block': 'DEF', 'straight drive': 'STR',
    'hook shot': 'HOK', 'flick': 'FLK', 'glance': 'GLC', 'no shot detected': '—',
  }
  return map[shot] || shot.slice(0, 3).toUpperCase()
}

const styles = {
  card: { background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 },
  header: { fontSize: 14, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 },
  track: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  frame: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 10px', border: '1px solid', borderRadius: 10, cursor: 'pointer', minWidth: 52, fontFamily: 'Space Grotesk', transition: 'all 0.15s' },
  frameSelected: { transform: 'scale(1.05)' },
  dot: { width: 8, height: 8, borderRadius: '50%' },
  shot: { fontSize: 11, fontWeight: 700, color: '#f1f5f9', fontFamily: 'DM Mono, monospace' },
  ts: { fontSize: 10, color: '#64748b' },
}
