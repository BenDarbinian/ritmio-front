import { useState } from 'react'
import type { SubtaskItem } from '../../types/tasks'
import Modal from '../ui/Modal'
import SubtasksEditor from './SubtasksEditor'
import TaskFormLayout from './TaskFormLayout'

type EditTaskPayload = {
  title: string
  description: string
  subtasks: string[]
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

  async function handleSubmit(): Promise<void> {
    await onSubmit({
      title,
      description,
      subtasks: newSubtasks.map((item) => item.trim()).filter(Boolean),
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
              {initialSubtasks.map((subtask) => (
                <li key={subtask.id} className="task-form-subtasks__existing-item">
                  {subtask.title}
                </li>
              ))}
            </ul>
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
