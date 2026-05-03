export default function WagonWheel({ frames = [], selectedIdx = 0 }) {
  const cx = 155, cy = 155, r = 115

  // Field zone labels
  const zones = [
    { label: 'Cover', angle: -45 },
    { label: 'Mid-off', angle: -15 },
    { label: 'Straight', angle: 0 },
    { label: 'Mid-on', angle: 15 },
    { label: 'Sq. Leg', angle: 60 },
    { label: 'Fine Leg', angle: 90 },
    { label: 'Point', angle: -75 },
  ]

  const toXY = (angleDeg, radius) => {
    const rad = (angleDeg - 90) * Math.PI / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width="310" height="310" viewBox="0 0 310 310">
        {/* Field circles */}
        <circle cx={cx} cy={cy} r={r} fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.15)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={cx} cy={cy} r={r * 0.3} fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth="1" />

        {/* Pitch crease */}
        <rect x={cx - 6} y={cy - 30} width={12} height={60} rx={3} fill="rgba(255,255,255,0.1)" />

        {/* Field dividers */}
        {[0, 60, 120, 180, 240, 300].map(a => {
          const p = toXY(a, r)
          return <line key={a} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        })}

        {/* Zone labels */}
        {zones.map(z => {
          const p = toXY(z.angle, r + 18)
          return (
            <text key={z.label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
              fontSize="9" fill="rgba(148,163,184,0.6)" fontFamily="Space Grotesk">
              {z.label}
            </text>
          )
        })}

        {/* Shot lines */}
        {frames.map((frame, i) => {
          const ww = frame.wagon_wheel
          if (!ww) return null
          const angle = Math.atan2(ww.y - 50, ww.x) * (180 / Math.PI) + 90
          const dist = r * (0.35 + Math.min(frame.boundary_probability || 0, 1) * 0.6)
          const end = toXY(angle, dist)
          const isSelected = i === selectedIdx
          const isBoundary = (frame.boundary_probability || 0) > 0.65

          return (
            <g key={i}>
              <line
                x1={cx} y1={cy} x2={end.x} y2={end.y}
                stroke={isBoundary ? '#22c55e' : '#3b82f6'}
                strokeWidth={isSelected ? 2.5 : 1.2}
                opacity={isSelected ? 1 : 0.45}
                strokeLinecap="round"
              />
              <circle
                cx={end.x} cy={end.y} r={isSelected ? 6 : 3.5}
                fill={isBoundary ? '#22c55e' : '#3b82f6'}
                opacity={isSelected ? 1 : 0.6}
              />
            </g>
          )
        })}

        {/* Batsman icon */}
        <circle cx={cx} cy={cy} r={8} fill="#111827" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="10">🏏</text>

        {/* Legend */}
        <g>
          <circle cx={20} cy={285} r={4} fill="#22c55e" />
          <text x={28} y={289} fontSize="10" fill="#94a3b8" fontFamily="Space Grotesk" dominantBaseline="central">Boundary</text>
          <circle cx={88} cy={285} r={4} fill="#3b82f6" />
          <text x={96} y={289} fontSize="10" fill="#94a3b8" fontFamily="Space Grotesk" dominantBaseline="central">Running</text>
        </g>
      </svg>
    </div>
  )
}
