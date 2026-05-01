import { useMemo, useState } from 'react'

const statuses = ['TODO', 'IN_PROGRESS', 'DONE']
const priorities = ['LOW', 'MEDIUM', 'HIGH']

export default function TaskForm({ projects, initialTask, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    status: initialTask?.status || 'TODO',
    priority: initialTask?.priority || 'MEDIUM',
    dueDate: initialTask?.dueDate ? initialTask.dueDate.slice(0, 10) : '',
    projectId: initialTask?.projectId || projects[0]?.id || '',
    assigneeId: initialTask?.assigneeId || '',
  })
  const [saving, setSaving] = useState(false)

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === form.projectId),
    [projects, form.projectId],
  )
  const members = selectedProject?.members || []

  const updateField = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value }

      if (key === 'projectId') {
        next.assigneeId = ''
      }

      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      await onSubmit({
        ...form,
        dueDate: form.dueDate || null,
      })

      if (!initialTask) {
        setForm({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: '',
          projectId: projects[0]?.id || '',
          assigneeId: '',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="task-title">
            Title
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="task-title"
            onChange={(event) => updateField('title', event.target.value)}
            required
            value={form.title}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="task-project">
            Project
          </label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="task-project"
            onChange={(event) => updateField('projectId', event.target.value)}
            required
            value={form.projectId}
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="task-description">
          Description
        </label>
        <textarea
          className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          id="task-description"
          onChange={(event) => updateField('description', event.target.value)}
          value={form.description}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="task-assignee">
            Assignee
          </label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="task-assignee"
            onChange={(event) => updateField('assigneeId', event.target.value)}
            required
            value={form.assigneeId}
          >
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member.user.id} value={member.user.id}>
                {member.user.name} ({member.user.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="task-status">
            Status
          </label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="task-status"
            onChange={(event) => updateField('status', event.target.value)}
            value={form.status}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="task-priority">
            Priority
          </label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="task-priority"
            onChange={(event) => updateField('priority', event.target.value)}
            value={form.priority}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="task-due-date">
            Due date
          </label>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            id="task-due-date"
            onChange={(event) => updateField('dueDate', event.target.value)}
            type="date"
            value={form.dueDate}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={saving} type="submit">
          {saving ? 'Saving...' : initialTask ? 'Update task' : 'Create task'}
        </button>
        {onCancel ? (
          <button className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700" onClick={onCancel} type="button">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
