import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const categories = ['여행', '맛집', '액티비티', '기타']

export default function BucketForm({ profile, editItem, onDone, onCancel }) {
  const isEdit = !!editItem
  const [title, setTitle] = useState(editItem?.title ?? '')
  const [category, setCategory] = useState(editItem?.category ?? '여행')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    const { error: err } = isEdit
      ? await supabase.from('bucket_items').update({ title, category }).eq('id', editItem.id)
      : await supabase.from('bucket_items').insert({ title, category, created_by: profile })
    setSaving(false)
    if (err) {
      setError('저장에 실패했어요, 다시 시도해줘')
      return
    }
    onDone()
  }

  const remove = async () => {
    if (!window.confirm('이 항목을 삭제할까요? 되돌릴 수 없어요.')) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('bucket_items').delete().eq('id', editItem.id)
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
        같이 하고 싶은 것
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 제주도에서 한 달 살기"
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        {categories.map((c) => (
          <button
            type="button"
            key={c}
            className={`pill ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {error && <p style={{ color: 'var(--coral-500)', fontSize: 13, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="pill" onClick={onCancel} style={{ flex: 1 }}>
          취소
        </button>
        <button type="submit" className="pill active" style={{ flex: 2 }} disabled={saving}>
          {saving ? '저장하는 중...' : isEdit ? '수정하기' : '꿈 목록에 추가'}
        </button>
      </div>
      {isEdit && (
        <button
          type="button"
          onClick={remove}
          disabled={saving}
          style={{ background: 'none', border: 'none', color: 'var(--coral-500)', fontSize: 13, textDecoration: 'underline', marginTop: 4 }}
        >
          이 항목 삭제하기
        </button>
      )}
    </form>
  )
}
