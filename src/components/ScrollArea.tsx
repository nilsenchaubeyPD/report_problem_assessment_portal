import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  className?: string
  children: ReactNode
}

/**
 * Scroll container with edge gradients (Figma dev note): bottom gradient by
 * default when there is more content, both while scrolling, only the top one
 * once the user reaches the bottom.
 */
export function ScrollArea({ className = '', children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ top: false, bottom: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const next = {
      top: el.scrollTop > 1,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
    }
    setEdge((p) => (p.top === next.top && p.bottom === next.bottom ? p : next))
  }, [])

  useEffect(() => {
    update()
    const ro = new ResizeObserver(update)
    if (ref.current) ro.observe(ref.current)
    if (innerRef.current) ro.observe(innerRef.current)
    return () => ro.disconnect()
  }, [update])

  return (
    <div className={`scroll-wrap ${className}`}>
      <div className={`fade fade-top${edge.top ? ' on' : ''}`} aria-hidden="true" />
      <div className="scroll" ref={ref} onScroll={update}>
        <div ref={innerRef}>{children}</div>
      </div>
      <div className={`fade fade-bottom${edge.bottom ? ' on' : ''}`} aria-hidden="true" />
    </div>
  )
}
