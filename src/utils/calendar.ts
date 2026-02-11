export type CalendarCell = {
  date: Date
  inCurrentMonth: boolean
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatHumanDateDMY(dateKey: string): string {
  const [year, month, day] = dateKey.split('-')
  if (!year || !month || !day) {
    return dateKey
  }

  return `${day}-${month}-${year}`
}

export function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function shiftMonth(base: Date, diff: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + diff, 1)
}

export function getCalendarCells(monthDate: Date): CalendarCell[] {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const cells: CalendarCell[] = []

  for (let i = startOffset; i > 0; i -= 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1 - i)
    cells.push({ date, inCurrentMonth: false })
  }

  for (let day = 1; day <= lastDay; day += 1) {
    cells.push({
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
      inCurrentMonth: true,
    })
  }

  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({
      date: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, nextDay),
      inCurrentMonth: false,
    })
    nextDay += 1
  }

  return cells
}

export function dateKeyToMonthStart(dateKey: string): Date {
  const [year, month] = dateKey.split('-')
  return new Date(Number(year), Number(month) - 1, 1)
}
