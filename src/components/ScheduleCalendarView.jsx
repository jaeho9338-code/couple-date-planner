import { useMemo, useState } from 'react'
import { useSchedules } from '../lib/useSchedules.js'
import { expandSchedulesForMonth } from '../lib/expandSchedules.js'
import { displayName } from '../lib/useProfiles.js'
import { todayStr } from '../lib/todayStr.js'
import ScheduleForm from './ScheduleForm.jsx'
import EmptyState from './EmptyState.jsx'
import Skeleton from './Skeleton.jsx'

const days = ['일', '월', '화', '수', '목', '금', '토']

function ownerColor(owner) {
  return owner === 'A' ? 'var(--blue-a)' : 'var(--pink-b)'
}

export default function ScheduleCalendarView({ profile, profiles }) {
  const { schedules, loading } = useSchedules()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const occurrences = useMemo(() => expandSchedulesForMonth(schedules, year, month), [schedules, year, month])

  const byDate = useMemo(() => {
    const map = {}
    for (const o of occurrences) {
      if (!map[o.occurrenceDate]) map[o.occurrenceDate] = []
      map[o.occurrenceDate].push(o)
    }
    return map
  }, [occurrences])

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

  const selectedOccurrences = selectedDate ? byDate[selectedDate] ?? [] : []
  const editingSchedule = editingId ? schedules.find((s) => s.id === editingId) : null

  if (showForm) {
    return (
      <div style={{ marginBottom: 16 }}>
        <ScheduleForm profile={profile} onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  if (editingSchedule) {
    return (
      <div style={{ marginBottom: 16 }}>
        <ScheduleForm profile={profile} editSchedule={editingSchedule} onDone={() => setEditingId(null)} onCancel={() => setEditingId(null)} />
      </div>
    )
  }

  return (
    <div>
      {loading && <Skeleton count={2} height={40} />}

      {!loading && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <button className="pill" onClick={() => changeMonth(-1)}>‹</button>
              <strong>{year}년 {month}월 일정</strong>
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
                const dayOccurrences = byDate[dateStr]
                const owners = [...new Set((dayOccurrences ?? []).map((o) => o.owner))]
                const isSelected = selectedDate === dateStr
                const isToday = dateStr === todayStr()
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    style={{
                      border: isSelected ? '1.5px solid var(--coral-500)' : 'none',
                      borderRadius: 10,
                      background: isToday ? 'var(--cream-100)' : 'none',
                      padding: '4px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400 }}>{d}</span>
                    <span style={{ display: 'flex', gap: 2, height: 6 }}>
                      {owners.map((owner) => (
                        <span key={owner} style={{ width: 6, height: 6, borderRadius: '50%', background: ownerColor(owner) }} />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedDate && (
            <div style={{ marginTop: 16 }}>
              {selectedOccurrences.length === 0 ? (
                <EmptyState emoji="🗓" text="이 날은 등록된 일정이 없어요." />
              ) : (
                selectedOccurrences.map((o) => (
                  <div
                    key={o.id}
                    className="card card-clickable"
                    style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}
                    onClick={() => setEditingId(o.id)}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: ownerColor(o.owner), flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{o.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-600)' }}>
                        {displayName(o.owner, profiles)}
                        {o.start_time && ` · ${o.start_time.slice(0, 5)}${o.end_time ? `~${o.end_time.slice(0, 5)}` : ''}`}
                        {o.recurring === 'weekly' && ' · 매주 반복'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {!showForm && !editingSchedule && (
        <button className="fab" onClick={() => setShowForm(true)}>
          +
        </button>
      )}
    </div>
  )
}
