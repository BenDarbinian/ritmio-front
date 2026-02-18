import { Check, MoreHorizontal } from 'lucide-react'
import './StatusCircleIcon.css'

type StatusCircleIconProps = {
  state: 'empty' | 'partial' | 'done'
  tone?: 'green' | 'blue'
  size?: 'sm' | 'md'
  className?: string
}

function StatusCircleIcon({
  state,
  tone = 'green',
  size = 'md',
  className = '',
}: StatusCircleIconProps) {
  const classes = [
    'status-circle-icon',
    `status-circle-icon--state-${state}`,
    `status-circle-icon--tone-${tone}`,
    `status-circle-icon--size-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} aria-hidden="true">
      {state === 'done' ? <Check size={12} strokeWidth={3} /> : null}
      {state === 'partial' ? <MoreHorizontal size={12} strokeWidth={3} /> : null}
    </span>
  )
}

export default StatusCircleIcon
