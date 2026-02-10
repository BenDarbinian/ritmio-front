import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import type { RefObject } from 'react'
import type { TaskDetails, TaskListItem } from '../../types/tasks'

type TaskActionsMenuProps = {
  task: TaskListItem
  isOpen: boolean
  loading: boolean
  deleting: boolean
  details: TaskDetails | null
  menuRef: RefObject<HTMLDivElement | null>
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

function TaskActionsMenu({
  task,
  isOpen,
  loading,
  deleting,
  details,
  menuRef,
  onToggle,
  onEdit,
  onDelete,
}: TaskActionsMenuProps) {
  return (
    <div
      className="task-menu-zone"
      ref={isOpen ? menuRef : null}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="task-menu-btn"
        type="button"
        aria-label="Task actions"
        onClick={onToggle}
      >
        <EllipsisVertical size={16} />
      </button>

      {isOpen && (
        <div className="task-menu-popover">
          <p className="task-menu-title">{details?.title ?? task.title}</p>
          {loading ? (
            <p className="task-menu-description">Loading description...</p>
          ) : (
            <p className="task-menu-description">
              {details?.description?.trim() ? details.description : 'No description'}
            </p>
          )}
          <div className="task-menu-actions">
            <button type="button" onClick={onEdit}>
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              className="danger"
              disabled={deleting}
              onClick={onDelete}
            >
              <Trash2 size={14} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskActionsMenu
