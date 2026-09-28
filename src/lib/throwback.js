export function throwbackLogs(logs, today = new Date()) {
  const mm = today.getMonth() + 1
  const dd = today.getDate()
  return logs.filter((l) => {
    const [y, m, d] = l.date.split('-').map(Number)
    return m === mm && d === dd && y !== today.getFullYear()
  })
}
