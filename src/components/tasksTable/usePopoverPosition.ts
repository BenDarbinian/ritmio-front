import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

type UsePopoverPositionInput = {
  isOpen: boolean
  anchorRef: RefObject<HTMLElement | null>
  popoverRef: RefObject<HTMLElement | null>
  preferredWidth?: number
  fallbackHeight?: number
}

type PopoverPosition = {
  top: number
  left: number
  width: number
}

export function usePopoverPosition({
  isOpen,
  anchorRef,
  popoverRef,
  preferredWidth = 288,
  fallbackHeight = 320,
}: UsePopoverPositionInput) {
  const [vertical, setVertical] = useState<'top' | 'bottom'>('bottom')
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, width: 0 })

  const updatePosition = useCallback(() => {
    if (!anchorRef.current || !popoverRef.current) {
      return
    }

    const anchorRect = anchorRef.current.getBoundingClientRect()
    const popoverRect = popoverRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 12
    const gap = 6

    const popoverWidth = Math.min(preferredWidth, viewportWidth - margin * 2)
    const popoverHeight = popoverRect.height || fallbackHeight
    const spaceBelow = viewportHeight - anchorRect.bottom - margin
    const spaceAbove = anchorRect.top - margin
    const shouldOpenTop = spaceBelow < popoverHeight + gap && spaceAbove > spaceBelow

    const left = Math.min(
      Math.max(anchorRect.left, margin),
      viewportWidth - popoverWidth - margin,
    )
    const top = shouldOpenTop
      ? Math.max(margin, anchorRect.top - popoverHeight - gap)
      : Math.min(viewportHeight - popoverHeight - margin, anchorRect.bottom + gap)

    setVertical(shouldOpenTop ? 'top' : 'bottom')
    setPosition({ top, left, width: popoverWidth })
  }, [anchorRef, fallbackHeight, popoverRef, preferredWidth])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      updatePosition()
    })

    const handleResize = () => updatePosition()
    const handleScroll = () => updatePosition()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, updatePosition])

  return { vertical, position, updatePosition }
}
