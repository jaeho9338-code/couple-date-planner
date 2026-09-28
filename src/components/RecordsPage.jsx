import { useState } from 'react'
import { useDateLogs } from '../lib/useDateLogs.js'
import { groupLogsByYearMonth } from '../lib/groupByMonth.js'
import DateLogCard from './DateLogCard.jsx'
import DateLogRow from './DateLogRow.jsx'
import DateLogForm from './DateLogForm.jsx'
import DateCalendarView from './DateCalendarView.jsx'
import EmptyState from './EmptyState.jsx'
import Skeleton from './Skeleton.jsx'

export default function RecordsPage({ profile, profiles }) {
  const { logs, loading } = useDateLogs()
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState('calendar')

  const grouped = groupLogsByYearMonth(logs)

  return (
    <div>
      <div className="gradient-hero">
        <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
          우리의 기록
        </span>
        <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>{logs.length}번의 추억</h1>
        <p style={{ opacity: 0.9, margin: 0, fontSize: 14 }}>우리 둘이 함께 쌓아온 시간들</p>
      </div>

      <div style={{ padding: '20px 16px', paddingBottom: 90 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className={`pill ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
            캘린더
          </button>
          <button className={`pill ${view === 'timeline' ? 'active' : ''}`} onClick={() => setView('timeline')}>
            타임라인
          </button>
          <button className={`pill ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
            리스트
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: 16 }}>
            <DateLogForm profile={profile} onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {loading && <Skeleton count={3} />}

        {!loading && logs.length === 0 && !showForm && <EmptyState emoji="📍" text="아직 채워지지 않았어요. 첫 추억을 남겨볼까요?" />}

        {!loading && view === 'calendar' && logs.length > 0 && <DateCalendarView logs={logs} profiles={profiles} profile={profile} />}

        {!loading && view === 'list' && logs.map((log) => <DateLogRow key={log.id} log={log} profile={profile} />)}

        {!loading && view === 'timeline' &&
          [...grouped.entries()].map(([year, months]) => (
            <div key={year} style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>{year}</h2>
              {[...months.entries()].map(([month, monthLogs]) => (
                <div key={month} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--coral-500)',
                      background: 'var(--cream-100)',
                      borderRadius: 999,
                      padding: '4px 12px',
                      marginBottom: 10,
                    }}
                  >
                    {month} · {monthLogs.length}곳
                  </div>
                  {monthLogs.map((log) => (
                    <DateLogCard key={log.id} log={log} profiles={profiles} profile={profile} />
                  ))}
                </div>
              ))}
            </div>
          ))}
      </div>

      {!showForm && (
        <button className="fab" onClick={() => setShowForm(true)}>
          +
        </button>
      )}
    </div>
  )
}
