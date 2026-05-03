import { useState, useRef, useCallback } from 'react'
import { Upload, Zap, Video, Image, Activity, Target, Wind, BarChart3, Mic2, ChevronRight, RefreshCw, MessageCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import WagonWheel from './components/WagonWheel.jsx'
import CommentaryCard from './components/CommentaryCard.jsx'
import StatCard from './components/StatCard.jsx'
import FrameTimeline from './components/FrameTimeline.jsx'
import AskAnalyst from './components/AskAnalyst.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const DEMO_SHOTS = [
  { label: 'Cover Drive', value: 3, color: '#22c55e' },
  { label: 'Pull Shot', value: 2, color: '#3b82f6' },
  { label: 'Sweep', value: 1, color: '#f59e0b' },
  { label: 'Cut Shot', value: 2, color: '#a855f7' },
  { label: 'Defensive', value: 1, color: '#94a3b8' },
]

export default function App() {
  const [mode, setMode] = useState('idle') // idle | uploading | analyzing | done | error
  const [uploadType, setUploadType] = useState('image') // image | video
  const [result, setResult] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFrame, setSelectedFrame] = useState(0)
  const fileRef = useRef()

  const handleFile = useCallback(async (file) => {
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) return

    // Preview
    const url = URL.createObjectURL(file)
    setPreview({ url, type: isVideo ? 'video' : 'image' })
    setMode('analyzing')
    setSelectedFrame(0)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const endpoint = isVideo ? '/analyze/video' : '/analyze/image'
      const resp = await fetch(`${API}${endpoint}`, { method: 'POST', body: fd })
      if (!resp.ok) throw new Error('API error')
      const data = await resp.json()

      // Normalize: image returns flat object, video returns {frames, summary}
      if (isVideo) {
        setResult({ type: 'video', ...data })
      } else {
        setResult({ type: 'image', frames: [data], summary: buildImageSummary(data) })
      }
      setMode('done')
    } catch (err) {
      // Use demo data as fallback
      useDemoData(isVideo)
    }
  }, [])

  const useDemoData = async (isVideo) => {
    try {
      const endpoint = isVideo ? '/analyze/video?demo=true' : '/analyze/image?demo=true'
      const resp = await fetch(`${API}${endpoint}`, { method: 'POST', body: new FormData() })
      const data = await resp.json()
      if (isVideo) {
        setResult({ type: 'video', ...data })
      } else {
        setResult({ type: 'image', frames: [data], summary: buildImageSummary(data) })
      }
    } catch {
      setResult(getMockResult())
    }
    setMode('done')
  }

  const runDemo = async () => {
    setPreview(null)
    setMode('analyzing')
    setSelectedFrame(0)
    await useDemoData(false)
  }

  const reset = () => {
    setMode('idle')
    setResult(null)
    setPreview(null)
    setSelectedFrame(0)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const frame = result?.frames?.[selectedFrame] || {}
  const summary = result?.summary || {}

  const shotChartData = summary.shots_breakdown
    ? Object.entries(summary.shots_breakdown)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name: name.replace(' shot', '').replace(' drive', ''), value }))
    : DEMO_SHOTS.map(d => ({ name: d.label, value: d.value }))

  const SHOT_COLORS = ['#22c55e','#3b82f6','#f59e0b','#a855f7','#ef4444','#94a3b8']

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🏏</span>
            <span style={styles.logoText}>Cricket<span style={{ color: '#22c55e' }}>IQ</span></span>
            <span style={styles.logoBadge}>AI</span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.modelBadge}>Gemini 1.5 Pro Vision</span>
            {mode === 'done' && (
              <button style={styles.resetBtn} onClick={reset}>
                <RefreshCw size={14} /> New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Upload Zone */}
        {mode === 'idle' && (
          <div style={styles.uploadSection}>
            <div style={styles.heroText}>
              <h1 style={styles.h1}>AI-Powered Cricket Analysis</h1>
              <p style={styles.subtitle}>Upload a match image or video. Gemini Vision identifies shot types, ball trajectory, speed, and generates live commentary.</p>
            </div>

            <div
              style={{ ...styles.dropzone, ...(dragOver ? styles.dropzoneActive : {}) }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])} />
              <div style={styles.dropzoneContent}>
                <div style={styles.uploadIconWrap}>
                  <Upload size={32} color="#22c55e" />
                </div>
                <p style={styles.dropText}>Drop image or video here</p>
                <p style={styles.dropSub}>JPG, PNG, MP4, MOV · or click to browse</p>
                <div style={styles.typeRow}>
                  <span style={styles.typeTag}><Image size={13} /> Image</span>
                  <span style={styles.typeTag}><Video size={13} /> Video</span>
                </div>
              </div>
            </div>

            <button style={styles.demoBtn} onClick={runDemo}>
              <Zap size={16} /> Run Demo with Sample Data
            </button>
          </div>
        )}

        {/* Analyzing State */}
        {mode === 'analyzing' && (
          <div style={styles.analyzing}>
            <div style={styles.pulseRing} />
            <div style={styles.analyzeIcon}>🏏</div>
            <h2 style={styles.analyzeTitle}>Gemini is analyzing the match...</h2>
            <div style={styles.stepsWrap}>
              {['Extracting frames','Running Gemini Vision','Classifying shots','Generating commentary','Building stats'].map((s, i) => (
                <div key={i} style={{ ...styles.step, animationDelay: `${i * 0.4}s` }}>
                  <ChevronRight size={14} color="#22c55e" /> {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {mode === 'done' && result && (
          <div style={styles.results}>
            {/* Left panel */}
            <div style={styles.leftPanel}>
              {/* Preview */}
              {preview && (
                <div style={styles.previewCard}>
                  {preview.type === 'image'
                    ? <img src={preview.url} alt="uploaded" style={styles.previewImg} />
                    : <video src={preview.url} style={styles.previewImg} controls muted />
                  }
                  <div style={styles.previewOverlay}>
                    <span style={{ ...styles.resultLabel, background: frame.result_color || '#22c55e' }}>
                      {frame.result_label || 'Boundary'}
                    </span>
                    <span style={styles.shotBadge}>{frame.shot_type || 'Cover Drive'}</span>
                  </div>
                </div>
              )}

              {/* Wagon Wheel */}
              <div style={styles.card}>
                <div style={styles.cardHeader}><Target size={16} color="#22c55e" /> Wagon Wheel</div>
                <WagonWheel frames={result.frames} selectedIdx={selectedFrame} />
              </div>

              {/* Commentary */}
              <CommentaryCard commentary={frame.commentary} />
            </div>

            {/* Right panel */}
            <div style={styles.rightPanel}>
              {/* Stat row */}
              <div style={styles.statRow}>
                <StatCard icon={<Activity size={18} color="#22c55e"/>} label="Est. Runs" value={summary.estimated_runs ?? '—'} accent="#22c55e" />
                <StatCard icon={<Wind size={18} color="#3b82f6"/>} label="Avg Speed" value={`${summary.average_speed_kmh ?? frame.estimated_speed_kmh ?? '—'} km/h`} accent="#3b82f6" />
                <StatCard icon={<Zap size={18} color="#f59e0b"/>} label="Boundaries" value={summary.boundaries ?? '—'} accent="#f59e0b" />
                <StatCard icon={<Target size={18} color="#a855f7"/>} label="Strike Rate" value={summary.strike_rate ?? '—'} accent="#a855f7" />
              </div>

              {/* Current frame details */}
              <div style={styles.card}>
                <div style={styles.cardHeader}><Zap size={16} color="#f59e0b" /> Shot Analysis</div>
                <div style={styles.shotGrid}>
                  <ShotDetail label="Shot Type" value={frame.shot_type || '—'} highlight />
                  <ShotDetail label="Direction" value={frame.ball_direction || '—'} />
                  <ShotDetail label="Delivery" value={frame.delivery_type || '—'} />
                  <ShotDetail label="Field Zone" value={frame.field_zone || '—'} />
                  <ShotDetail label="Ball Speed" value={`~${frame.estimated_speed_kmh || '—'} km/h`} highlight />
                  <ShotDetail label="Boundary %" value={`${Math.round((frame.boundary_probability || 0) * 100)}%`} />
                  <ShotDetail label="Wicket Risk" value={frame.wicket_risk || 'low'} danger={frame.wicket_risk === 'high'} />
                  <ShotDetail label="Confidence" value={`${Math.round((frame.confidence || 0.9) * 100)}%`} />
                </div>
                {frame.event_description && (
                  <p style={styles.eventDesc}>"{frame.event_description}"</p>
                )}
              </div>

              {/* Shot breakdown chart */}
              <div style={styles.card}>
                <div style={styles.cardHeader}><BarChart3 size={16} color="#3b82f6" /> Shot Breakdown</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={shotChartData} layout="vertical" barSize={14}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Space Grotesk' }} width={80} />
                    <Tooltip
                      contentStyle={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'Space Grotesk' }}
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {shotChartData.map((_, i) => <Cell key={i} fill={SHOT_COLORS[i % SHOT_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Match summary */}
              {summary.key_moment && (
                <div style={{ ...styles.card, borderColor: 'rgba(34,197,94,0.3)' }}>
                  <div style={styles.cardHeader}><Mic2 size={16} color="#22c55e" /> Key Moment</div>
                  <p style={styles.keyMoment}>{summary.key_moment}</p>
                  {summary.match_phase && (
                    <span style={styles.phaseBadge}>{summary.match_phase.toUpperCase()}</span>
                  )}
                </div>
              )}

              {/* Frame timeline for video */}
              {result.type === 'video' && result.frames?.length > 1 && (
                <FrameTimeline
                  frames={result.frames}
                  selectedIdx={selectedFrame}
                  onSelect={setSelectedFrame}
                />
              )}
          </div>

          {/* Ask the Analyst — full-width below results */}
          <div style={{ marginTop: 8 }}>
            <div style={styles.sectionLabel}>
              <MessageCircle size={15} color="#22c55e" />
              Ask the Analyst
            </div>
            <AskAnalyst
              analysisContext={result}
              selectedFrame={selectedFrame}
              currentFrame={frame}
            />
          </div>
        </div>
        )}
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.15);opacity:0.2} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .step { animation: fadeUp 0.4s ease both; }
      `}</style>
    </div>
  )
}

function ShotDetail({ label, value, highlight, danger }) {
  return (
    <div style={styles.shotDetail}>
      <span style={styles.shotLabel}>{label}</span>
      <span style={{
        ...styles.shotValue,
        ...(highlight ? { color: '#22c55e', fontWeight: 600 } : {}),
        ...(danger ? { color: '#ef4444' } : {}),
      }}>{value}</span>
    </div>
  )
}

function buildImageSummary(data) {
  const bp = Math.max(0, Math.min(1, Number(data.boundary_probability || 0)))
  const wp = Math.max(0, Math.min(1, Number(data.wicket_probability || 0)))
  const runs = predictRuns(bp, wp)

  return {
    total_deliveries: 1,
    estimated_runs: runs,
    average_speed_kmh: data.estimated_speed_kmh,
    boundaries: runs >= 4 ? 1 : 0,
    sixes: runs === 6 ? 1 : 0,
    dot_balls: runs === 0 ? 1 : 0,
    strike_rate: Number((runs * 100).toFixed(1)),
    shots_breakdown: {
      'cover drive': 0,
      'pull shot': 0,
      sweep: 0,
      'cut shot': 0,
      'defensive block': 0,
      'straight drive': 0,
      'hook shot': 0,
      flick: 0,
      glance: 0,
      'no shot detected': 0,
      other: 0,
      [normalizeShot(data.shot_type || 'unknown')]: 1,
    },
    dominant_zone: data.field_zone || 'unknown',
    key_moment: data.event_description,
    match_phase: 'powerplay',
  }
}

function predictRuns(bp, wp) {
  if (wp >= 0.65) return 0
  if (bp >= 0.88) return 6
  if (bp >= 0.68) return 4
  if (bp >= 0.46) return 2
  if (bp >= 0.24) return 1
  return 0
}

function normalizeShot(shot = '') {
  const known = new Set([
    'cover drive',
    'pull shot',
    'sweep',
    'cut shot',
    'defensive block',
    'straight drive',
    'hook shot',
    'flick',
    'glance',
    'no shot detected',
  ])
  const s = String(shot).toLowerCase().trim()
  return known.has(s) ? s : 'other'
}

function getMockResult() {
  const frame = {
    shot_type: 'cover drive', batsman_handedness: 'right-handed',
    ball_direction: 'off side', field_zone: 'cover',
    estimated_speed_kmh: 138, boundary_probability: 0.82,
    wicket_probability: 0.05, delivery_type: 'full', confidence: 0.91,
    event_description: 'Batsman elegantly drives through off side for four.',
    wagon_wheel: { x: 72, y: 38 }, result_color: '#22c55e', result_label: 'Boundary',
    wicket_risk: 'low',
    commentary: [
      'Full delivery at 138 km/h, angling into the right-hander.',
      'Batsman drives elegantly, timing perfect through the covers.',
      'FOUR! Races to the boundary — beautiful shot!'
    ]
  }
  return {
    type: 'image', frames: [frame],
    summary: { estimated_runs: 4, average_speed_kmh: 138, boundaries: 1, strike_rate: 133,
      shots_breakdown: { 'cover drive': 1 }, key_moment: frame.event_description, match_phase: 'powerplay' }
  }
}

const styles = {
  root: { minHeight: '100vh', background: '#0a0e17' },
  header: { borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,14,23,0.95)', backdropFilter: 'blur(12px)' },
  headerInner: { maxWidth: 1400, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 24 },
  logoText: { fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' },
  logoBadge: { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  modelBadge: { color: '#94a3b8', fontSize: 13, fontFamily: 'DM Mono, monospace' },
  resetBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'Space Grotesk' },
  main: { maxWidth: 1400, margin: '0 auto', padding: '40px 24px' },

  uploadSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 },
  heroText: { textAlign: 'center', maxWidth: 580 },
  h1: { fontSize: 42, fontWeight: 700, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.1 },
  subtitle: { color: '#94a3b8', fontSize: 16, lineHeight: 1.6 },

  dropzone: { width: '100%', maxWidth: 580, border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 20, padding: 48, cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(255,255,255,0.02)' },
  dropzoneActive: { border: '2px dashed #22c55e', background: 'rgba(34,197,94,0.05)' },
  dropzoneContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  uploadIconWrap: { width: 64, height: 64, borderRadius: 16, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropText: { fontSize: 18, fontWeight: 600 },
  dropSub: { color: '#64748b', fontSize: 14 },
  typeRow: { display: 'flex', gap: 8, marginTop: 4 },
  typeTag: { display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: 20, fontSize: 13, color: '#94a3b8' },
  demoBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk', transition: 'all 0.2s' },

  analyzing: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24, position: 'relative' },
  pulseRing: { position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.2)', animation: 'pulse 2s ease infinite' },
  analyzeIcon: { fontSize: 48 },
  analyzeTitle: { fontSize: 22, fontWeight: 600 },
  stepsWrap: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 },
  step: { display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 14 },

  results: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' },
  leftPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: 16 },

  previewCard: { borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' },
  previewImg: { width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' },
  previewOverlay: { position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 8, alignItems: 'center' },
  resultLabel: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff' },
  shotBadge: { background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },

  card: { background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' },

  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },

  shotGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 },
  shotDetail: { display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  shotLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  shotValue: { fontSize: 14, fontWeight: 500, color: '#f1f5f9' },
  eventDesc: { marginTop: 14, color: '#94a3b8', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid #22c55e', paddingLeft: 12 },

  keyMoment: { color: '#f1f5f9', fontSize: 15, lineHeight: 1.6, marginBottom: 12 },
  phaseBadge: { display: 'inline-block', background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '1px' },
  sectionLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 },
}

const SHOT_COLORS = ['#22c55e','#3b82f6','#f59e0b','#a855f7','#ef4444','#94a3b8']
