import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { SubtaskItem } from '../../types/tasks'
import Modal from '../ui/Modal'
import SubtasksEditor from './SubtasksEditor'
import TaskFormLayout from './TaskFormLayout'

type EditTaskPayload = {
  title: string
  description: string
  subtasks: string[]
  subtaskUpdates: Array<{ id: number; title: string }>
  subtaskDeletes: number[]
}

type EditTaskModalProps = {
  initialTitle: string
  initialDescription: string
  initialSubtasks: SubtaskItem[]
  submitting: boolean
  onClose: () => void
  onSubmit: (payload: EditTaskPayload) => Promise<void>
}

function EditTaskModal({
  initialTitle,
  initialDescription,
  initialSubtasks,
  submitting,
  onClose,
  onSubmit,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [newSubtasks, setNewSubtasks] = useState<string[]>([])
  const [existingSubtasks, setExistingSubtasks] = useState<SubtaskItem[]>(initialSubtasks)

  const initialSubtasksById = useMemo(
    () => new Map(initialSubtasks.map((item) => [item.id, item.title])),
    [initialSubtasks],
  )

  async function handleSubmit(): Promise<void> {
    const subtaskUpdates = existingSubtasks
      .map((item) => ({
        id: item.id,
        title: item.title.trim(),
        initialTitle: initialSubtasksById.get(item.id) ?? '',
      }))
      .filter((item) => item.title && item.title !== item.initialTitle)
      .map((item) => ({ id: item.id, title: item.title }))

    const subtaskDeletes = initialSubtasks
      .filter((item) => !existingSubtasks.some((current) => current.id === item.id))
      .map((item) => item.id)

    await onSubmit({
      title,
      description,
      subtasks: newSubtasks.map((item) => item.trim()).filter(Boolean),
      subtaskUpdates,
      subtaskDeletes,
    })
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="task-modal__title">Edit task</h3>
      <TaskFormLayout
        title={title}
        description={description}
        submitting={submitting}
        submitIdleLabel="Save"
        submitLoadingLabel="Saving..."
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onCancel={onClose}
        onSubmit={handleSubmit}
      >
        {initialSubtasks.length > 0 && (
          <div className="task-form-subtasks">
            <div className="task-form-subtasks__head">
              <span>Current subtasks</span>
            </div>
            <ul className="task-form-subtasks__existing-list">
              {existingSubtasks.map((subtask) => (
                <li key={subtask.id} className="task-form-subtasks__item">
                  <input
                    type="text"
                    value={subtask.title}
                    maxLength={255}
                    onChange={(event) => {
                      const nextTitle = event.target.value
                      setExistingSubtasks((prev) => prev.map((item) => (
                        item.id === subtask.id
                          ? { ...item, title: nextTitle }
                          : item
                      )))
                    }}
                  />
                  <button
                    type="button"
                    className="task-form-subtasks__remove-btn"
                    aria-label="Delete subtask"
                    onClick={() => {
                      setExistingSubtasks((prev) => prev.filter((item) => item.id !== subtask.id))
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            {existingSubtasks.length === 0 && (
              <p className="task-form-subtasks__hint">
                All current subtasks will be removed on save.
              </p>
            )}
          </div>
        )}

        <SubtasksEditor
          title="Add subtasks"
          addLabel="Add subtask"
          items={newSubtasks}
          placeholderPrefix="New subtask"
          idPrefix="edit-subtask"
          onChange={setNewSubtasks}
        />
      </TaskFormLayout>
    </Modal>
  )
}

export default EditTaskModal
export type { EditTaskPayload }
