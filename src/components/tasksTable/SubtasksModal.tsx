import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { getTaskSubtasks, updateSubtaskCompletion } from '../../api/tasks/tasks'
import type { SubtaskItem } from '../../types/tasks'
import Modal from '../ui/Modal'
import StatusCircleIcon from '../ui/StatusCircleIcon'

type SubtasksModalProps = {
  taskId: number
  taskTitle: string
  onClose: () => void
  onProgressChange: (payload: { taskId: number, total: number, completed: number }) => void
}

function SubtasksModal({
  taskId,
  taskTitle,
  onClose,
  onProgressChange,
}: SubtasksModalProps) {
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingSubtaskId, setUpdatingSubtaskId] = useState<number | null>(null)

  const completed = useMemo(
    () => subtasks.filter((item) => Boolean(item.completedAt)).length,
    [subtasks],
  )
  const onProgressChangeRef = useRef(onProgressChange)

  useEffect(() => {
    onProgressChangeRef.current = onProgressChange
  }, [onProgressChange])

  useEffect(() => {
    if (loading) {
      return
    }

    onProgressChangeRef.current({
      taskId,
      total: subtasks.length,
      completed,
    })
  }, [completed, loading, subtasks.length, taskId])

  useEffect(() => {
    let active = true

    async function loadSubtasks() {
      setLoading(true)
      setError('')

      try {
        const data = await getTaskSubtasks({ taskId })
        if (!active) {
          return
        }

        setSubtasks(data)
      } catch {
        if (!active) {
          return
        }

        setError('Could not load subtasks')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSubtasks()

    return () => {
      active = false
    }
  }, [taskId])

  async function handleToggleSubtask(subtask: SubtaskItem): Promise<void> {
    setUpdatingSubtaskId(subtask.id)
    setError('')

    try {
      const nextCompleted = !subtask.completedAt
      const updated = await updateSubtaskCompletion({
        taskId,
        subtaskId: subtask.id,
        completed: nextCompleted,
      })

      setSubtasks(updated.subtasks)
    } catch {
      setError('Could not update subtask')
    } finally {
      setUpdatingSubtaskId(null)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="task-modal__subtasks-head">
        <h3 className="task-modal__title">Subtasks</h3>
        <button className="task-modal__close-btn" type="button" onClick={onClose} aria-label="Close">
          <X size={14} />
        </button>
      </div>

      <p className="task-modal__task-title">{taskTitle}</p>
      <p className="task-modal__meta">{completed}/{subtasks.length} completed</p>

      {loading && <p className="tasks-table__state">Loading subtasks...</p>}
      {error && <p className="tasks-table__state tasks-table__state--error">{error}</p>}
      {!loading && !error && subtasks.length === 0 && <p className="tasks-table__state">No subtasks yet</p>}

      {!loading && !error && subtasks.length > 0 && (
        <ul className="task-modal__subtasks-list">
          {subtasks.map((subtask) => (
            <li
              key={subtask.id}
              className={`task-modal__subtask-row ${updatingSubtaskId === subtask.id ? 'task-modal__subtask-row--updating' : ''}`}
              onClick={() => {
                if (updatingSubtaskId === subtask.id) {
                  return
                }

                void handleToggleSubtask(subtask)
              }}
            >
              <p className="task-modal__subtask-title">{subtask.title}</p>
              <StatusCircleIcon state={subtask.completedAt ? 'done' : 'empty'} tone="green" size="md" />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

export default SubtasksModal
