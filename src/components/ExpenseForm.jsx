import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { todayStr } from '../lib/todayStr.js'

export default function ExpenseForm({ profile, editExpense, onDone, onCancel }) {
  const isEdit = !!editExpense
  const [date, setDate] = useState(() => editExpense?.date ?? todayStr())
  const [amount, setAmount] = useState(editExpense?.amount ?? '')
  const [category, setCategory] = useState(editExpense?.category ?? '')
  const [memo, setMemo] = useState(editExpense?.memo ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!amount) return
    setSaving(true)
    setError(null)
    const payload = {
      date,
      amount: Number(amount),
      category: category || '기타',
      memo,
      paid_by: profile,
    }
    const { error: err } = isEdit
      ? await supabase.from('expenses').update(payload).eq('id', editExpense.id)
      : await supabase.from('expenses').insert(payload)
    setSaving(false)
    if (err) {
      setError('저장에 실패했어요, 다시 시도해줘')
      return
    }
    onDone()
  }

  const remove = async () => {
    if (!window.confirm('이 지출 기록을 삭제할까요? 되돌릴 수 없어요.')) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('expenses').delete().eq('id', editExpense.id)
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
        날짜
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        금액
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        카테고리
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="맛집, 카페, 영화 ..."
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        메모
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="뭐 하는 데 썼어요?"
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>
      {error && <p style={{ color: 'var(--coral-500)', fontSize: 13, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="pill" onClick={onCancel} style={{ flex: 1 }}>
          취소
        </button>
        <button type="submit" className="pill active" style={{ flex: 2 }} disabled={saving}>
          {saving ? '저장하는 중...' : isEdit ? '수정하기' : '지출 남기기'}
        </button>
      </div>
      {isEdit && (
        <button
          type="button"
          onClick={remove}
          disabled={saving}
          style={{ background: 'none', border: 'none', color: 'var(--coral-500)', fontSize: 13, textDecoration: 'underline', marginTop: 4 }}
        >
          이 지출 삭제하기
        </button>
      )}
    </form>
  )
}
