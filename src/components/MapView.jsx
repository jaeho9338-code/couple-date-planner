import { useState } from 'react'
import { useDateLogs } from '../lib/useDateLogs.js'
import { useBucketItems } from '../lib/useBucketItems.js'
import { throwbackLogs } from '../lib/throwback.js'
import { daysTogether, startDateLabel } from '../lib/dday.js'
import AnniversaryWidget from './AnniversaryWidget.jsx'
import { displayName } from '../lib/useProfiles.js'
import DateLogRow from './DateLogRow.jsx'
import DateLogCard from './DateLogCard.jsx'
import EmptyState from './EmptyState.jsx'
import PhotoLightbox from './PhotoLightbox.jsx'

export default function MapView({ profile, profiles }) {
  const [showTimetable, setShowTimetable] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const { logs } = useDateLogs()
  const { items: bucketItems } = useBucketItems()
  const otherProfile = profile === 'A' ? 'B' : 'A'
  const otherTimetable = profiles?.[otherProfile]?.timetable_visible ? profiles[otherProfile]?.timetable_url : null

  const bucketDone = bucketItems.filter((i) => i.done).length
  const throwback = throwbackLogs(logs)
  const recent = logs.slice(0, 2)
  const photos = logs.flatMap((l) => l.photo_urls ?? []).slice(0, 9)

  return (
    <div>
      <div className="gradient-hero">
        <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
          {displayName('A', profiles)} ♥ {displayName('B', profiles)}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '12px 0 4px' }}>
          <span style={{ fontSize: 34, fontWeight: 800 }}>{daysTogether()}</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>일째</span>
          <span style={{ fontSize: 18 }}>💕</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ opacity: 0.9, margin: 0, fontSize: 14 }}>{startDateLabel()}</p>
          {otherTimetable && (
            <button
              onClick={() => setShowTimetable(true)}
              className="pill"
              style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
            >
              🗓️ {displayName(otherProfile, profiles)} 시간표
            </button>
          )}
        </div>
      </div>

      {showTimetable && otherTimetable && (
        <PhotoLightbox photos={[otherTimetable]} onClose={() => setShowTimetable(false)} />
      )}

      <div style={{ padding: '20px 16px' }}>
        <AnniversaryWidget profile={profile} profiles={profiles} />

        {throwback.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--coral-500)', margin: '0 0 8px' }}>
              📸 1년 전 오늘
            </p>
            {throwback.map((log) => (
              <DateLogCard key={log.id} log={log} profiles={profiles} profile={profile} />
            ))}
          </div>
        )}

        <div className="card" style={{ display: 'flex', marginBottom: 16 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{logs.length}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-600)' }}>우리가 만난 날들</div>
          </div>
          <div style={{ width: 1, background: 'var(--gray-200)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              {bucketDone}
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-600)' }}>/{bucketItems.length}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-600)' }}>이룬 버킷리스트</div>
          </div>
        </div>

        {recent.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-600)', margin: '0 0 8px' }}>
              최근 기록
            </p>
            {recent.map((log) => (
              <DateLogRow key={log.id} log={log} profile={profile} />
            ))}
          </div>
        )}

        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--coral-500)', margin: '0 0 8px' }}>
          📷 우리의 순간들
        </p>
        {photos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {photos.map((url, i) => (
              <img
                key={url}
                src={url}
                alt=""
                onClick={() => setLightboxIndex(i)}
                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 12, cursor: 'pointer' }}
              />
            ))}
          </div>
        ) : (
          <EmptyState emoji="📷" text="아직 사진이 없어요. 추억을 남겨볼까요?" />
        )}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox photos={photos} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  )
}
