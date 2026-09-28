import { todayStr as toDateStr } from './todayStr.js'

const START_DATE = '2024-01-01' // demo value — should match src/lib/dday.js

// 100일 단위 + N주년 자동 계산 (10년치)
export function autoMilestones() {
  const start = new Date(START_DATE + 'T00:00:00')
  const milestones = []

  for (let d = 100; d <= 3650; d += 100) {
    const date = new Date(start)
    date.setDate(date.getDate() + d - 1)
    milestones.push({ title: `${d}일`, date: toDateStr(date), auto: true })
  }

  for (let y = 1; y <= 10; y++) {
    const date = new Date(start)
    date.setFullYear(date.getFullYear() + y)
    milestones.push({ title: `${y}주년`, date: toDateStr(date), auto: true })
  }

  return milestones
}

function nextOccurrence(dateStr, repeatYearly, todayStr) {
  if (!repeatYearly) return dateStr
  const today = new Date(todayStr + 'T00:00:00')
  const original = new Date(dateStr + 'T00:00:00')
  const next = new Date(original)
  next.setFullYear(today.getFullYear())
  if (toDateStr(next) < todayStr) next.setFullYear(today.getFullYear() + 1)
  return toDateStr(next)
}

// auto 기념일 + 커스텀 기념일을 합쳐서 오늘 기준으로 정렬
export function upcomingAnniversaries(customAnniversaries, todayStr = toDateStr(new Date())) {
  const auto = autoMilestones()
  const custom = customAnniversaries.map((a) => ({
    title: a.title,
    date: nextOccurrence(a.date, a.repeat_yearly, todayStr),
    auto: false,
    id: a.id,
  }))

  return [...auto, ...custom]
    .map((m) => {
      const diff = Math.round((new Date(m.date + 'T00:00:00') - new Date(todayStr + 'T00:00:00')) / (1000 * 60 * 60 * 24))
      return { ...m, daysUntil: diff }
    })
    .filter((m) => m.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
}

export function todaysAnniversaries(customAnniversaries, todayStr = toDateStr(new Date())) {
  return upcomingAnniversaries(customAnniversaries, todayStr).filter((m) => m.daysUntil === 0)
}
