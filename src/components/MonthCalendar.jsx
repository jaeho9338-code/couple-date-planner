import { todayStr as getTodayStr } from '../lib/todayStr.js'

const days = ['일', '월', '화', '수', '목', '금', '토']

function fmtManwon(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  return `${n.toLocaleString()}원`
}

export default function MonthCalendar({ year, month, dailyTotals, onPrev, onNext }) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const todayStr = getTodayStr()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button className="pill" onClick={onPrev}>‹</button>
        <strong>{year}년 {month}월</strong>
        <button className="pill" onClick={onNext}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
        {days.map((d, i) => (
          <div key={d} style={{ fontSize: 12, color: i === 0 ? 'var(--coral-500)' : 'var(--ink-600)', fontWeight: 700 }}>
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const total = dailyTotals[dateStr]
          const isToday = dateStr === todayStr
          const isSunday = (firstDay + d - 1) % 7 === 0
          return (
            <div key={dateStr} style={{ padding: '4px 0' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  lineHeight: '26px',
                  margin: '0 auto',
                  borderRadius: '50%',
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 400,
                  border: isToday ? '1.5px solid var(--coral-500)' : 'none',
                  color: total ? 'var(--coral-500)' : isSunday ? '#e08a8a' : 'var(--ink-900)',
                }}
              >
                {d}
              </div>
              {total ? (
                <div style={{ fontSize: 10, color: 'var(--coral-500)', marginTop: 2 }}>{fmtManwon(total)}</div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
