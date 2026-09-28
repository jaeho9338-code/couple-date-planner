// demo value — replace with the real start date
const START_DATE = '2024-01-01'

export function startDateLabel() {
  const [y, m, d] = START_DATE.split('-')
  return `${y}.${m}.${d}부터`
}

export function daysTogether() {
  const start = new Date(START_DATE + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  return diff + 1
}
