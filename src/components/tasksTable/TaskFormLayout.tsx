import type { ReactNode, SyntheticEvent } from 'react'
import { X } from 'lucide-react'
import Button from '../ui/Button'

type TaskFormLayoutProps = {
  title: string
  description: string
  submitting: boolean
  submitIdleLabel: string
  submitLoadingLabel: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => Promise<void>
  children?: ReactNode
}

function TaskFormLayout({
  title,
  description,
  submitting,
  submitIdleLabel,
  submitLoadingLabel,
  onTitleChange,
  onDescriptionChange,
  onCancel,
  onSubmit,
  children,
}: TaskFormLayoutProps) {
  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>): Promise<void> {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
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
          onChange={(event) => onDescriptionChange(event.target.value)}
          maxLength={512}
          rows={3}
        />
      </label>

      {children}

      <div className="task-form__actions">
        <Button type="button" variant="neutral" onClick={onCancel}>
          <X size={14} />
          Cancel
        </Button>
        <Button type="submit" variant="solidBlue" disabled={submitting}>
          {submitting ? submitLoadingLabel : submitIdleLabel}
        </Button>
      </div>
    </form>
  )
}

export default TaskFormLayout
