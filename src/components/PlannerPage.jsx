import { useState } from 'react'
import { useDatePlans } from '../lib/useDatePlans.js'
import PlanCard from './PlanCard.jsx'
import PlanForm from './PlanForm.jsx'
import ScheduleCalendarView from './ScheduleCalendarView.jsx'
import EmptyState from './EmptyState.jsx'
import Skeleton from './Skeleton.jsx'

const filters = ['전체', '아이디어', '확정', '완료']
const subtabs = ['아이디어', '일정']

export default function PlannerPage({ profile, profiles }) {
  const { plans, loading } = useDatePlans()
  const [subtab, setSubtab] = useState('아이디어')
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('전체')

  const visible = filter === '전체' ? plans : plans.filter((p) => p.status === filter)

  return (
    <div>
      <div className="gradient-hero">
        <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
          데이트 플래너
        </span>
        <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>우리 다음엔 뭐 할까?</h1>
        <p style={{ opacity: 0.9, margin: 0, fontSize: 14 }}>떠오르는 대로 편하게 던져봐요 💭</p>
      </div>

      <div style={{ padding: '20px 16px', paddingBottom: 90 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {subtabs.map((t) => (
            <button key={t} className={`pill ${subtab === t ? 'active' : ''}`} onClick={() => setSubtab(t)}>
              {t}
            </button>
          ))}
        </div>

        {subtab === '일정' && <ScheduleCalendarView profile={profile} profiles={profiles} />}

        {subtab === '아이디어' && (
          <>
            <span style={{ fontSize: 12, color: 'var(--ink-600)', display: 'block', marginBottom: 6 }}>상태별로 보기</span>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {filters.map((f) => (
                <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>

            {showForm && (
              <div style={{ marginBottom: 16 }}>
                <PlanForm profile={profile} onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
              </div>
            )}

            {loading && <Skeleton count={2} height={120} />}

            {!loading && plans.length === 0 && !showForm && <EmptyState emoji="💭" text="아직 아이디어가 없어요. 뭐든 좋으니 던져봐요!" />}

            {!loading && plans.length > 0 && visible.length === 0 && !showForm && (
              <EmptyState emoji="🔍" text={`"${filter}" 상태인 계획이 없어요.`} />
            )}

            {!loading && visible.map((plan) => (
              <PlanCard key={plan.id} plan={plan} profile={profile} profiles={profiles} />
            ))}
          </>
        )}
      </div>

      {subtab === '아이디어' && !showForm && (
        <button className="fab" onClick={() => setShowForm(true)}>
          +
        </button>
      )}
    </div>
  )
}
