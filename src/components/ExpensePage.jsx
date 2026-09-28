import { useMemo, useState } from 'react'
import { useExpenses } from '../lib/useExpenses.js'
import ExpenseForm from './ExpenseForm.jsx'
import MonthCalendar from './MonthCalendar.jsx'
import CategoryBars from './CategoryBars.jsx'
import Skeleton from './Skeleton.jsx'

export default function ExpensePage({ profile }) {
  const { expenses, loading } = useExpenses()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const monthExpenses = useMemo(
    () =>
      expenses.filter((e) => {
        const [y, m] = e.date.split('-')
        return Number(y) === year && Number(m) === month
      }),
    [expenses, year, month],
  )

  const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const avg = monthExpenses.length ? Math.round(total / monthExpenses.length) : 0

  const dailyTotals = useMemo(() => {
    const map = {}
    for (const e of monthExpenses) {
      map[e.date] = (map[e.date] ?? 0) + Number(e.amount)
    }
    return map
  }, [monthExpenses])

  const byCategory = useMemo(() => {
    const map = {}
    for (const e of monthExpenses) {
      const cat = e.category || '기타'
      map[cat] = (map[cat] ?? 0) + Number(e.amount)
    }
    return map
  }, [monthExpenses])

  const topCategory = useMemo(() => {
    const entries = Object.entries(byCategory)
    if (entries.length === 0) return null
    return entries.sort((a, b) => b[1] - a[1])[0][0]
  }, [byCategory])

  const changeMonth = (delta) => {
    let m = month + delta
    let y = year
    if (m < 1) { m = 12; y -= 1 }
    if (m > 12) { m = 1; y += 1 }
    setMonth(m)
    setYear(y)
  }

  return (
    <div>
      <div className="gradient-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="pill" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
              데이트 가계부
            </span>
            <h1 style={{ fontSize: 26, margin: '12px 0 4px' }}>{total.toLocaleString()}원</h1>
            <p style={{ opacity: 0.9, margin: 0, fontSize: 14 }}>
              {monthExpenses.length > 0
                ? `${year}년 ${month}월 · ${monthExpenses.length}회 · 1회 평균 ${avg.toLocaleString()}원`
                : '이번 달 데이트비, 얼마 썼는지 기록해봐요'}
            </p>
          </div>
          <button
            className="pill"
            style={{ background: '#fff', color: 'var(--coral-500)', whiteSpace: 'nowrap' }}
            onClick={() => setShowForm(true)}
          >
            + 지출 입력
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 16px', paddingBottom: 40 }}>
        {showForm && (
          <div style={{ marginBottom: 16 }}>
            <ExpenseForm profile={profile} onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {loading ? (
          <Skeleton count={2} height={120} />
        ) : (
          <>
            <MonthCalendar
              year={year}
              month={month}
              dailyTotals={dailyTotals}
              onPrev={() => changeMonth(-1)}
              onNext={() => changeMonth(1)}
            />

            {topCategory && (
              <p style={{ fontSize: 13, color: 'var(--ink-600)', margin: '12px 4px' }}>
                💸 이번 달은 <strong style={{ color: 'var(--coral-500)' }}>{topCategory}</strong>에 제일 많이 썼어요
              </p>
            )}

            <CategoryBars byCategory={byCategory} total={total} />

            {monthExpenses.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>지출 내역</h3>
                {monthExpenses.map((expense) =>
                  editingId === expense.id ? (
                    <div key={expense.id} style={{ marginBottom: 8 }}>
                      <ExpenseForm
                        profile={profile}
                        editExpense={expense}
                        onDone={() => setEditingId(null)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <ExpenseRow key={expense.id} expense={expense} onClick={() => setEditingId(expense.id)} />
                  ),
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ExpenseRow({ expense, onClick }) {
  const [, m, d] = expense.date.split('-')
  return (
    <div
      className="card card-clickable"
      style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}
      onClick={onClick}
    >
      <div style={{ textAlign: 'center', minWidth: 34, color: 'var(--coral-500)', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{Number(m)}월</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{Number(d)}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pill" style={{ fontSize: 11, padding: '3px 8px' }}>
            {expense.category}
          </span>
          {expense.memo && (
            <span style={{ fontSize: 13, color: 'var(--ink-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {expense.memo}
            </span>
          )}
        </div>
      </div>
      <div style={{ fontWeight: 700, flexShrink: 0 }}>{Number(expense.amount).toLocaleString()}원</div>
    </div>
  )
}
