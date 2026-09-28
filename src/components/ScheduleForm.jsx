import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { todayStr } from '../lib/todayStr.js'

const weekdays = [
  { day: 1, label: '월' },
  { day: 2, label: '화' },
  { day: 3, label: '수' },
  { day: 4, label: '목' },
  { day: 5, label: '금' },
  { day: 6, label: '토' },
  { day: 0, label: '일' },
]

export default function ScheduleForm({ profile, editSchedule, onDone, onCancel }) {
  const isEdit = !!editSchedule
  const [title, setTitle] = useState(editSchedule?.title ?? '')
  const [recurring, setRecurring] = useState(editSchedule?.recurring ?? 'none')
  const [recurringDays, setRecurringDays] = useState(editSchedule?.recurring_days ?? [])
  const [date, setDate] = useState(editSchedule?.date ?? todayStr())
  const [endDate, setEndDate] = useState(editSchedule?.end_date ?? '')
  const [startTime, setStartTime] = useState(editSchedule?.start_time?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(editSchedule?.end_time?.slice(0, 5) ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const toggleDay = (day) => {
    setRecurringDays((days) => (days.includes(day) ? days.filter((d) => d !== day) : [...days, day]))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    if (recurring === 'weekly' && recurringDays.length === 0) {
      setError('반복할 요일을 하나 이상 골라줘')
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      title,
      recurring,
      recurring_days: recurring === 'weekly' ? recurringDays : null,
      date,
      end_date: recurring === 'weekly' && endDate ? endDate : null,
      start_time: startTime || null,
      end_time: endTime || null,
      owner: isEdit ? editSchedule.owner : profile,
      created_by: profile,
    }
    const { error: err } = isEdit
      ? await supabase.from('schedules').update(payload).eq('id', editSchedule.id)
      : await supabase.from('schedules').insert(payload)
    setSaving(false)
    if (err) {
      setError('저장에 실패했어요, 다시 시도해줘')
      return
    }
    onDone()
  }

  const remove = async () => {
    if (!window.confirm('이 일정을 삭제할까요? 되돌릴 수 없어요.')) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('schedules').delete().eq('id', editSchedule.id)
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
        일정 이름
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 학교 수업, 야근, 출장"
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className={`pill ${recurring === 'none' ? 'active' : ''}`}
          onClick={() => setRecurring('none')}
        >
          한 번만
        </button>
        <button
          type="button"
          className={`pill ${recurring === 'weekly' ? 'active' : ''}`}
          onClick={() => setRecurring('weekly')}
        >
          매주 반복
        </button>
      </div>

      {recurring === 'weekly' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {weekdays.map(({ day, label }) => (
            <button
              type="button"
              key={day}
              className={`pill ${recurringDays.includes(day) ? 'active' : ''}`}
              onClick={() => toggleDay(day)}
              style={{ padding: '6px 10px' }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
        {recurring === 'weekly' ? '시작일' : '날짜'}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
        />
      </label>

      {recurring === 'weekly' && (
        <label style={{ fontSize: 13, color: 'var(--ink-600)' }}>
          종료일 (선택, 비워두면 계속 반복)
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
          />
        </label>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ flex: 1, fontSize: 13, color: 'var(--ink-600)' }}>
          시작 시간 (선택)
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
          />
        </label>
        <label style={{ flex: 1, fontSize: 13, color: 'var(--ink-600)' }}>
          종료 시간 (선택)
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 12, border: '1px solid var(--gray-200)' }}
          />
        </label>
      </div>

      {error && <p style={{ color: 'var(--coral-500)', fontSize: 13, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="pill" onClick={onCancel} style={{ flex: 1 }}>
          취소
        </button>
        <button type="submit" className="pill active" style={{ flex: 2 }} disabled={saving}>
          {saving ? '저장하는 중...' : isEdit ? '수정하기' : '일정 등록'}
        </button>
      </div>
      {isEdit && (
        <button
          type="button"
          onClick={remove}
          disabled={saving}
          style={{ background: 'none', border: 'none', color: 'var(--coral-500)', fontSize: 13, textDecoration: 'underline', marginTop: 4 }}
        >
          이 일정 삭제하기
        </button>
      )}
    </form>
  )
}
