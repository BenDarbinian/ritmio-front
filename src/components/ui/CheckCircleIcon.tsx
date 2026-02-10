import { Check } from 'lucide-react'
import './CheckCircleIcon.css'

type CheckCircleIconProps = {
  checked: boolean
  tone: 'blue' | 'green'
  size?: 'sm' | 'md'
  className?: string
}

function CheckCircleIcon({
  checked,
  tone,
  size = 'md',
  className = '',
}: CheckCircleIconProps) {
  const classes = [
    'check-circle-icon',
    `tone-${tone}`,
    `size-${size}`,
    checked ? 'is-checked' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} aria-hidden="true">
      {checked ? <Check size={12} strokeWidth={3} /> : null}
    </span>
  )
}

export default CheckCircleIcon
