import { useState } from 'react'
import { fetchRecommendation } from '../recommendClient.js'
import { useDateLogs } from '../lib/useDateLogs.js'
import EmptyState from './EmptyState.jsx'

export default function RecommendPage() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('feed')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const { logs } = useDateLogs()

  const submit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const recentLocations = [...new Set(logs.slice(0, 5).map((l) => l.location_preset?.name || l.location_text).filter(Boolean))]
      const data = await fetchRecommendation(prompt, mode, recentLocations)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="gradient-hero">
        <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
          오늘 어디갈까?
        </span>
        <h1 style={{ fontSize: 24, margin: '12px 0 4px' }}>오늘은 뭐 하고 놀까?</h1>
        <p style={{ opacity: 0.9, margin: 0, fontSize: 14 }}>편하게 말해봐요, 딱 맞는 데이트 찾아줄게요</p>
      </div>

      <div style={{ padding: '20px 16px', paddingBottom: 40 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className={`pill ${mode === 'feed' ? 'active' : ''}`} onClick={() => setMode('feed')}>
            장소 리스트
          </button>
          <button className={`pill ${mode === 'course' ? 'active' : ''}`} onClick={() => setMode('course')}>
            코스 짜기
          </button>
        </div>

        <form onSubmit={submit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === 'course'
                ? '예: 토요일 오후에 서면에서 반나절 코스 짜줘, 예산 8만원'
                : '예: 이번주 토요일 비오는데 서면에서 실내 데이트, 예산 5만원 이내'
            }
            rows={3}
            style={{ padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)', fontFamily: 'inherit' }}
          />
          <button type="submit" className="pill active" disabled={loading}>
            {loading ? '고민하는 중...' : mode === 'course' ? '코스 짜줘!' : '추천해줘!'}
          </button>
        </form>

        {error && (
          <p style={{ color: 'var(--coral-500)', marginTop: 12, fontSize: 14 }}>
            {error} 잠시 후 다시 시도해줘요
            {import.meta.env.DEV && (
              <>
                {' '}
                (로컬 개발 서버는 <code>node server/api-server.js</code>로 따로 실행해야 해요)
              </>
            )}
          </p>
        )}

        {result?.note && (
          <p style={{ textAlign: 'center', color: 'var(--ink-600)', marginTop: 24 }}>{result.note}</p>
        )}

        {result?.isHome && result.picks?.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-600)', margin: 0 }}>🏠 오늘은 집에서 이런 거 어때요?</p>
            {result.picks.map((p) => (
              <div key={p.name} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>{p.name}</h3>
                  <span style={{ fontSize: 12, color: 'var(--ink-600)' }}>{p.category}</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14 }}>{p.reason}</p>
              </div>
            ))}
          </div>
        )}

        {!result?.note && !result?.isHome && mode === 'feed' && result?.picks?.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.usedFreeform && (
              <p style={{ fontSize: 12, color: 'var(--ink-600)', margin: 0 }}>
                💡 부산-양산 데이터가 아니라 일반 지식으로 추천했어요
              </p>
            )}
            {result.picks.map((p) => (
              <div key={p.name} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>{p.name}</h3>
                  <span style={{ fontSize: 12, color: 'var(--ink-600)' }}>📍 {p.area}</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14 }}>{p.reason}</p>
              </div>
            ))}
          </div>
        )}

        {!result?.note && !result?.isHome && mode === 'feed' && result && result.picks?.length === 0 && (
          <EmptyState emoji="🤔" text="조건에 맞는 곳을 못 찾았어요. 다르게 말해볼까요?" />
        )}

        {!result?.note && !result?.isHome && mode === 'course' && result?.stops?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {result.usedFreeform && (
              <p style={{ fontSize: 12, color: 'var(--ink-600)', margin: '0 0 12px' }}>
                💡 부산-양산 데이터가 아니라 일반 지식으로 추천했어요
              </p>
            )}
            <div className="card" style={{ marginBottom: 12 }}>
              <span className="pill active" style={{ marginBottom: 8 }}>
                📍 {result.courseArea}
              </span>
              <p style={{ margin: '8px 0 0', fontSize: 14 }}>{result.summary}</p>
            </div>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 9,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: 'var(--gray-200)',
                }}
              />
              {result.stops.map((s, i) => (
                <div key={s.name} style={{ position: 'relative', marginBottom: 16 }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: -24,
                      top: 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'linear-gradient(160deg, var(--coral-500), var(--peach-300))',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h3 style={{ margin: 0 }}>{s.name}</h3>
                      <span style={{ fontSize: 12, color: 'var(--ink-600)' }}>{s.timeHint}</span>
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: 14 }}>{s.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result?.note && !result?.isHome && mode === 'course' && result && result.stops?.length === 0 && (
          <EmptyState emoji="🤔" text="조건에 맞는 코스를 못 짰어요. 다르게 말해볼까요?" />
        )}
      </div>
    </div>
  )
}
