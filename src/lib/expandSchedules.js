export function expandSchedulesForMonth(schedules, year, month) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const occurrences = []

  for (const s of schedules) {
    if (s.recurring === 'weekly') {
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        if (dateStr < s.date) continue
        if (s.end_date && dateStr > s.end_date) continue
        const weekday = new Date(year, month - 1, d).getDay()
        if (!s.recurring_days?.includes(weekday)) continue
        occurrences.push({ ...s, occurrenceDate: dateStr })
      }
    } else {
      const [y, m] = s.date.split('-').map(Number)
      if (y === year && m === month) {
        occurrences.push({ ...s, occurrenceDate: s.date })
      }
    }
  }

  return occurrences
}
