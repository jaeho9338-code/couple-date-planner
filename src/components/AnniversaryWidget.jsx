import { useState } from 'react'
import { useAnniversaries } from '../lib/useAnniversaries.js'
import { upcomingAnniversaries, todaysAnniversaries } from '../lib/anniversaries.js'
import AnniversaryForm from './AnniversaryForm.jsx'
import Skeleton from './Skeleton.jsx'

export default function AnniversaryWidget({ profile, profiles }) {
  const { anniversaries, loading } = useAnniversaries()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const today = todaysAnniversaries(anniversaries)
  const upcoming = upcomingAnniversaries(anniversaries).filter((m) => m.daysUntil > 0)
  const nextThree = upcoming.slice(0, 3)

  const rawById = (id) => anniversaries.find((a) => a.id === id)

  if (loading) {
    return <Skeleton count={1} height={90} />
  }

  if (showForm || editingId) {
    return (
      <div style={{ marginBottom: 16 }}>
        <AnniversaryForm
          profile={profile}
          profiles={profiles}
          editAnniversary={editingId ? rawById(editingId) : null}
          onDone={() => {
            setShowForm(false)
            setEditingId(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingId(null)
          }}
        />
      </div>
    )
  }

  const openIfCustom = (item) => {
    if (item && !item.auto) setEditingId(item.id)
  }

  if (today.length > 0) {
    return (
      <div
        className="card"
        style={{
          marginBottom: 16,
          background: 'linear-gradient(160deg, #fff0d6, #ffe1e6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: today.some((t) => !t.auto) ? 'pointer' : 'default',
        }}
        onClick={() => openIfCustom(today.find((t) => !t.auto))}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>🎉 오늘은 {today.map((t) => t.title).join(', ')}이에요!</div>
          <div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 2 }}>축하해 우리, 오늘도 사랑해 💕</div>
        </div>
        <button className="pill" onClick={(e) => { e.stopPropagation(); setShowForm(true) }}>
          +
        </button>
      </div>
    )
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: nextThree.length > 0 ? 10 : 0 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-600)' }}>다가오는 기념일</span>
        <button className="pill" onClick={() => setShowForm(true)}>
          + 기념일 추가
        </button>
      </div>
      {nextThree.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {nextThree.map((item) => (
            <div
              key={`${item.title}-${item.date}`}
              onClick={() => openIfCustom(item)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: item.auto ? 'default' : 'pointer',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</span>
              <span style={{ color: 'var(--coral-500)', fontWeight: 700, fontSize: 13 }}>D-{item.daysUntil}</span>
            </div>
          ))}
        </div>
      ) : (
        <span style={{ fontSize: 13, color: 'var(--ink-600)' }}>챙길 기념일이 아직 없네요</span>
      )}
    </div>
  )
}
