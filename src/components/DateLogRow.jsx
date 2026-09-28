import { useState } from 'react'
import DateLogForm from './DateLogForm.jsx'
import PhotoLightbox from './PhotoLightbox.jsx'

export default function DateLogRow({ log, profile }) {
  const [editing, setEditing] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const place = log.location_text ?? log.location_preset?.name ?? '장소 미정'
  const [, m, d] = log.date.split('-')
  const thumb = log.photo_urls?.[0]

  if (editing) {
    return (
      <div style={{ marginBottom: 10 }}>
        <DateLogForm profile={profile} editLog={log} onDone={() => setEditing(false)} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div
      className="card card-clickable"
      style={{ marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}
      onClick={() => setEditing(true)}
    >
      <div style={{ textAlign: 'center', minWidth: 34, color: 'var(--coral-500)', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{Number(m)}월</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{Number(d)}</div>
      </div>

      {thumb ? (
        <img
          src={thumb}
          alt=""
          onClick={(e) => {
            e.stopPropagation()
            setShowLightbox(true)
          }}
          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 12, flexShrink: 0, cursor: 'pointer' }}
        />
      ) : (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: 'var(--cream-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          📍
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.title}</h3>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--coral-500)' }}>📍 {place}</p>
        {log.memo && (
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {log.memo}
          </p>
        )}
      </div>
      <span style={{ fontSize: 14, color: 'var(--ink-600)' }}>✏️</span>
      {showLightbox && (
        <PhotoLightbox photos={log.photo_urls} onClose={() => setShowLightbox(false)} />
      )}
    </div>
  )
}
