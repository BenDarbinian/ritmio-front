import { useMemo, useState } from 'react'
import { CalendarDays, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import type { MeResponse } from '../../types/users'
import { formatDateKey } from '../../utils/calendar'
import Calendar from '../calendar/Calendar'
import ProfileSettings from '../profileSettings/ProfileSettings'
import TasksTable from '../tasksTable/TasksTable'
import Button from '../ui/Button'
import StatusCircleIcon from '../ui/StatusCircleIcon'
import './Dashboard.css'

type DashboardProps = {
  me: MeResponse | null
  onLogout: () => void
  onProfileUpdated: () => Promise<void>
}

function Dashboard({ me, onLogout, onProfileUpdated }: DashboardProps) {
  const today = useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey(today))
  const [viewMonth, setViewMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1))
  const [showCompletedOnly, setShowCompletedOnly] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'settings'>('dashboard')
  const todayKey = formatDateKey(today)
  const avatarSeed = me?.email ?? 'no-email'
  const avatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(avatarSeed)}&size=32&radius=12`
  const sectionTitle = activeSection === 'dashboard' ? 'Dashboard' : 'Profile Settings'

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__identity">
          <div className="dashboard__heading">
            <h1>{sectionTitle}</h1>
          </div>
          {activeSection === 'dashboard' && (
            <div className="dashboard__user">
              <img className="dashboard__avatar" src={avatarUrl} alt="User avatar" />
              <p>{me?.name ?? 'User'} · {me?.email ?? 'No email'}</p>
            </div>
          )}
        </div>
        <div className="dashboard__header-actions">
          <Button
            variant={activeSection === 'dashboard' ? 'softBlue' : 'neutral'}
            onClick={() => setActiveSection('dashboard')}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </Button>
          <Button
            variant={activeSection === 'settings' ? 'softBlue' : 'neutral'}
            onClick={() => setActiveSection('settings')}
          >
            <Settings size={15} />
            Settings
          </Button>
          <Button variant="softRed" onClick={onLogout}>
            <LogOut size={15} />
            Logout
          </Button>
        </div>
      </header>

      {activeSection === 'dashboard' ? (
        <section className="dashboard__layout">
          <aside className="dashboard__sidebar">
            <div className="dashboard__card">
              <h2>Calendar</h2>
              <Calendar
                selectedDate={selectedDate}
                viewMonth={viewMonth}
                onViewMonthChange={setViewMonth}
                onSelectDate={setSelectedDate}
              />
              <div className="dashboard__calendar-actions">
                <Button
                  variant="softBlue"
                  fullWidth
                  className="dashboard__today-btn"
                  onClick={() => {
                    setSelectedDate(todayKey)
                    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1))
                  }}
                >
                  <CalendarDays size={14} />
                  Go to today
                </Button>
              </div>
            </div>

            <div className="dashboard__card">
              <h3>Filters</h3>
              <div className="dashboard__filters">
                <button
                  className={`dashboard__filter-btn ${showCompletedOnly ? 'dashboard__filter-btn--active' : ''}`}
                  type="button"
                  onClick={() => setShowCompletedOnly((prev) => !prev)}
                >
                  <StatusCircleIcon state="done" tone={showCompletedOnly ? 'blue' : 'green'} size="sm" />
                  <span>Completed</span>
                  <span className="dashboard__filter-count">{completedCount}</span>
                </button>
              </div>
            </div>
          </aside>

          <section className="dashboard__content">
            <TasksTable
              selectedDate={selectedDate}
              showCompletedOnly={showCompletedOnly}
              onCompletedCountChange={setCompletedCount}
            />
          </section>
        </section>
      ) : (
        <section className="dashboard__settings">
          <ProfileSettings me={me} onProfileUpdated={onProfileUpdated} />
        </section>
      )}
    </main>
  )
}

export default Dashboard
