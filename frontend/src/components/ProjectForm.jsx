import { useState } from 'react'

export default function ProjectForm({ initialProject, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initialProject?.name || '',
    description: initialProject?.description || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      await onSubmit(form)
      if (!initialProject) {
        setForm({ name: '', description: '' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="project-name">
          Project name
        </label>
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          id="project-name"
          minLength="2"
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
          value={form.name}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="project-description">
          Description
        </label>
        <textarea
          className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          id="project-description"
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          value={form.description}
        />
      </div>
      <div className="flex gap-2">
        <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={saving} type="submit">
          {saving ? 'Saving...' : initialProject ? 'Update project' : 'Create project'}
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
