export function groupLogsByYearMonth(logs) {
  const years = new Map()

  for (const log of logs) {
    const [y, m] = log.date.split('-')
    const year = `${y}년`
    const month = `${Number(m)}월`
    if (!years.has(year)) years.set(year, new Map())
    const months = years.get(year)
    if (!months.has(month)) months.set(month, [])
    months.get(month).push(log)
  }

  return years
}
