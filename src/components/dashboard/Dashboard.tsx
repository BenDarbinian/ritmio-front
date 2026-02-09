import type { MeResponse } from '../../types/users.ts'
import './Dashboard.css'

type DashboardProps = {
  me: MeResponse | null
  onLogout: () => void
}

function Dashboard({ me, onLogout }: DashboardProps) {
  const seed = `${me?.name ?? 'user'}-${me?.email ?? 'no-email'}`
  const avatarUrl = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <div className="dashboard-top">
          <img className="dashboard-avatar" src={avatarUrl} alt="User avatar" />
          <div>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">Personal account</p>
          </div>
        </div>

        <div className="dashboard-row">
          <span className="label">Name</span>
          <span>{me?.name ?? 'No name'}</span>
        </div>
        <div className="dashboard-row">
          <span className="label">Email</span>
          <span>{me?.email ?? 'No email'}</span>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </section>
    </main>
  )
}

export default Dashboard
