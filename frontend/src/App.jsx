import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ProjectDetails from './pages/ProjectDetails'
import Projects from './pages/Projects'
import Signup from './pages/Signup'
import Tasks from './pages/Tasks'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<Dashboard />} path="/" />
            <Route element={<Projects />} path="/projects" />
            <Route element={<ProjectDetails />} path="/projects/:id" />
            <Route element={<Tasks />} path="/tasks" />
          </Route>
          <Route element={<Login />} path="/login" />
          <Route element={<Signup />} path="/signup" />
          <Route element={<Navigate to="/" replace />} path="*" />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
