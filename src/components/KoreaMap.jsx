import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useDateLogs } from '../lib/useDateLogs.js'
import DateLogForm from './DateLogForm.jsx'
import DateLogCard from './DateLogCard.jsx'

export default function KoreaMap({ profile, profiles }) {
  const [selected, setSelected] = useState(null)
  const [svg, setSvg] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [presets, setPresets] = useState([])
  const { logs } = useDateLogs()

  useEffect(() => {
    fetch('/maps/korea_provinces.svg')
      .then((res) => res.text())
      .then(setSvg)
    supabase
      .from('location_presets')
      .select('*')
      .then(({ data }) => setPresets(data ?? []))
  }, [])

  // 부산-양산 지도에서 남긴 기록(location_preset_id)도 전국 지도에 반영: 양산만 경남, 나머지는 부산
  const logSlug = (log) => {
    if (log.region) return log.region
    const presetName = presets.find((p) => p.id === log.location_preset_id)?.name
    if (!presetName) return null
    return presetName === '양산' ? 'gyeongnam' : 'busan'
  }

  const visitedSlugs = [...new Set(logs.map(logSlug).filter(Boolean))]

  const handleClick = (e) => {
    const path = e.target.closest('path')
    if (!path) return
    setShowForm(false)
    setSelected({ slug: path.id, name: path.dataset.name })
  }

  const regionLogs = selected ? logs.filter((l) => logSlug(l) === selected.slug) : []

  return (
    <div>
      <div className="gradient-hero">
        <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
          전국 정복도
        </span>
        <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>대한민국</h1>
        <p style={{ opacity: 0.9, margin: 0, fontSize: 14 }}>
          우리 발자국이 닿은 곳이 물들어요 · {visitedSlugs.length} / 17
        </p>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <div className="card" style={{ padding: 12 }}>
          {svg ? (
            <div
              onClick={handleClick}
              className="korea-map"
              style={{ width: '100%' }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <p className="loading-text" style={{ color: 'var(--ink-600)', fontSize: 13, textAlign: 'center', margin: '40px 0' }}>
              지도를 불러오는 중...
            </p>
          )}
        </div>

        {selected && (
          <div className="card" style={{ marginTop: 12 }}>
            <strong>{selected.name}</strong>
            <p style={{ color: 'var(--ink-600)', fontSize: 13, margin: '4px 0 12px' }}>
              {regionLogs.length > 0 ? `우리 여기 ${regionLogs.length}번 왔었네요 🥰` : '아직 못 가본 곳이에요, 같이 가볼까요?'}
            </p>

            {regionLogs.map((log) => (
              <DateLogCard key={log.id} log={log} profiles={profiles} profile={profile} />
            ))}

            {showForm ? (
              <DateLogForm
                profile={profile}
                region={selected.slug}
                regionName={selected.name}
                onDone={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <button className="pill active" onClick={() => setShowForm(true)}>
                + 여기서의 순간 남기기
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        .korea-map path {
          fill: var(--gray-200);
          stroke: #fff;
          stroke-width: 1;
          cursor: pointer;
          transition: fill 0.15s;
        }
        ${visitedSlugs.map((s) => `.korea-map path#${s} { fill: var(--coral-500); }`).join('\n')}
        .korea-map path:hover {
          fill: var(--coral-400);
        }
      `}</style>
    </div>
  )
}
