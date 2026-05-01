import { useEffect, useMemo, useState } from 'react'
import api, { getApiError } from '../api/axios'
import TaskForm from '../components/TaskForm'
import { useAuth } from '../context/AuthContext'

const filters = ['ALL', 'TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE']
const statuses = ['TODO', 'IN_PROGRESS', 'DONE']

const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

export default function Tasks() {
  const { isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [taskResponse, projectResponse] = await Promise.all([api.get('/tasks'), api.get('/projects')])
      setTasks(taskResponse.data.tasks)
      setProjects(projectResponse.data.projects)
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to load tasks'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const visibleTasks = useMemo(() => {
    if (filter === 'ALL') return tasks
    if (filter === 'OVERDUE') return tasks.filter(isOverdue)
    return tasks.filter((task) => task.status === filter)
  }, [tasks, filter])

  const createTask = async (payload) => {
    setError('')
    try {
      await api.post('/tasks', payload)
      setShowForm(false)
      await loadData()
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to create task'))
    }
  }

  const updateStatus = async (task, status) => {
    setError('')
    try {
      await api.put(`/tasks/${task.id}`, { status })
      await loadData()
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to update task'))
    }
  }

  const deleteTask = async (id) => {
    setError('')
    try {
      await api.delete(`/tasks/${id}`)
      await loadData()
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to delete task'))
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">{isAdmin ? 'Manage and assign all tasks.' : 'Update your assigned task status.'}</p>
        </div>
        {isAdmin ? (
          <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={() => setShowForm((value) => !value)} type="button">
            {showForm ? 'Close form' : 'Create task'}
          </button>
        ) : null}
      </div>
      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {showForm ? <div className="mb-6"><TaskForm onSubmit={createTask} projects={projects} /></div> : null}
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            className={`rounded-md px-3 py-2 text-sm ${filter === item ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      {loading ? <p className="text-sm text-slate-500">Loading tasks...</p> : null}
      {!loading && visibleTasks.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">No tasks found.</p> : null}
      <div className="space-y-4">
        {visibleTasks.map((task) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={task.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{task.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{task.description || 'No description'}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-md bg-slate-100 px-2 py-1">{task.project?.name}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1">Assignee: {task.assignee?.name}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1">Priority: {task.priority}</span>
                  {task.dueDate ? <span className="rounded-md bg-slate-100 px-2 py-1">Due: {task.dueDate.slice(0, 10)}</span> : null}
                  {isOverdue(task) ? <span className="rounded-md bg-red-50 px-2 py-1 text-red-700">Overdue</span> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  onChange={(event) => updateStatus(task, event.target.value)}
                  value={task.status}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {isAdmin ? (
                  <button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50" onClick={() => deleteTask(task.id)} type="button">
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
