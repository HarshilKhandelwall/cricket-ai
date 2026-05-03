export default function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{ ...styles.card, borderColor: `${accent}22` }}>
      <div style={styles.iconWrap}>{icon}</div>
      <div style={{ ...styles.value, color: accent }}>{value}</div>
      <div style={styles.label}>{label}</div>
    </div>
  )
}

const styles = {
  card: { background: '#111827', border: '1px solid', borderRadius: 14, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', textAlign: 'center' },
  iconWrap: { marginBottom: 2 },
  value: { fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' },
  label: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 },
}
