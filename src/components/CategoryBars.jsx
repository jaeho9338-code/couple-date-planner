export default function CategoryBars({ byCategory, total }) {
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return null

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <strong style={{ fontSize: 14 }}>카테고리별 지출</strong>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
        {entries.map(([cat, amt]) => {
          const pct = total ? Math.round((amt / total) * 100) : 0
          return (
            <div key={cat}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{cat}</span>
                <span style={{ color: 'var(--ink-600)' }}>
                  {amt.toLocaleString()}원 {pct}%
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--cream-100)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--coral-500), var(--peach-300))' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
