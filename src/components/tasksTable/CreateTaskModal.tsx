import { createPortal } from 'react-dom'
import { useRef, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { CalendarDays, X } from 'lucide-react'
import { dateKeyToMonthStart, formatHumanDateDMY } from '../../utils/calendar'
import Calendar from '../calendar/Calendar'
import { usePopoverPosition } from './usePopoverPosition'

type CreateTaskPayload = {
  title: string
  description: string
  date: string
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
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [viewMonth, setViewMonth] = useState<Date>(dateKeyToMonthStart(selectedDate))

  const datePickerRef = useRef<HTMLDivElement | null>(null)
  const datePickerPopoverRef = useRef<HTMLDivElement | null>(null)

  const { vertical, position } = usePopoverPosition({
    isOpen: showDatePicker,
    anchorRef: datePickerRef,
    popoverRef: datePickerPopoverRef,
  })

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>): Promise<void> {
    event.preventDefault()

    await onSubmit({
      title,
      description,
      date,
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

        if (showDatePicker) {
          setShowDatePicker(false)
          return
        }

        onClose()
      }}
    >
      <div
        className="modal-card"
        onClick={(event) => {
          if (showDatePicker && datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
            setShowDatePicker(false)
          }

          event.stopPropagation()
        }}
      >
        <h3>Create task</h3>
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

          <div className="date-picker-field" ref={datePickerRef}>
            <label>Date</label>
            <button
              type="button"
              className="date-picker-button"
              onClick={() => setShowDatePicker((prev) => !prev)}
            >
              <CalendarDays size={14} />
              {formatHumanDateDMY(date)}
            </button>

            {showDatePicker && createPortal(
              <div
                ref={datePickerPopoverRef}
                className={`date-picker-popover ${vertical === 'top' ? 'is-top' : ''}`}
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
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
export type { CreateTaskPayload }
