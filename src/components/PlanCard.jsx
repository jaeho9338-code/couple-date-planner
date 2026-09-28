import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import Avatar from './Avatar.jsx'
import { displayName, avatarUrl } from '../lib/useProfiles.js'
import { todayStr } from '../lib/todayStr.js'

const statusColor = {
  아이디어: { bg: '#f3ece8', text: 'var(--ink-600)' },
  확정: { bg: '#ffe1e6', text: 'var(--coral-500)' },
  완료: { bg: '#e6f4ea', text: '#2e8b57' },
}

export default function PlanCard({ plan, profile, profiles }) {
  const color = statusColor[plan.status]
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const confirm = async () => {
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.from('date_plans').update({ status: '확정' }).eq('id', plan.id)
    if (err) setError('확정하지 못했어요, 다시 시도해줘')
    setBusy(false)
  }

  const complete = async () => {
    setBusy(true)
    setError(null)
    const { error: logErr } = await supabase.from('date_logs').insert({
      date: plan.proposed_date || todayStr(),
      title: plan.title,
      location_preset_id: plan.location_preset_id ?? null,
      location_text: plan.location_preset_id ? null : plan.proposed_place,
      created_by: profile,
    })
    if (logErr) {
      setError('기록으로 옮기지 못했어요, 다시 시도해줘')
      setBusy(false)
      return
    }
    const { error: planErr } = await supabase.from('date_plans').update({ status: '완료' }).eq('id', plan.id)
    if (planErr) setError('상태 변경에 실패했어요, 다시 시도해줘')
    setBusy(false)
  }

  const remove = async () => {
    if (!window.confirm('이 계획을 삭제할까요? 되돌릴 수 없어요.')) return
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.from('date_plans').delete().eq('id', plan.id)
    if (err) {
      setError('삭제에 실패했어요, 다시 시도해줘')
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          className="pill"
          style={{ background: color.bg, color: color.text, fontSize: 12, padding: '4px 10px' }}
        >
          {plan.status}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}>
          <Avatar id={plan.created_by} url={avatarUrl(plan.created_by, profiles)} size={18} />
          {displayName(plan.created_by, profiles)}
        </span>
      </div>
      <h3 style={{ margin: '8px 0 2px' }}>{plan.title}</h3>
      {plan.proposed_place && <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-600)' }}>📍 {plan.proposed_place}</p>}
      {plan.proposed_date && <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--ink-600)' }}>🗓 {plan.proposed_date}</p>}
      {error && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--coral-500)' }}>{error}</p>}

      {plan.status !== '완료' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {plan.status === '아이디어' && (
            <button className="pill" onClick={confirm} disabled={busy}>
              확정하기
            </button>
          )}
          <button className="pill active" onClick={complete} disabled={busy}>
            다녀왔어요
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        style={{ background: 'none', border: 'none', color: 'var(--coral-500)', fontSize: 12, textDecoration: 'underline', marginTop: 10, padding: 0 }}
      >
        이 계획 삭제하기
      </button>
    </div>
  )
}
