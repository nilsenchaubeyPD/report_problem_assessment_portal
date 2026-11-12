import { Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { ScrollArea } from './ScrollArea'

interface Props {
  options: string[]
  value: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (value: string | null) => void
}

export function IssueDropdown({ options, value, open, onOpenChange, onChange }: Props) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null)

  // Fixed positioning lets the menu overlap the modal footer (Figma) instead of being
  // clipped by the form's scroll container.
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const r = selectRef.current?.getBoundingClientRect()
      if (!r) return
      const space = window.innerHeight - r.bottom - 16
      setPos({ top: r.bottom + 4, left: r.left, width: r.width, maxHeight: Math.max(140, Math.min(264, space)) })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setActive(value ? options.indexOf(value) : 0)
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, value, options, onOpenChange])

  const select = (opt: string) => {
    onChange(opt)
    onOpenChange(false) // closes automatically on selection
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return onOpenChange(true)
      setActive((i) => (e.key === 'ArrowDown' ? Math.min(options.length - 1, i + 1) : Math.max(0, i - 1)))
    } else if (e.key === 'Enter' && open && active >= 0) {
      e.preventDefault()
      select(options[active])
    }
  }

  return (
    <div className="field" ref={rootRef}>
      <label className="label" id={`${id}-label`} htmlFor={`${id}-btn`}>
        Issue Type <span className="req">*</span>
      </label>
      <div ref={selectRef} className={`select${value ? ' has-value' : ''}${open ? ' is-open' : ''}`}>
        <button
          id={`${id}-btn`}
          type="button"
          className="select-btn"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onClick={() => onOpenChange(!open)}
          onKeyDown={onKeyDown}
        >
          <span className={value ? 'select-value' : 'select-placeholder'}>{value ?? 'Select issue type...'}</span>
        </button>
        {/* Same 16px slot for chevron and clear icon so the sizes always match. */}
        <span className="select-icons">
          {open ? <ChevronUp size={16} className="chev" /> : <ChevronDown size={16} className="chev" />}
          {value && (
            <button
              type="button"
              className="select-clear"
              aria-label="Clear issue type"
              onClick={() => {
                onChange(null)
                onOpenChange(false)
              }}
            >
              <X size={16} />
            </button>
          )}
        </span>
        {open && pos && (
          <div className="menu" id={`${id}-list`} style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}>
            <ScrollArea className="menu-scroll">
              <ul role="listbox" aria-labelledby={`${id}-label`}>
                {options.map((opt, i) => (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={opt === value}
                    className={`opt-item${i === active ? ' active' : ''}${opt === value ? ' selected' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(opt)}
                  >
                    <span>{opt}</span>
                    {opt === value && <Check size={16} color="var(--blue-600)" />}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
