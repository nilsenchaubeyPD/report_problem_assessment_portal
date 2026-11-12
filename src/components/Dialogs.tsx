import { Check, CircleAlert, WifiOff } from 'lucide-react'

export function SuccessDialog({ mobile, onDone }: { mobile: boolean; onDone: () => void }) {
  return (
    <div className={`dialog${mobile ? ' as-sheet' : ''}`} role="alertdialog" aria-labelledby="ok-title" aria-describedby="ok-desc">
      <span className="badge ok">
        <Check size={20} />
      </span>
      <h2 id="ok-title">Thanks for reporting</h2>
      <p id="ok-desc">We'll look into it and work to resolve it as soon as possible.</p>
      <button type="button" className="btn done" onClick={onDone} autoFocus>
        Done
      </button>
    </div>
  )
}

export function ErrorDialog({
  kind,
  mobile,
  onCancel,
  onRetry,
}: {
  kind: 'server' | 'offline'
  mobile: boolean
  onCancel: () => void
  onRetry: () => void
}) {
  const offline = kind === 'offline'
  return (
    <div className={`dialog${mobile ? ' as-sheet' : ''}`} role="alertdialog" aria-labelledby="err-title" aria-describedby="err-desc">
      <span className="badge bad">{offline ? <WifiOff size={20} /> : <CircleAlert size={20} />}</span>
      <h2 id="err-title">{offline ? 'No Internet Connection' : 'Submission Failed'}</h2>
      <p id="err-desc">
        {offline
          ? 'Unable to submit your report. Please check your internet connection and try again.'
          : 'Something went wrong. Please check your connection and try again.'}
      </p>
      <div className="dialog-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn primary" onClick={onRetry} autoFocus>
          Retry
        </button>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  mobile,
  onKeep,
  onDiscard,
}: {
  mobile: boolean
  onKeep: () => void
  onDiscard: () => void
}) {
  return (
    <div className={`dialog${mobile ? ' as-sheet' : ''}`} role="alertdialog" aria-labelledby="cf-title" aria-describedby="cf-desc">
      <h2 id="cf-title" className="left">
        Discard this report?
      </h2>
      <p id="cf-desc" className="left">
        You haven't submitted it yet. If you close now, what you've entered will be lost.
      </p>
      <div className="dialog-actions">
        <button type="button" className="btn ghost" onClick={onDiscard}>
          Discard
        </button>
        <button type="button" className="btn primary" onClick={onKeep} autoFocus>
          Keep editing
        </button>
      </div>
    </div>
  )
}
