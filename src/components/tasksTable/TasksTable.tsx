import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  createSubtask,
  createTask,
  deleteTask,
  getTaskDetails,
  getTaskSubtasks,
  getTasks,
  updateTask,
  updateTaskCompletion,
} from '../../api/tasks/tasks'
import type { TaskDetails, TaskListItem } from '../../types/tasks'
import { formatHumanDateDMY } from '../../utils/calendar'
import Button from '../ui/Button'
import StatusCircleIcon from '../ui/StatusCircleIcon'
import CreateTaskModal from './CreateTaskModal'
import type { CreateTaskPayload } from './CreateTaskModal'
import EditTaskModal from './EditTaskModal'
import type { EditTaskPayload } from './EditTaskModal'
import SubtasksModal from './SubtasksModal'
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
  subtasks: TaskDetails['subtasks']
}

type SubtaskProgress = {
  total: number
  completed: number
}

type SubtasksDraft = {
  taskId: number
  taskTitle: string
}

function TasksTable({ selectedDate, showCompletedOnly, onCompletedCountChange }: TasksTableProps) {
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const [error, setError] = useState<string>('')
  const [total, setTotal] = useState<number>(0)
  const [completed, setCompleted] = useState<number>(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const [menuTaskId, setMenuTaskId] = useState<number | null>(null)
  const [menuTaskDetails, setMenuTaskDetails] = useState<TaskDetails | null>(null)
  const [menuLoading, setMenuLoading] = useState(false)

  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)
  const [editing, setEditing] = useState(false)
  const [subtasksDraft, setSubtasksDraft] = useState<SubtasksDraft | null>(null)
  const [subtaskProgressByTaskId, setSubtaskProgressByTaskId] = useState<Record<number, SubtaskProgress>>({})

  const menuBoxRef = useRef<HTMLDivElement | null>(null)

  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0
  const visibleTasks = tasks

  useEffect(() => {
    onCompletedCountChange(completed)
  }, [completed, onCompletedCountChange])

  useEffect(() => {
    setMenuTaskId(null)
    setMenuTaskDetails(null)
    setEditDraft(null)
    setSubtasksDraft(null)
    setSubtaskProgressByTaskId({})
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

  useEffect(() => {
    const pendingTaskIds = tasks
      .filter((task) => task.subtasksCount > 0 && !task.completedAt && !subtaskProgressByTaskId[task.id])
      .map((task) => task.id)

    if (pendingTaskIds.length === 0) {
      return
    }

    let active = true

    void Promise.all(pendingTaskIds.map(async (taskId) => {
      try {
        const subtasks = await getTaskSubtasks({ taskId })
        return {
          taskId,
          total: subtasks.length,
          completed: subtasks.filter((item) => Boolean(item.completedAt)).length,
        }
      } catch {
        return null
      }
    })).then((results) => {
      if (!active) {
        return
      }

      const progressEntries = results.filter((result) => result !== null)
      if (progressEntries.length === 0) {
        return
      }

      setSubtaskProgressByTaskId((prev) => {
        const next = { ...prev }

        for (const item of progressEntries) {
          next[item.taskId] = {
            total: item.total,
            completed: item.completed,
          }
        }

        return next
      })
    })

    return () => {
      active = false
    }
  }, [subtaskProgressByTaskId, tasks])

  const loadTasks = useCallback(async (date: string, signal?: AbortSignal): Promise<void> => {
    setLoading(true)
    setError('')

    try {
      const response = await getTasks({
        date,
        completed: showCompletedOnly ? true : undefined,
        limit: 50,
        page: 1,
        signal,
      })

      setTasks(response.data)
      setTotal(response.total)
      setCompleted(response.completed)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      setTasks([])
      setTotal(0)
      setCompleted(0)
      setError('Could not load tasks')
    } finally {
      setLoading(false)
    }
  }, [showCompletedOnly])

  useEffect(() => {
    const controller = new AbortController()
    void loadTasks(selectedDate, controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadTasks, selectedDate, showCompletedOnly])

  async function handleToggleTask(task: TaskListItem): Promise<void> {
    if (task.subtasksCount > 0) {
      setSubtasksDraft({
        taskId: task.id,
        taskTitle: task.title,
      })
      return
    }

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
        subtasks: payload.subtasks,
      })

      setCreateOpen(false)
      void loadTasks(selectedDate)
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
      subtasks: details?.subtasks ?? [],
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

      const subtasksToCreate = payload.subtasks
      if (subtasksToCreate.length > 0) {
        await Promise.all(subtasksToCreate.map((title) => createSubtask({
          taskId: editDraft.taskId,
          title,
        })))
      }

      setTasks((prev) => prev.map((item) => (item.id === editDraft.taskId ? { ...item, title: updated.title } : item)))
      void loadTasks(selectedDate)
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
      void loadTasks(selectedDate)
    } catch {
      setError('Could not delete task')
    } finally {
      setDeletingTaskId(null)
    }
  }

  function getTaskState(task: TaskListItem): 'empty' | 'partial' | 'done' {
    if (!task.subtasksCount) {
      return task.completedAt ? 'done' : 'empty'
    }

    if (task.completedAt) {
      return 'done'
    }

    const progress = subtaskProgressByTaskId[task.id]
    if (progress && progress.completed > 0 && progress.completed < progress.total) {
      return 'partial'
    }

    return 'empty'
  }

  function handleSubtasksProgressChange(payload: { taskId: number, total: number, completed: number }): void {
    setSubtaskProgressByTaskId((prev) => ({
      ...prev,
      [payload.taskId]: {
        total: payload.total,
        completed: payload.completed,
      },
    }))

    setTasks((prev) => prev.map((item) => {
      if (item.id !== payload.taskId) {
        return item
      }

      return {
        ...item,
        completedAt: payload.total > 0 && payload.completed === payload.total
          ? (item.completedAt ?? new Date().toISOString())
          : null,
      }
    }))

    if (showCompletedOnly) {
      void loadTasks(selectedDate)
    }
  }

  return (
    <section className="tasks-table">
      <div className="tasks-table__toolbar">
        <Button variant="softBlue" fullWidth onClick={() => setCreateOpen(true)}>
          <Plus size={15} />
          New task
        </Button>
      </div>

      <div className="tasks-table__meta">
        <span>Date: {formatHumanDateDMY(selectedDate)}</span>
        <span>Total: {total}</span>
      </div>

      {!showCompletedOnly && (
        <div className="tasks-table__progress">
          <div className="tasks-table__progress-head">
            <span>Progress</span>
            <span>
              {completed}/{total} ({progressPercent}%)
            </span>
          </div>
          <div className="tasks-table__progress-track" aria-label="Tasks progress">
            <div
              className="tasks-table__progress-fill"
              style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {loading && <p className="tasks-table__state">Loading tasks...</p>}
      {error && <p className="tasks-table__state tasks-table__state--error">{error}</p>}

      {!loading && !error && visibleTasks.length === 0 && (
        <p className="tasks-table__state">No tasks for this day</p>
      )}

      <ul className="tasks-table__list">
        {visibleTasks.map((task) => (
          <li
            key={task.id}
            className={`tasks-table__row ${updatingTaskId === task.id ? 'tasks-table__row--updating' : ''}`}
            onClick={() => {
              if (updatingTaskId === task.id) {
                return
              }

              void handleToggleTask(task)
            }}
          >
            <div>
              <p className="tasks-table__title">{task.title}</p>
              {task.subtasksCount > 0 && (
                <p className="tasks-table__sub">Subtasks: {task.subtasksCount}</p>
              )}
            </div>
            <div className="tasks-table__actions">
              <div className="tasks-table__status" aria-hidden="true">
                <StatusCircleIcon state={getTaskState(task)} tone="green" size="md" />
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
          initialSubtasks={editDraft.subtasks}
          submitting={editing}
          onClose={() => setEditDraft(null)}
          onSubmit={handleEditTaskSubmit}
        />
      )}

      {subtasksDraft && (
        <SubtasksModal
          taskId={subtasksDraft.taskId}
          taskTitle={subtasksDraft.taskTitle}
          onClose={() => setSubtasksDraft(null)}
          onProgressChange={handleSubtasksProgressChange}
        />
      )}
    </section>
  )
}

export default TasksTable
