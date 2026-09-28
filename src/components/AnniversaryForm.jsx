import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { displayName } from '../lib/useProfiles.js'

export default function AnniversaryForm({ profile, profiles, editAnniversary, onDone, onCancel }) {
  const isEdit = !!editAnniversary
  const [title, setTitle] = useState(editAnniversary?.title ?? '')
  const [date, setDate] = useState(editAnniversary?.date ?? '')
  const [repeatYearly, setRepeatYearly] = useState(editAnniversary?.repeat_yearly ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !date) return
    setSaving(true)
    setError(null)
    const payload = { title, date, repeat_yearly: repeatYearly, created_by: profile }
    const { error: err } = isEdit
      ? await supabase.from('anniversaries').update(payload).eq('id', editAnniversary.id)
      : await supabase.from('anniversaries').insert(payload)
    setSaving(false)
    if (err) {
      setError('저장에 실패했어요, 다시 시도해줘')
      return
    }
    onDone()
  }

  const remove = async () => {
    if (!window.confirm('이 기념일을 삭제할까요? 되돌릴 수 없어요.')) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('anniversaries').delete().eq('id', editAnniversary.id)
    if (err) {
      setError('삭제에 실패했어요: ' + err.message)
      setSaving(false)
      return
    }
    onDone()
  }

  return (
    <form onSubmit={submit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        기념일 이름
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`예: ${displayName('B', profiles)} 생일`}
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        날짜
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-600)' }}>
        <input type="checkbox" checked={repeatYearly} onChange={(e) => setRepeatYearly(e.target.checked)} />
        매년 반복 (생일 등)
      </label>
      {error && <p style={{ color: 'var(--coral-500)', fontSize: 13, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="pill" onClick={onCancel} style={{ flex: 1 }}>
          취소
        </button>
        <button type="submit" className="pill active" style={{ flex: 2 }} disabled={saving}>
          {saving ? '저장하는 중...' : isEdit ? '수정하기' : '기념일 등록'}
        </button>
      </div>
      {isEdit && (
        <button
          type="button"
          onClick={remove}
          disabled={saving}
          style={{ background: 'none', border: 'none', color: 'var(--coral-500)', fontSize: 13, textDecoration: 'underline', marginTop: 4 }}
        >
          이 기념일 삭제하기
        </button>
      )}
    </form>
  )
}
