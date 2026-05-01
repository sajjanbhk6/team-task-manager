import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { getApiError } from '../api/axios'
import ProjectForm from '../components/ProjectForm'
import { useAuth } from '../context/AuthContext'

export default function ProjectDetails() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const [project, setProject] = useState(null)
  const [memberEmail, setMemberEmail] = useState('')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`)
      setProject(data.project)
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to load project'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  const updateProject = async (payload) => {
    setError('')
    setMessage('')
    try {
      const { data } = await api.put(`/projects/${id}`, payload)
      setProject(data.project)
      setEditing(false)
      setMessage('Project updated')
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to update project'))
    }
  }

  const addMember = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail })
      setMemberEmail('')
      setMessage('Member added')
      await loadProject()
    } catch (requestError) {
      setError(getApiError(requestError, 'Failed to add member'))
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link className="text-sm font-medium text-slate-600 underline" to="/projects">
        Back to projects
      </Link>
      {loading ? <p className="mt-6 text-sm text-slate-500">Loading project...</p> : null}
      {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {project ? (
        <div className="mt-6 space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-950">{project.name}</h1>
                <p className="mt-2 text-sm text-slate-500">{project.description || 'No description'}</p>
                <p className="mt-3 text-sm text-slate-500">Owner: {project.owner?.name || 'Unknown'}</p>
              </div>
              {isAdmin ? (
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700" onClick={() => setEditing((value) => !value)} type="button">
                  {editing ? 'Close edit' : 'Edit project'}
                </button>
              ) : null}
            </div>
          </section>
          {editing ? <ProjectForm initialProject={project} onCancel={() => setEditing(false)} onSubmit={updateProject} /> : null}
          {isAdmin ? (
            <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={addMember}>
              <h2 className="text-lg font-semibold text-slate-950">Add member</h2>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  onChange={(event) => setMemberEmail(event.target.value)}
                  placeholder="member@test.com"
                  required
                  type="email"
                  value={memberEmail}
                />
                <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="submit">
                  Add
                </button>
              </div>
            </form>
          ) : null}
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Members</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {project.members?.length ? (
                project.members.map((member) => (
                  <div className="flex items-center justify-between py-3" key={member.id}>
                    <div>
                      <p className="text-sm font-medium text-slate-950">{member.user.name}</p>
                      <p className="text-sm text-slate-500">{member.user.email}</p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{member.user.role}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No members added yet.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}
