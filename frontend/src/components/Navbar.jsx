import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-950">Team Task Manager</p>
          <p className="text-sm text-slate-500">
            {user.name} · {user.role}
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink className={navClass} to="/">
            Dashboard
          </NavLink>
          <NavLink className={navClass} to="/projects">
            Projects
          </NavLink>
          <NavLink className={navClass} to="/tasks">
            Tasks
          </NavLink>
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={handleLogout} type="button">
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}
