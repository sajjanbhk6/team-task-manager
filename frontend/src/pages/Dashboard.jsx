import { useEffect, useState } from 'react'
import api, { getApiError } from '../api/axios'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'

const cards = [
  ['totalTasks', 'Total Tasks'],
  ['todoTasks', 'Todo Tasks'],
  ['inProgressTasks', 'In Progress'],
  ['doneTasks', 'Completed'],
  ['overdueTasks', 'Overdue'],
  ['totalProjects', 'Total Projects'],
]

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard')
        setDashboard(data)
      } catch (requestError) {
        setError(getApiError(requestError, 'Failed to load dashboard'))
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.role === 'ADMIN' ? 'All project and task activity.' : 'Your assigned projects and tasks.'}
        </p>
      </div>
      {loading ? <p className="text-sm text-slate-500">Loading dashboard...</p> : null}
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {dashboard ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([key, label]) => (
            <StatCard key={key} label={label} value={dashboard[key]} />
          ))}
        </div>
      ) : null}
    </main>
  )
}
