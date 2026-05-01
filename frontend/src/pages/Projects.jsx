import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getApiError } from '../api/axios'
import ProjectForm from '../components/ProjectForm'
import { useAuth } from '../context/AuthContext'

export default function Projects() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data.projects)
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to load projects'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const createProject = async (payload) => {
    setError('')
    try {
      await api.post('/projects', payload)
      setShowForm(false)
      await loadProjects()
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to create project'))
    }
  }

  const deleteProject = async (id) => {
    setError('')
    try {
      await api.delete(`/projects/${id}`)
      await loadProjects()
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to delete project'))
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">{isAdmin ? 'Manage every team project.' : 'Projects assigned to you.'}</p>
        </div>
        {isAdmin ? (
          <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={() => setShowForm((value) => !value)} type="button">
            {showForm ? 'Close form' : 'Create project'}
          </button>
        ) : null}
      </div>
      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {showForm ? <div className="mb-6"><ProjectForm onSubmit={createProject} /></div> : null}
      {loading ? <p className="text-sm text-slate-500">Loading projects...</p> : null}
      {!loading && projects.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">No projects found.</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={project.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{project.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{project.description || 'No description'}</p>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{project.members?.length || 0} members</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" to={`/projects/${project.id}`}>
                Details
              </Link>
              {isAdmin ? (
                <button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50" onClick={() => deleteProject(project.id)} type="button">
                  Delete
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
