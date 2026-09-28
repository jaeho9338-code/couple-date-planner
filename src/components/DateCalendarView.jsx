import { useMemo, useState } from 'react'
import DateLogCard from './DateLogCard.jsx'

const days = ['일', '월', '화', '수', '목', '금', '토']
const moodEmoji = ['📍', '💕', '🌸', '🍜', '🎬', '☕️', '🌊', '🎡']

function emojiFor(log) {
  const key = log.id.charCodeAt(0) + log.id.charCodeAt(log.id.length - 1)
  return moodEmoji[key % moodEmoji.length]
}

export default function DateCalendarView({ logs, profiles, profile }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)

  const logsByDate = useMemo(() => {
    const map = {}
    for (const log of logs) {
      if (!map[log.date]) map[log.date] = []
      map[log.date].push(log)
    }
    return map
  }, [logs])

  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const changeMonth = (delta) => {
    let m = month + delta
    let y = year
    if (m < 1) { m = 12; y -= 1 }
    if (m > 12) { m = 1; y += 1 }
    setMonth(m)
    setYear(y)
    setSelectedDate(null)
  }

  const selectedLogs = selectedDate ? logsByDate[selectedDate] ?? [] : []

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button className="pill" onClick={() => changeMonth(-1)}>‹</button>
          <strong>{year}년 {month}월의 우리</strong>
          <button className="pill" onClick={() => changeMonth(1)}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
          {days.map((d, i) => (
            <div key={d} style={{ fontSize: 12, color: i === 0 ? 'var(--coral-500)' : 'var(--ink-600)', fontWeight: 700 }}>
              {d}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const dayLogs = logsByDate[dateStr]
            const isSelected = selectedDate === dateStr
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: '2px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: dayLogs?.[0]?.photo_urls?.[0] ? 0 : 15,
                    overflow: 'hidden',
                    border: dayLogs ? (isSelected ? '2px solid var(--coral-500)' : 'none') : '1.5px dashed var(--gray-200)',
                    background: dayLogs ? 'linear-gradient(160deg, var(--coral-400), var(--peach-300))' : 'transparent',
                  }}
                >
                  {dayLogs?.[0]?.photo_urls?.[0] ? (
                    <img
                      src={dayLogs[0].photo_urls[0]}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : dayLogs ? (
                    emojiFor(dayLogs[0])
                  ) : null}
                </div>
                <span style={{ fontSize: 10, color: dayLogs ? 'var(--ink-900)' : 'var(--gray-200)' }}>{d}</span>
              </button>
            )
          })}
        </div>
      </div>

      {selectedLogs.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {selectedLogs.map((log) => (
            <DateLogCard key={log.id} log={log} profiles={profiles} profile={profile} />
          ))}
        </div>
      )}
    </div>
  )
}
