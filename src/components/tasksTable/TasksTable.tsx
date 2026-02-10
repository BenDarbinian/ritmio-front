import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  createTask,
  deleteTask,
  getTaskDetails,
  getTasks,
  updateTask,
  updateTaskCompletion,
} from '../../api/tasks/tasks'
import type { TaskDetails, TaskListItem } from '../../types/tasks'
import { formatHumanDateDMY } from '../../utils/calendar'
import CheckCircleIcon from '../ui/CheckCircleIcon'
import CreateTaskModal from './CreateTaskModal'
import type { CreateTaskPayload } from './CreateTaskModal'
import EditTaskModal from './EditTaskModal'
import type { EditTaskPayload } from './EditTaskModal'
import TaskActionsMenu from './TaskActionsMenu'
import './TasksTable.css'

type TasksTableProps = {
  selectedDate: string
  showCompletedOnly: boolean
  onCompletedCountChange: (count: number) => void
}

type EditDraft = {
  taskId: number
  title: string
  description: string
}

function TasksTable({ selectedDate, showCompletedOnly, onCompletedCountChange }: TasksTableProps) {
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const [error, setError] = useState<string>('')
  const [total, setTotal] = useState<number>(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const [menuTaskId, setMenuTaskId] = useState<number | null>(null)
  const [menuTaskDetails, setMenuTaskDetails] = useState<TaskDetails | null>(null)
  const [menuLoading, setMenuLoading] = useState(false)

  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)
  const [editing, setEditing] = useState(false)

  const menuBoxRef = useRef<HTMLDivElement | null>(null)

  const completedCount = tasks.filter((task) => Boolean(task.completedAt)).length
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const visibleTasks = showCompletedOnly ? tasks.filter((task) => Boolean(task.completedAt)) : tasks

  useEffect(() => {
    onCompletedCountChange(completedCount)
  }, [completedCount, onCompletedCountChange])

  useEffect(() => {
    setMenuTaskId(null)
    setMenuTaskDetails(null)
    setEditDraft(null)
  }, [selectedDate])

  useEffect(() => {
    if (!menuTaskId) {
      return
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuBoxRef.current?.contains(target)) {
        return
      }

      setMenuTaskId(null)
      setMenuTaskDetails(null)
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [menuTaskId])

  const loadTasks = useCallback(async (date: string): Promise<void> => {
    setLoading(true)
    setError('')

    try {
      const response = await getTasks({
        date,
        limit: 50,
        page: 1,
      })

      setTasks(response.data)
      setTotal(response.total)
    } catch {
      setTasks([])
      setTotal(0)
      setError('Could not load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTasks(selectedDate)
  }, [loadTasks, selectedDate])

  async function handleToggleTask(task: TaskListItem): Promise<void> {
    setUpdatingTaskId(task.id)
    setError('')

    try {
      const nextCompleted = !task.completedAt
      const updated = await updateTaskCompletion({
        taskId: task.id,
        completed: nextCompleted,
      })

      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id
            ? { ...item, completedAt: updated.completedAt ?? (nextCompleted ? new Date().toISOString() : null) }
            : item,
        ),
      )
    } catch {
      setError('Could not update task status')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  async function handleCreateTaskSubmit(payload: CreateTaskPayload): Promise<void> {
    setCreating(true)
    setError('')

    try {
      await createTask({
        title: payload.title.trim(),
        description: payload.description.trim() ? payload.description.trim() : null,
        date: payload.date,
      })

      setCreateOpen(false)
      await loadTasks(selectedDate)
    } catch {
      setError('Could not create task')
    } finally {
      setCreating(false)
    }
  }

  async function handleOpenTaskMenu(task: TaskListItem): Promise<void> {
    const nextOpen = menuTaskId !== task.id
    setMenuTaskId(nextOpen ? task.id : null)
    setMenuTaskDetails(null)

    if (!nextOpen) {
      return
    }

    setMenuLoading(true)
    try {
      const details = await getTaskDetails(task.id)
      setMenuTaskDetails(details)
    } catch {
      setError('Could not load task details')
    } finally {
      setMenuLoading(false)
    }
  }

  function handleOpenEditFromMenu(task: TaskListItem): void {
    const details = menuTaskDetails

    setEditDraft({
      taskId: task.id,
      title: details?.title ?? task.title,
      description: details?.description ?? '',
    })

    setMenuTaskId(null)
    setMenuTaskDetails(null)
  }

  async function handleEditTaskSubmit(payload: EditTaskPayload): Promise<void> {
    if (!editDraft) {
      return
    }

    setEditing(true)
    setError('')

    try {
      const updated = await updateTask({
        taskId: editDraft.taskId,
        title: payload.title.trim(),
        description: payload.description.trim() ? payload.description.trim() : null,
      })

      setTasks((prev) => prev.map((item) => (item.id === editDraft.taskId ? { ...item, title: updated.title } : item)))
      setEditDraft(null)
    } catch {
      setError('Could not update task')
    } finally {
      setEditing(false)
    }
  }

  async function handleDeleteTask(taskId: number): Promise<void> {
    setDeletingTaskId(taskId)
    setError('')

    try {
      await deleteTask({ taskId })
      setTasks((prev) => prev.filter((item) => item.id !== taskId))
      setTotal((prev) => Math.max(0, prev - 1))
      setMenuTaskId(null)
      setMenuTaskDetails(null)
    } catch {
      setError('Could not delete task')
    } finally {
      setDeletingTaskId(null)
    }
  }

  return (
    <section className="tasks-panel">
      <div className="tasks-toolbar">
        <button className="new-task-btn" type="button" onClick={() => setCreateOpen(true)}>
          <Plus size={15} />
          New task
        </button>
      </div>

      <div className="tasks-meta">
        <span>Date: {formatHumanDateDMY(selectedDate)}</span>
        <span>Total: {total}</span>
      </div>

      {!showCompletedOnly && (
        <div className="tasks-progress">
          <div className="tasks-progress-head">
            <span>Progress</span>
            <span>
              {completedCount}/{total} ({progressPercent}%)
            </span>
          </div>
          <div className="tasks-progress-track" aria-label="Tasks progress">
            <div
              className="tasks-progress-fill"
              style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {loading && <p className="tasks-state">Loading tasks...</p>}
      {error && <p className="tasks-state tasks-error">{error}</p>}

      {!loading && !error && visibleTasks.length === 0 && (
        <p className="tasks-state">No tasks for this day</p>
      )}

      <ul className="tasks-list">
        {visibleTasks.map((task) => (
          <li
            key={task.id}
            className={`task-row ${updatingTaskId === task.id ? 'is-updating' : ''}`}
            onClick={() => {
              if (updatingTaskId === task.id) {
                return
              }

              void handleToggleTask(task)
            }}
          >
            <div>
              <p className="task-title">{task.title}</p>
              {task.subtasksCount > 0 && (
                <p className="task-sub">Subtasks: {task.subtasksCount}</p>
              )}
            </div>
            <div className="task-actions">
              <div className={`task-status ${task.completedAt ? 'done' : ''}`} aria-hidden="true">
                <CheckCircleIcon checked={Boolean(task.completedAt)} tone="green" size="md" />
              </div>
              <TaskActionsMenu
                task={task}
                isOpen={menuTaskId === task.id}
                loading={menuLoading}
                deleting={deletingTaskId === task.id}
                details={menuTaskDetails}
                menuRef={menuBoxRef}
                onToggle={() => void handleOpenTaskMenu(task)}
                onEdit={() => handleOpenEditFromMenu(task)}
                onDelete={() => void handleDeleteTask(task.id)}
              />
            </div>
          </li>
        ))}
      </ul>

      {createOpen && (
        <CreateTaskModal
          selectedDate={selectedDate}
          submitting={creating}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreateTaskSubmit}
        />
      )}

      {editDraft && (
        <EditTaskModal
          initialTitle={editDraft.title}
          initialDescription={editDraft.description}
          submitting={editing}
          onClose={() => setEditDraft(null)}
          onSubmit={handleEditTaskSubmit}
        />
      )}
    </section>
  )
}

export default TasksTable
