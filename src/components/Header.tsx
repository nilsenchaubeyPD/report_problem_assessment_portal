import { AlertOctagon, ChevronDown, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Props {
  mobile: boolean
  /** Hide the Report CTA (External display / screen-share screens). */
  showReport: boolean
  online: boolean
  /** Auto-show the tooltip + pulse for 4s (assessment starting screen). */
  autoTooltip: boolean
  reportOpen: boolean
  onReport: () => void
}

export function Logo() {
  return (
    <span className="logo" aria-label="topin.tech">
      <span className="logo-mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect width="22" height="22" rx="6" fill="#2563eb" />
          <path d="M6 7h10M11 7v9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="logo-word">
        topin<span>.tech</span>
      </span>
    </span>
  )
}

export function Header({ mobile, showReport, online, autoTooltip, reportOpen, onReport }: Props) {
  const [autoShow, setAutoShow] = useState(false)
  const [hover, setHover] = useState(false)

  // Tooltip + pulse appear automatically for 4s, then disappear (Figma dev note).
  useEffect(() => {
    if (!autoTooltip || !showReport) {
      setAutoShow(false)
      return
    }
    setAutoShow(true)
    const t = setTimeout(() => setAutoShow(false), 4000)
    return () => clearTimeout(t)
  }, [autoTooltip, showReport])

  const tooltipVisible = showReport && !reportOpen && (autoShow || hover)
  const pulsing = showReport && !reportOpen && autoShow

  return (
    <header className="header">
      <Logo />
      <div className="header-right">
        {showReport && (
          <div className="report-wrap" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <button
              type="button"
              className={`report-btn${pulsing ? ' pulsing' : ''}`}
              onClick={() => {
                setAutoShow(false)
                onReport()
              }}
              aria-label="Report an issue"
              aria-haspopup="dialog"
            >
              <AlertOctagon size={16} aria-hidden="true" />
              {!mobile && <span>Report</span>}
            </button>
            {tooltipVisible && (
              <div className="tooltip" role="tooltip">
                Facing any problem? Report here.
              </div>
            )}
          </div>
        )}
        <div className="net">
          {online ? <Wifi size={16} color="var(--green-500)" /> : <WifiOff size={16} color="var(--red-500)" />}
          {!mobile && <span>{online ? 'Excellent' : 'Offline'}</span>}
        </div>
        {mobile ? (
          <span className="avatar" aria-label="Issac">
            I
          </span>
        ) : (
          <button type="button" className="user-btn">
            Issac <ChevronDown size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  )
}
