import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { X } from 'lucide-react'

type EditTaskPayload = {
  title: string
  description: string
}

type EditTaskModalProps = {
  initialTitle: string
  initialDescription: string
  submitting: boolean
  onClose: () => void
  onSubmit: (payload: EditTaskPayload) => Promise<void>
}

function EditTaskModal({
  initialTitle,
  initialDescription,
  submitting,
  onClose,
  onSubmit,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>): Promise<void> {
    event.preventDefault()

    await onSubmit({
      title,
      description,
    })
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) {
          return
        }

        onClose()
      }}
    >
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>Edit task</h3>
        <form className="create-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={1}
              maxLength={255}
              autoFocus
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={512}
              rows={3}
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                onClose()
              }}
            >
              <X size={14} />
              Cancel
            </button>
            <button type="submit" className="btn-create" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskModal
export type { EditTaskPayload }
