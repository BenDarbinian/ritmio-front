import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateKey, getCalendarCells, getMonthLabel, shiftMonth } from '../../utils/calendar'
import './Calendar.css'

type CalendarProps = {
  selectedDate: string
  viewMonth: Date
  onViewMonthChange: (next: Date) => void
  onSelectDate: (dateKey: string) => void
  size?: 'default' | 'compact'
}

function Calendar({
  selectedDate,
  viewMonth,
  onViewMonthChange,
  onSelectDate,
  size = 'default',
}: CalendarProps) {
  const cells = useMemo(() => getCalendarCells(viewMonth), [viewMonth])
  const todayKey = formatDateKey(new Date())

  return (
    <div className={`calendar ${size === 'compact' ? 'calendar--compact' : ''}`}>
      <div className="calendar__head">
        <button
          type="button"
          className="calendar__nav-btn"
          onClick={() => onViewMonthChange(shiftMonth(viewMonth, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <p className="calendar__month-label">{getMonthLabel(viewMonth)}</p>
        <button
          type="button"
          className="calendar__nav-btn"
          onClick={() => onViewMonthChange(shiftMonth(viewMonth, 1))}
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="calendar__weekdays">
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
        <span>Su</span>
      </div>

      <div className="calendar__grid">
        {cells.map(({ date, inCurrentMonth }) => {
          const key = formatDateKey(date)
          const isSelected = key === selectedDate
          const isToday = key === todayKey

          return (
            <button
              key={key}
              type="button"
              className={`calendar__day ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''} ${inCurrentMonth ? '' : 'is-outside'}`}
              onClick={() => {
                onSelectDate(key)
                if (!inCurrentMonth) {
                  onViewMonthChange(new Date(date.getFullYear(), date.getMonth(), 1))
                }
              }}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
