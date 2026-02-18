import { Plus, Trash2 } from 'lucide-react'

type SubtasksEditorProps = {
  title: string
  addLabel: string
  items: string[]
  placeholderPrefix: string
  idPrefix: string
  onChange: (next: string[]) => void
}

function SubtasksEditor({
  title,
  addLabel,
  items,
  placeholderPrefix,
  idPrefix,
  onChange,
}: SubtasksEditorProps) {
  return (
    <div className="task-form-subtasks">
      <div className="task-form-subtasks__head">
        <span>{title}</span>
        <button
          type="button"
          className="task-form-subtasks__add-btn"
          onClick={() => onChange([...items, ''])}
        >
          <Plus size={14} />
          {addLabel}
        </button>
      </div>

      {items.length > 0 && (
        <ul className="task-form-subtasks__list">
          {items.map((subtask, index) => (
            <li key={`${idPrefix}-${index}`} className="task-form-subtasks__item">
              <input
                type="text"
                value={subtask}
                placeholder={`${placeholderPrefix} ${index + 1}`}
                maxLength={255}
                onChange={(event) => {
                  const next = [...items]
                  next[index] = event.target.value
                  onChange(next)
                }}
              />
              <button
                type="button"
                className="task-form-subtasks__remove-btn"
                aria-label="Remove subtask"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SubtasksEditor
