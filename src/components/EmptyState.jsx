export default function EmptyState({ emoji = '🌱', text }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-600)' }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{emoji}</div>
      <p style={{ margin: 0, fontSize: 14 }}>{text}</p>
    </div>
  )
}
