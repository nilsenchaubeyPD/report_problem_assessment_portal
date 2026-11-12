import { Loader2, Monitor, Pencil, RefreshCw, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DESKTOP_CATEGORIES,
  ISSUE_TYPES,
  MAX_DETAILS,
  MOBILE_CATEGORIES,
  MOBILE_SUBMISSION_TYPES,
  type CategoryId,
  type DemoOutcome,
  type ReportPayload,
} from '../data'
import { delay, readCount, writeCount } from '../hooks'
import { makeSampleShot } from '../sampleShot'
import { ConfirmDialog, ErrorDialog, SuccessDialog } from './Dialogs'
import { IssueDropdown } from './IssueDropdown'
import { ScrollArea } from './ScrollArea'
import { ScreenshotEditor, type Annotation } from './ScreenshotEditor'

interface Props {
  mobile: boolean
  outcome: DemoOutcome
  /** Use a generated sample image instead of the browser's screen-share picker. */
  sampleCapture?: boolean
  onClose: () => void
  onSubmitted?: (payload: ReportPayload) => void
}

type Phase = 'form' | 'submitting' | 'success' | 'error-server' | 'error-offline'

interface Shot {
  original: string
  flat: string
  annotations: Annotation[]
}

const CONFIRM_KEY = 'rp_confirm_shown'
const CONFIRM_MAX = 3 // confirmation is shown 2-3 times, after that cancel means cancel

export function ReportFlow({ mobile, outcome, sampleCapture, onClose, onSubmitted }: Props) {
  const categories = mobile ? MOBILE_CATEGORIES : DESKTOP_CATEGORIES
  const [category, setCategory] = useState<CategoryId>('content')
  // Issue type is remembered per category until the user types in a new one.
  const [types, setTypes] = useState<Partial<Record<CategoryId, string>>>({})
  const [details, setDetails] = useState('')
  const [shot, setShot] = useState<Shot | null>(null)
  const [phase, setPhase] = useState<Phase>('form')
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [editor, setEditor] = useState<{ src: string; annotations: Annotation[] } | null>(null)
  const [hidden, setHidden] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const options = useMemo(
    () => (mobile && category === 'submission' ? MOBILE_SUBMISSION_TYPES : ISSUE_TYPES[category]),
    [mobile, category],
  )
  const issueType = types[category] ?? null
  const needsType = options.length > 0
  const dirty = details.trim().length > 0 || !!shot || Object.values(types).some(Boolean)
  const busy = phase === 'submitting'
  const canSubmit = !busy && (needsType ? !!issueType : details.trim().length > 0)
  const atLimit = details.length >= MAX_DETAILS

  // Lock page scroll behind the modal / sheet.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const showToast = (msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4000)
  }

  const requestClose = useCallback(() => {
    if (busy) return
    if (dirty && readCount(CONFIRM_KEY) < CONFIRM_MAX) {
      writeCount(CONFIRM_KEY, readCount(CONFIRM_KEY) + 1)
      setConfirming(true)
    } else onClose()
  }, [busy, dirty, onClose])

  useEffect(() => {
    if (editor) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (menuOpen) setMenuOpen(false)
      else if (confirming) setConfirming(false)
      else if (phase === 'success') onClose()
      else if (phase === 'form') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editor, menuOpen, confirming, phase, requestClose, onClose])

  const changeCategory = (id: CategoryId) => {
    if (id === category) return
    setCategory(id)
    setMenuOpen(false)
  }

  const changeType = (value: string | null) => {
    // Starting new input clears other categories' remembered data.
    setTypes(value ? { [category]: value } : { ...types, [category]: undefined })
  }

  const changeDetails = (value: string) => {
    const v = value.slice(0, MAX_DETAILS)
    if (v && !details) setTypes((t) => ({ [category]: t[category] }))
    setDetails(v)
  }

  const capture = async () => {
    if (sampleCapture) {
      setEditor({ src: makeSampleShot(), annotations: [] })
      return
    }
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) throw new Error('unsupported')
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        preferCurrentTab: true,
      } as DisplayMediaStreamOptions)
      setHidden(true) // keep the report modal out of the capture
      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true
      await video.play()
      await delay(350)
      const c = document.createElement('canvas')
      c.width = video.videoWidth
      c.height = video.videoHeight
      c.getContext('2d')!.drawImage(video, 0, 0)
      stream.getTracks().forEach((t) => t.stop())
      setHidden(false)
      setEditor({ src: c.toDataURL('image/jpeg', 0.85), annotations: [] })
    } catch (err) {
      setHidden(false)
      // Picker dismissed by the user is not an error.
      if ((err as DOMException)?.name === 'NotAllowedError') return
      showToast("Couldn't attach the screenshot. Please check your connection and try again.")
    }
  }

  const submit = async () => {
    setPhase('submitting')
    await delay(1200)
    if (outcome === 'offline' || !navigator.onLine) return setPhase('error-offline')
    if (outcome === 'server') return setPhase('error-server')
    onSubmitted?.({
      category,
      issueType,
      details: details.trim(),
      screenshot: shot?.flat ?? null,
      submittedAt: new Date().toISOString(),
    })
    setPhase('success')
  }

  const overlayDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && phase === 'form' && !editor) requestClose()
    else if (e.target === e.currentTarget && phase === 'success') onClose()
  }

  // ---- Success: replaces the form -------------------------------------------------
  if (phase === 'success') {
    return (
      <div className={`overlay${mobile ? ' sheet-mode' : ''}`} onMouseDown={overlayDown}>
        <SuccessDialog mobile={mobile} onDone={onClose} />
      </div>
    )
  }

  return (
    <>
      <div className={`overlay${mobile ? ' sheet-mode' : ''}${hidden ? ' invisible' : ''}`} onMouseDown={overlayDown}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
          <div className="modal-header">
            <h2 id="report-title">Report an Issue</h2>
            <button type="button" className="icon-btn" aria-label="Close" onClick={requestClose} disabled={busy}>
              <X size={16} />
            </button>
          </div>

          <ScrollArea className="modal-scroll">
            <div className="modal-body">
              <div className="chips" role="radiogroup" aria-label="Issue category">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={c.id === category}
                    className={`chip${c.id === category ? ' on' : ''}`}
                    onClick={() => changeCategory(c.id)}
                    disabled={busy}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {needsType && (
                <IssueDropdown
                  key={category + (mobile ? 'm' : 'd')}
                  options={options}
                  value={issueType}
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                  onChange={changeType}
                />
              )}

              <div className="field">
                <label className="label" htmlFor="rp-details">
                  Additional Details
                  {!needsType && <span className="req"> *</span>}
                </label>
                <textarea
                  id="rp-details"
                  className={`textarea${atLimit ? ' error' : ''}`}
                  placeholder="Please explain your issue in detail..."
                  value={details}
                  maxLength={MAX_DETAILS}
                  disabled={busy}
                  onChange={(e) => changeDetails(e.target.value)}
                  aria-describedby="rp-count"
                />
                <div className="counter-row" id="rp-count">
                  <span className="limit-msg" role={atLimit ? 'alert' : undefined}>
                    {atLimit ? 'Description character limitation reached' : ''}
                  </span>
                  <span className={`counter${atLimit ? ' error' : ''}`}>
                    {details.length}/{MAX_DETAILS}
                  </span>
                </div>
              </div>

              {/* Screenshot capture is designed but deferred on mobile (no proctoring there). */}
              {!mobile &&
                (shot ? (
                  <div className="shot-card">
                    <button
                      type="button"
                      className="shot-main"
                      onClick={() => setEditor({ src: shot.original, annotations: shot.annotations })}
                      disabled={busy}
                    >
                      <img src={shot.flat} alt="" />
                      <span className="shot-text">
                        <strong>Screenshot attached</strong>
                        <small>Tap to view</small>
                      </span>
                    </button>
                    <div className="shot-actions">
                      <button type="button" className="link" onClick={capture} disabled={busy}>
                        <RefreshCw size={14} /> Retake
                      </button>
                      <button
                        type="button"
                        className="icon-btn plain"
                        aria-label="Edit screenshot"
                        onClick={() => setEditor({ src: shot.original, annotations: shot.annotations })}
                        disabled={busy}
                      >
                        <Pencil size={16} />
                      </button>
                      <span className="vsep" />
                      <button
                        type="button"
                        className="icon-btn plain danger"
                        aria-label="Remove screenshot"
                        onClick={() => setShot(null)}
                        disabled={busy}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="capture" onClick={capture} disabled={busy}>
                    <Monitor size={18} /> Capture screenshot
                  </button>
                ))}
            </div>
          </ScrollArea>

          <div className="modal-footer">
            <button type="button" className="btn ghost" onClick={requestClose} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="btn primary" onClick={submit} disabled={!canSubmit}>
              {busy ? (
                <>
                  <Loader2 size={16} className="spin" /> Submitting...
                </>
              ) : (
                'Submit report'
              )}
            </button>
          </div>
        </div>

        {toast && (
          <div className="toast" role="alert">
            {toast}
          </div>
        )}
      </div>

      {(phase === 'error-server' || phase === 'error-offline') && (
        <div className={`overlay top${mobile ? ' sheet-mode' : ''}`}>
          <ErrorDialog
            kind={phase === 'error-offline' ? 'offline' : 'server'}
            mobile={mobile}
            onCancel={() => setPhase('form')}
            onRetry={submit}
          />
        </div>
      )}

      {confirming && (
        <div className={`overlay top${mobile ? ' sheet-mode' : ''}`}>
          <ConfirmDialog mobile={mobile} onKeep={() => setConfirming(false)} onDiscard={onClose} />
        </div>
      )}

      {editor && (
        <ScreenshotEditor
          src={editor.src}
          initial={editor.annotations}
          onDiscard={() => setEditor(null)}
          onAttach={(flat, annotations) => {
            setShot({ original: editor.src, flat, annotations })
            setEditor(null)
          }}
        />
      )}
    </>
  )
}
