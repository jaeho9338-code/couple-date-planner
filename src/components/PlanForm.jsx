import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function PlanForm({ profile, onDone, onCancel }) {
  const [title, setTitle] = useState('')
  const [presets, setPresets] = useState([])
  const [presetId, setPresetId] = useState('')
  const [place, setPlace] = useState('')
  const [proposedDate, setProposedDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('location_presets')
      .select('*')
      .then(({ data }) => setPresets(data ?? []))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    const preset = presets.find((p) => p.id === presetId)
    const { error: err } = await supabase.from('date_plans').insert({
      title,
      location_preset_id: presetId || null,
      proposed_place: presetId ? preset?.name : place || null,
      proposed_date: proposedDate || null,
      created_by: profile,
    })
    setSaving(false)
    if (err) {
      setError('저장에 실패했어요, 다시 시도해줘')
      return
    }
    onDone()
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        아이디어
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 같이 영화 보러 가기"
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        장소 (선택)
        <select
          value={presetId}
          onChange={(e) => setPresetId(e.target.value)}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)', background: '#fff' }}
        >
          <option value="">직접 입력</option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      {!presetId && (
        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="어디로 가고 싶어요?"
          style={{ display: 'block', width: '100%', padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      )}
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        예정일 (선택)
        <input
          type="date"
          value={proposedDate}
          onChange={(e) => setProposedDate(e.target.value)}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      {error && <p style={{ color: 'var(--coral-500)', fontSize: 13, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="pill" onClick={onCancel} style={{ flex: 1 }}>
          취소
        </button>
        <button type="submit" className="pill active" style={{ flex: 2 }} disabled={saving}>
          {saving ? '저장하는 중...' : '아이디어 던지기'}
        </button>
      </div>
    </form>
  )
}
