import type { MouseEvent, ReactNode } from 'react'
import './Modal.css'

type ModalProps = {
  children: ReactNode
  onClose: () => void
  cardClassName?: string
  overlayClassName?: string
  onCardClick?: (event: MouseEvent<HTMLDivElement>) => void
}

function Modal({
  children,
  onClose,
  cardClassName = '',
  overlayClassName = '',
  onCardClick,
}: ModalProps) {
  const overlayClasses = ['ui-modal__overlay', overlayClassName]
    .filter(Boolean)
    .join(' ')

  const cardClasses = ['ui-modal__card', cardClassName]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={overlayClasses}
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) {
          return
        }

        onClose()
      }}
    >
      <div
        className={cardClasses}
        onClick={(event) => {
          onCardClick?.(event)
          event.stopPropagation()
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
