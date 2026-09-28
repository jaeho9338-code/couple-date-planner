import { useState } from 'react'
import Avatar from './Avatar.jsx'
import { displayName, avatarUrl } from '../lib/useProfiles.js'
import DateLogForm from './DateLogForm.jsx'
import PhotoLightbox from './PhotoLightbox.jsx'

export default function DateLogCard({ log, profiles, profile }) {
  const [editing, setEditing] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const place = log.location_text ?? log.location_preset?.name ?? '장소 미정'

  if (editing) {
    return (
      <div style={{ marginBottom: 12 }}>
        <DateLogForm profile={profile} editLog={log} onDone={() => setEditing(false)} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--ink-600)' }}>{log.date}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}>
            <Avatar id={log.created_by} url={avatarUrl(log.created_by, profiles)} size={18} />
            {displayName(log.created_by, profiles)}
          </span>
          <button
            onClick={() => setEditing(true)}
            style={{ background: 'none', border: 'none', fontSize: 14, color: 'var(--ink-600)', padding: 0 }}
          >
            ✏️
          </button>
        </div>
      </div>
      <h3 style={{ margin: '6px 0 2px' }}>{log.title}</h3>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-600)' }}>📍 {place}</p>
      {log.memo && <p style={{ margin: '8px 0 0', fontSize: 14 }}>{log.memo}</p>}
      {log.photo_urls?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto' }}>
          {log.photo_urls.map((url, i) => (
            <img
              key={url}
              src={url}
              alt=""
              onClick={() => setLightboxIndex(i)}
              style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 12, flexShrink: 0, cursor: 'pointer' }}
            />
          ))}
        </div>
      )}
      {lightboxIndex !== null && (
        <PhotoLightbox photos={log.photo_urls} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  )
}
