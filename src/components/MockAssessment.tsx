import { Clock, FileText, List, MonitorUp, MonitorX, ScanFace } from 'lucide-react'

export type ScreenId = 'start' | 'coding' | 'mcq' | 'external' | 'share'

export const SCREENS: { id: ScreenId; label: string }[] = [
  { id: 'start', label: 'Start' },
  { id: 'coding', label: 'Coding' },
  { id: 'mcq', label: 'MCQ' },
  { id: 'external', label: 'External display' },
  { id: 'share', label: 'Screen share' },
]

/** Screens that block the candidate – the Report CTA is not shown on these. */
export const BLOCKING: ScreenId[] = ['external', 'share']

const INSTRUCTIONS = [
  'Check the assessment time carefully. You can only take the assessment at the times mentioned.',
  'Be ready with your device fully charged 5-10 minutes before the assessment starts.',
  'Turn off notifications on your device, silence any other devices nearby and ensure all unnecessary tabs/windows are closed.',
  'Use Google Chrome for the assessment. Other browsers may cause problems.',
  "If you switch tabs, your assessment will be terminated and you won't be allowed to attempt it again.",
  "You'll find the WhatsApp icon at the bottom right corner of the screen. Feel free to contact us if you have any technical problems.",
]

function Start({ mobile }: { mobile: boolean }) {
  return (
    <div className="start">
      <aside className="start-side">
        <p className="muted-light">Hi Issac, Welcome to</p>
        <h1>testing 1 only - copy</h1>
        <p className="meta">1 SECTION</p>
        <p className="meta">ASSESSMENT DURATION - 25MINS</p>
        {!mobile && <button className="start-btn">Start</button>}
      </aside>
      <section className="start-main">
        <h2>Assessment Instructions</h2>
        <p className="muted">Read all the instructions carefully</p>
        <div className="checks">
          <div>
            <strong>Check Internet Connection</strong>
            <p className="muted">You need a stable internet connection to continue</p>
          </div>
          {!mobile && (
            <div>
              <strong>Check Camera Access</strong>
              <p className="muted">You need to keep your camera turned on during the assessment</p>
            </div>
          )}
        </div>
        <ul>
          {INSTRUCTIONS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {mobile && <button className="start-btn blue">Start</button>}
      </section>
    </div>
  )
}

function Coding() {
  return (
    <div className="coding">
      <div className="coding-top">
        <span className="top-left">← WEB · INSTRUCTIONS</span>
        <span className="top-left">
          <List size={14} /> PROBLEMS LIST
        </span>
        <span className="timer">
          <Clock size={14} /> 59 : 16<small>TIME LEFT</small>
        </span>
        <span className="top-right">
          <ScanFace size={16} /> END SECTION
        </span>
      </div>
      <div className="coding-body">
        <div className="coding-desc">
          <span className="tab">
            <FileText size={12} /> DESCRIPTION
          </span>
          <h3>Tech Blog Platform</h3>
          <p>
            Build a clean, interactive application inspired by the Output. Use HTML, CSS and Bootstrap to replicate the
            design layout, sections and Functionality.
          </p>
          <p>Strive to match your code output with expected output at the given dimensions.</p>
          <div className="note">
            <strong>Note</strong>
            <ul>
              <li>Use settings icon to adjust the height and width before you start writing your code.</li>
              <li>On clicking Visual Test, 'Final Score' is calculated by comparing your 'Code Output' with 'Expected Output'.</li>
              <li>Your code will be registered only after clicking Submit button.</li>
            </ul>
          </div>
        </div>
        <pre className="editor">
          {[
            '<!DOCTYPE html>',
            '<html lang="en">',
            '  <head>',
            '    <meta charset="UTF-8" />',
            '    <link rel="stylesheet" href="bootstrap.min.css" />',
            '    <script src="popper.min.js"></script>',
            '  </head>',
            '  <body>',
            '    Your code goes here',
            '  </body>',
            '</html>',
          ].map((l, i) => (
            <div key={i}>
              <i>{i + 1}</i>
              {l}
            </div>
          ))}
        </pre>
      </div>
      <div className="coding-bottom">
        <span>
          <button>RESET</button> <button>SAVE</button>
        </span>
        <span>
          <button>VISUAL TEST</button> <button>RUN CODE</button> <button className="blue">SUBMIT</button>
        </span>
      </div>
    </div>
  )
}

function Mcq({ mobile }: { mobile: boolean }) {
  return (
    <div className={`mcq${mobile ? ' mobile' : ''}`}>
      <div className="mcq-top">
        <strong>DATABASE MANAGEMENT</strong>
        <span className="timer">
          <Clock size={14} /> 22 : 04
        </span>
      </div>
      <div className="mcq-body">
        <div className="mcq-q">
          <p className="muted">Question 12</p>
          <h3>In your database, you are working with a table that must not contain duplicate values. Which constraint will you use?</h3>
          {['UNIQUE', 'LIMIT', 'DISTINCT', 'CONSTRAINT'].map((o) => (
            <label key={o} className="opt">
              <input type="radio" name="mcq" /> {o}
            </label>
          ))}
        </div>
        {!mobile && (
          <div className="mcq-palette">
            <p>Questions (30)</p>
            <div className="grid">
              {Array.from({ length: 30 }, (_, i) => (
                <span key={i} className={i < 11 ? 'done' : ''}>
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mcq-bottom">
        <button className="blue">SUBMIT</button>
        <button className="amber">MARK FOR REVIEW</button>
      </div>
    </div>
  )
}

function Block({ kind }: { kind: 'external' | 'share' }) {
  return (
    <div className="block-screen">
      <div className="block-card">
        {kind === 'external' ? (
          <>
            <MonitorX size={28} color="var(--red-500)" />
            <h3>External Display Detected</h3>
            <p>
              Looks like multiple display setups are present. Please disconnect any additional displays &amp; click on
              the button below to continue.
            </p>
            <button className="blue">I HAVE DISCONNECTED</button>
          </>
        ) : (
          <>
            <MonitorUp size={28} color="var(--blue-600)" />
            <h3>Your Screen is shared</h3>
            <p>You can proceed to start the exam now.</p>
            <p className="warn">
              Do not stop screen sharing or stop the exam will be terminated. Click on "Hide" to hide the screen share
              toolbar.
            </p>
            <button className="blue">NEXT</button>
          </>
        )}
      </div>
    </div>
  )
}

export function MockAssessment({ screen, mobile }: { screen: ScreenId; mobile: boolean }) {
  switch (screen) {
    case 'start':
      return <Start mobile={mobile} />
    case 'coding':
      return mobile ? <Mcq mobile /> : <Coding />
    case 'mcq':
      return <Mcq mobile={mobile} />
    default:
      return <Block kind={screen} />
  }
}
