import { useState } from 'react'
import { useBucketItems } from '../lib/useBucketItems.js'
import { supabase } from '../lib/supabase.js'
import { todayStr } from '../lib/todayStr.js'
import BucketForm from './BucketForm.jsx'
import EmptyState from './EmptyState.jsx'
import Skeleton from './Skeleton.jsx'

const filters = ['전체', '여행', '맛집', '액티비티', '기타']

export default function BucketListPage({ profile }) {
  const { items, loading } = useBucketItems()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('전체')
  const [error, setError] = useState(null)

  const visible = filter === '전체' ? items : items.filter((i) => i.category === filter)
  const remaining = visible.filter((i) => !i.done)
  const done = visible.filter((i) => i.done)
  const total = items.length
  const doneCount = items.filter((i) => i.done).length
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  const toggle = async (item) => {
    setError(null)
    const { error: err } = await supabase
      .from('bucket_items')
      .update({ done: !item.done, done_at: !item.done ? todayStr() : null })
      .eq('id', item.id)
    if (err) setError('업데이트하지 못했어요, 다시 시도해줘')
  }

  return (
    <div>
      <div className="gradient-hero">
        <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
          버킷리스트
        </span>
        <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>함께 이루고 싶은 것</h1>
        <p style={{ opacity: 0.9, margin: 0, fontSize: 14 }}>둘이 함께라면 다 이룰 수 있을 거예요</p>
      </div>

      <div style={{ padding: '20px 16px', paddingBottom: 90 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-600)' }}>🏆 우리가 이룬 것</span>
          <div style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 8px' }}>
            {doneCount} <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-600)' }}>/ {total}</span>
          </div>
          <div style={{ height: 8, background: 'var(--cream-100)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--coral-500), var(--peach-300))' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {showForm && (
          <div style={{ marginBottom: 16 }}>
            <BucketForm profile={profile} onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {error && <p style={{ color: 'var(--coral-500)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        {loading && <Skeleton count={2} height={54} />}

        {!loading && items.length === 0 && !showForm && <EmptyState emoji="✨" text="아직 목록이 없어요. + 버튼으로 하고 싶은 걸 남겨보세요." />}

        {!loading && items.length > 0 && visible.length === 0 && !showForm && (
          <EmptyState emoji="🔍" text={`"${filter}" 카테고리엔 아직 없어요.`} />
        )}

        {!loading && remaining.length > 0 && (
          <>
            <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>💗 남은 꿈 {remaining.length}</h3>
            {remaining.map((item) =>
              editingId === item.id ? (
                <div key={item.id} style={{ marginBottom: 8 }}>
                  <BucketForm profile={profile} editItem={item} onDone={() => setEditingId(null)} onCancel={() => setEditingId(null)} />
                </div>
              ) : (
                <BucketRow key={item.id} item={item} onToggle={() => toggle(item)} onEdit={() => setEditingId(item.id)} />
              ),
            )}
          </>
        )}

        {!loading && done.length > 0 && (
          <>
            <h3 style={{ fontSize: 14, margin: '16px 0 8px' }}>🎉 이룬 것 {done.length}</h3>
            {done.map((item) =>
              editingId === item.id ? (
                <div key={item.id} style={{ marginBottom: 8 }}>
                  <BucketForm profile={profile} editItem={item} onDone={() => setEditingId(null)} onCancel={() => setEditingId(null)} />
                </div>
              ) : (
                <BucketRow key={item.id} item={item} onToggle={() => toggle(item)} onEdit={() => setEditingId(item.id)} />
              ),
            )}
          </>
        )}
      </div>

      {!showForm && (
        <button className="fab" onClick={() => setShowForm(true)}>
          +
        </button>
      )}
    </div>
  )
}

function BucketRow({ item, onToggle, onEdit }) {
  return (
    <div
      className="card card-clickable"
      style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}
      onClick={onToggle}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: item.done ? 'none' : '2px solid var(--gray-200)',
          background: item.done ? 'linear-gradient(160deg, var(--coral-500), var(--peach-300))' : 'transparent',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        {item.done ? '✓' : ''}
      </span>
      <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--ink-600)' : 'var(--ink-900)' }}>
        {item.title}
      </span>
      <span className="pill" style={{ fontSize: 11, padding: '3px 8px' }}>
        {item.category}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        style={{ background: 'none', border: 'none', fontSize: 14, color: 'var(--ink-600)', padding: 0, flexShrink: 0 }}
      >
        ✏️
      </button>
    </div>
  )
}
