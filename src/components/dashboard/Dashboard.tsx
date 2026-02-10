import { useMemo, useState } from 'react'
import { CalendarDays, LogOut } from 'lucide-react'
import type { MeResponse } from '../../types/users'
import { formatDateKey } from '../../utils/calendar'
import Calendar from '../calendar/Calendar'
import TasksTable from '../tasksTable/TasksTable'
import CheckCircleIcon from '../ui/CheckCircleIcon'
import './Dashboard.css'

type DashboardProps = {
  me: MeResponse | null
  onLogout: () => void
}

function Dashboard({ me, onLogout }: DashboardProps) {
  const today = useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey(today))
  const [viewMonth, setViewMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1))
  const [showCompletedOnly, setShowCompletedOnly] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const todayKey = formatDateKey(today)
  const avatarSeed = me?.email ?? 'no-email'
  const avatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(avatarSeed)}&size=32&radius=12`

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-identity">
          <h1>Dashboard</h1>
          <div className="dashboard-user-row">
            <img className="dashboard-avatar" src={avatarUrl} alt="User avatar" />
            <p>{me?.name ?? 'User'} · {me?.email ?? 'No email'}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={15} />
          Logout
        </button>
      </header>

      <section className="dashboard-layout">
        <aside className="left-panel">
          <div className="card">
            <h2>Calendar</h2>
            <Calendar
              selectedDate={selectedDate}
              viewMonth={viewMonth}
              onViewMonthChange={setViewMonth}
              onSelectDate={setSelectedDate}
            />
            <div className="calendar-actions">
              <button
                type="button"
                className="go-today-btn"
                onClick={() => {
                  setSelectedDate(todayKey)
                  setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))
                }}
              >
                <CalendarDays size={14} />
                Go to today
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Filters</h3>
            <div className="mock-buttons">
              <button
                className={showCompletedOnly ? 'is-active' : ''}
                type="button"
                onClick={() => setShowCompletedOnly((prev) => !prev)}
              >
                <CheckCircleIcon checked tone={showCompletedOnly ? 'blue' : 'green'} size="sm" />
                <span>Completed</span>
                <span className="filter-count">{completedCount}</span>
              </button>
            </div>
          </div>
        </aside>

        <section className="center-panel">
          <TasksTable
            selectedDate={selectedDate}
            showCompletedOnly={showCompletedOnly}
            onCompletedCountChange={setCompletedCount}
          />
        </section>
      </section>
    </main>
  )
}

export default Dashboard
