import { useState } from 'react'
import { Header } from './components/Header'
import { BLOCKING, MockAssessment, SCREENS, type ScreenId } from './components/MockAssessment'
import { ReportFlow } from './components/ReportFlow'
import type { DemoOutcome } from './data'
import { useIsMobile, useOnline } from './hooks'
import { MessageCircle } from 'lucide-react'

const OUTCOMES: { id: DemoOutcome; label: string }[] = [
  { id: 'success', label: 'Success' },
  { id: 'server', label: 'Server error' },
  { id: 'offline', label: 'Offline' },
]

export default function App() {
  const mobile = useIsMobile()
  const online = useOnline()
  const [screen, setScreen] = useState<ScreenId>('start')
  const [open, setOpen] = useState(false)
  const [outcome, setOutcome] = useState<DemoOutcome>('success')
  const [demoOpen, setDemoOpen] = useState(true)
  const [sample, setSample] = useState(false)

  const blocking = BLOCKING.includes(screen)

  return (
    <div className="app">
      <Header
        mobile={mobile}
        online={online}
        showReport={!blocking}
        autoTooltip={screen === 'start'}
        reportOpen={open}
        onReport={() => setOpen(true)}
      />
      <main className="stage-main">
        <MockAssessment screen={screen} mobile={mobile} />
      </main>

      {/* WhatsApp help button hides while the report sheet is open on mobile. */}
      {!(mobile && open) && (
        <button type="button" className="whatsapp" aria-label="Contact support on WhatsApp">
          <MessageCircle size={22} />
        </button>
      )}

      {open && <ReportFlow mobile={mobile} outcome={outcome} sampleCapture={sample} onClose={() => setOpen(false)} />}

      <aside className={`demo${demoOpen ? '' : ' collapsed'}`} aria-label="Prototype controls">
        <button type="button" className="demo-toggle" onClick={() => setDemoOpen((v) => !v)}>
          Prototype controls {demoOpen ? '–' : '+'}
        </button>
        {demoOpen && (
          <>
            <div className="demo-row">
              <span>Screen</span>
              {SCREENS.map((s) => (
                <button key={s.id} className={screen === s.id ? 'on' : ''} onClick={() => setScreen(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="demo-row">
              <span>Submit result</span>
              {OUTCOMES.map((o) => (
                <button key={o.id} className={outcome === o.id ? 'on' : ''} onClick={() => setOutcome(o.id)}>
                  {o.label}
                </button>
              ))}
            </div>
            <div className="demo-row">
              <span>Capture</span>
              <button className={!sample ? 'on' : ''} onClick={() => setSample(false)}>Screen share</button>
              <button className={sample ? 'on' : ''} onClick={() => setSample(true)}>Sample image</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
