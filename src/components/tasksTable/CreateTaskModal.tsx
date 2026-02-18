import { createPortal } from 'react-dom'
import { useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { dateKeyToMonthStart, formatHumanDateDMY } from '../../utils/calendar'
import Calendar from '../calendar/Calendar'
import Modal from '../ui/Modal'
import SubtasksEditor from './SubtasksEditor'
import TaskFormLayout from './TaskFormLayout'
import { usePopoverPosition } from './usePopoverPosition'

type CreateTaskPayload = {
  title: string
  description: string
  date: string
  subtasks: string[]
}

type CreateTaskModalProps = {
  selectedDate: string
  submitting: boolean
  onClose: () => void
  onSubmit: (payload: CreateTaskPayload) => Promise<void>
}

function CreateTaskModal({
  selectedDate,
  submitting,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(selectedDate)
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [viewMonth, setViewMonth] = useState<Date>(dateKeyToMonthStart(selectedDate))

  const datePickerRef = useRef<HTMLDivElement | null>(null)
  const datePickerPopoverRef = useRef<HTMLDivElement | null>(null)

  const { vertical, position } = usePopoverPosition({
    isOpen: showDatePicker,
    anchorRef: datePickerRef,
    popoverRef: datePickerPopoverRef,
  })

  async function handleSubmit(): Promise<void> {
    await onSubmit({
      title,
      description,
      date,
      subtasks: subtasks.map((item) => item.trim()).filter(Boolean),
    })
  }

  function handleModalClose() {
    if (showDatePicker) {
      setShowDatePicker(false)
      return
    }

    onClose()
  }

  return (
    <Modal
      onClose={handleModalClose}
      onCardClick={(event) => {
        if (showDatePicker && datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
          setShowDatePicker(false)
        }
      }}
    >
      <h3 className="task-modal__title">Create task</h3>
      <TaskFormLayout
        title={title}
        description={description}
        submitting={submitting}
        submitIdleLabel="Create"
        submitLoadingLabel="Creating..."
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onCancel={onClose}
        onSubmit={handleSubmit}
      >
        <SubtasksEditor
          title="Subtasks"
          addLabel="Add subtask"
          items={subtasks}
          placeholderPrefix="Subtask"
          idPrefix="create-subtask"
          onChange={setSubtasks}
        />

        <div className="task-form__date-picker" ref={datePickerRef}>
          <label>Date</label>
          <button
            type="button"
            className="task-form__date-button"
            onClick={() => setShowDatePicker((prev) => !prev)}
          >
            <CalendarDays size={14} />
            {formatHumanDateDMY(date)}
          </button>

          {showDatePicker && createPortal(
            <div
              ref={datePickerPopoverRef}
              className={`task-form__date-popover ${vertical === 'top' ? 'task-form__date-popover--top' : ''}`}
              style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <Calendar
                selectedDate={date}
                viewMonth={viewMonth}
                onViewMonthChange={setViewMonth}
                onSelectDate={(dateKey) => {
                  setDate(dateKey)
                  setShowDatePicker(false)
                }}
              />
            </div>,
            document.body,
          )}
        </div>
      </TaskFormLayout>
    </Modal>
  )
}

export default CreateTaskModal
export type { CreateTaskPayload }
