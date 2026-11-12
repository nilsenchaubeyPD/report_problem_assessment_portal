import { Highlighter, Trash2, Type, Undo2, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface Rect {
  kind: 'rect'
  x: number
  y: number
  w: number
  h: number
}
export interface Note {
  kind: 'note'
  x: number
  y: number
  text: string
}
export type Annotation = Rect | Note

type Tool = 'highlight' | 'text'

interface Props {
  src: string
  initial: Annotation[]
  onAttach: (flat: string, annotations: Annotation[]) => void
  onDiscard: () => void
}

const MIN_ZOOM = 1 // zoom-out only goes back to 100%
const MAX_ZOOM = 2 // zoom-in goes up to 200%
const STEP = 0.5

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))

export function ScreenshotEditor({ src, initial, onAttach, onDiscard }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [aspect, setAspect] = useState(16 / 9)
  const [fit, setFit] = useState({ w: 800, h: 450 })
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState<Tool>('highlight')
  const [items, setItems] = useState<Annotation[]>(initial)
  const [draft, setDraft] = useState<Rect | null>(null)
  const [editing, setEditing] = useState<{ x: number; y: number } | null>(null)
  const [noteText, setNoteText] = useState('')
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  // "100%" = capture fills the frame (contain-fit inside the viewport).
  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const calc = () => {
      const w = el.clientWidth - 32
      const h = el.clientHeight - 32
      const fw = Math.max(120, Math.min(w, h * aspect))
      setFit({ w: fw, h: fw / aspect })
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [aspect])

  const point = (e: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect()
    return { x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) }
  }

  const commitNote = useCallback(() => {
    setEditing((cur) => {
      const text = noteText.trim()
      if (cur && text) setItems((p) => [...p, { kind: 'note', x: cur.x, y: cur.y, text }])
      return null
    })
    setNoteText('')
  }, [noteText])

  // Text notes are placed on click (after mouse-up) so the input keeps focus.
  const onStageClick = (e: React.MouseEvent) => {
    if (tool !== 'text' || editing) return
    setEditing(point(e))
    setNoteText('')
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (tool !== 'highlight' || editing) return
    const p = point(e)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    startRef.current = p
    setDraft({ kind: 'rect', x: p.x, y: p.y, w: 0, h: 0 })
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const s = startRef.current
    if (!s) return
    const p = point(e)
    setDraft({ kind: 'rect', x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) })
  }

  const onPointerUp = () => {
    if (startRef.current && draft && draft.w > 0.006 && draft.h > 0.006) setItems((p) => [...p, draft])
    startRef.current = null
    setDraft(null)
  }

  const undo = useCallback(() => setItems((p) => p.slice(0, -1)), [])
  const zoomBy = useCallback((d: number) => setZoom((z) => clamp(z + d, MIN_ZOOM, MAX_ZOOM)), [])

  const attach = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const scale = img.naturalWidth / fit.w
    for (const a of items) {
      if (a.kind === 'rect') {
        ctx.fillStyle = 'rgba(239,68,68,0.12)'
        ctx.fillRect(a.x * c.width, a.y * c.height, a.w * c.width, a.h * c.height)
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2 * scale
        ctx.strokeRect(a.x * c.width, a.y * c.height, a.w * c.width, a.h * c.height)
      } else {
        const fs = 14 * scale
        ctx.font = `500 ${fs}px Inter, system-ui, sans-serif`
        const tw = ctx.measureText(a.text).width
        const px = 8 * scale
        const py = 5 * scale
        const x = a.x * c.width
        const y = a.y * c.height
        ctx.fillStyle = '#fef3c7'
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 1 * scale
        ctx.fillRect(x, y, tw + px * 2, fs + py * 2)
        ctx.strokeRect(x, y, tw + px * 2, fs + py * 2)
        ctx.fillStyle = '#1e293b'
        ctx.textBaseline = 'top'
        ctx.fillText(a.text, x + px, y + py + fs * 0.08)
      }
    }
    onAttach(c.toDataURL('image/jpeg', 0.85), items)
  }, [fit.w, items, onAttach])

  // Keyboard support on the toolbar (Figma dev note).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT'
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (editing) {
          setEditing(null)
          setNoteText('')
        } else onDiscard()
        return
      }
      if (typing) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      } else if (e.key.toLowerCase() === 'h') setTool('highlight')
      else if (e.key.toLowerCase() === 't') setTool('text')
      else if (e.key === '+' || e.key === '=') zoomBy(STEP)
      else if (e.key === '-') zoomBy(-STEP)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [editing, onDiscard, undo, zoomBy])

  const stageW = fit.w * zoom
  const stageH = fit.h * zoom

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Edit screenshot">
      <div className="editor-panel">
        <div className="editor-viewport" ref={viewportRef}>
          <div className="editor-scroll">
            <div
              ref={stageRef}
              className={`stage tool-${tool}`}
              style={{ width: stageW, height: stageH, ['--zoom' as string]: zoom }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onClick={onStageClick}
            >
              <img
                ref={imgRef}
                src={src}
                alt="Captured screenshot"
                draggable={false}
                onLoad={(e) => setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
              />
              {[...items, ...(draft ? [draft] : [])].map((a, i) =>
                a.kind === 'rect' ? (
                  <div
                    key={i}
                    className="mark-rect"
                    style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%`, width: `${a.w * 100}%`, height: `${a.h * 100}%` }}
                  />
                ) : (
                  <div key={i} className="mark-note" style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%` }}>
                    {a.text}
                  </div>
                ),
              )}
              {editing && (
                <input
                  className="mark-note editing"
                  autoFocus
                  value={noteText}
                  placeholder="Type a note…"
                  maxLength={80}
                  style={{ left: `${editing.x * 100}%`, top: `${editing.y * 100}%` }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={commitNote}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitNote()
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="editor-bar">
          <div className="tools" role="toolbar" aria-label="Annotation tools">
            <button
              type="button"
              className={`tool${tool === 'highlight' ? ' on' : ''}`}
              onClick={() => setTool('highlight')}
              aria-pressed={tool === 'highlight'}
              title="Highlight (H) – Click & Drag to highlight"
            >
              <Highlighter size={16} />
            </button>
            <button
              type="button"
              className={`tool${tool === 'text' ? ' on' : ''}`}
              onClick={() => setTool('text')}
              aria-pressed={tool === 'text'}
              title="Text (T) – Click to add text"
            >
              <Type size={16} />
            </button>
            <span className="sep" />
            <button type="button" className="tool" onClick={undo} disabled={!items.length} title="Undo (Ctrl/⌘ + Z)">
              <Undo2 size={16} />
            </button>
            <button type="button" className="tool" onClick={() => setItems([])} disabled={!items.length} title="Clear all">
              <Trash2 size={16} />
            </button>
            <span className="hint">{tool === 'highlight' ? 'Click & Drag to highlight' : 'Click to add text'}</span>
          </div>
          <div className="zoom">
            <button type="button" className="tool" onClick={() => zoomBy(-STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">
              <ZoomOut size={16} />
            </button>
            <span className="zoom-label">{Math.round(zoom * 100)}%</span>
            <button type="button" className="tool" onClick={() => zoomBy(STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
              <ZoomIn size={16} />
            </button>
          </div>
          <div className="actions">
            <button type="button" className="btn ghost sm" onClick={onDiscard}>
              Discard
            </button>
            <button type="button" className="btn primary sm" onClick={attach}>
              Attach
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
