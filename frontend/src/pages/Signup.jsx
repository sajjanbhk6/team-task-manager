import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getApiError } from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signup(form)
      navigate('/')
    } catch (requestError) {
      setError(getApiError(requestError, 'Signup failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <form className="w-full space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Use Admin to manage projects and Member to test assigned work.</p>
        </div>
        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="name">
            Name
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="name"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
            value={form.name}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="email"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
            type="email"
            value={form.email}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="password"
            minLength="6"
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
            type="password"
            value={form.password}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="role">
            Role
          </label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="role"
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            value={form.role}
          >
            <option value="MEMBER">MEMBER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={loading} type="submit">
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-medium text-slate-950 underline" to="/login">
            Log in
          </Link>
        </p>
      </form>
    </main>
  )
}
