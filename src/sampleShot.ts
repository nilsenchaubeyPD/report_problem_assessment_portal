/** Draws a stand-in "assessment page" capture for browsers where screen-share is unavailable. */
export function makeSampleShot(): string {
  const c = document.createElement('canvas')
  c.width = 1280
  c.height = 720
  const g = c.getContext('2d')!
  g.fillStyle = '#f8fafc'
  g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = '#fff'
  g.fillRect(0, 0, c.width, 56)
  g.fillStyle = '#2563eb'
  g.fillRect(20, 16, 24, 24)
  g.fillStyle = '#1e293b'
  g.font = '600 20px Inter, system-ui, sans-serif'
  g.fillText('topin.tech', 54, 36)
  g.font = '500 14px Inter, system-ui, sans-serif'
  g.fillStyle = '#475569'
  g.fillText('Report     Excellent     Issac', 1040, 34)
  // left description pane
  g.fillStyle = '#fff'
  g.fillRect(0, 56, 360, 664)
  g.fillStyle = '#1e293b'
  g.font = '500 22px Inter, system-ui, sans-serif'
  g.fillText('Tech Blog Platform', 24, 110)
  g.fillStyle = '#cbd5e1'
  for (let i = 0; i < 9; i++) g.fillRect(24, 140 + i * 26, 280 - (i % 3) * 40, 10)
  g.fillStyle = '#e0e7ff'
  g.fillRect(24, 390, 312, 200)
  // editor
  g.fillStyle = '#0f172a'
  g.fillRect(360, 56, 920, 664)
  g.font = '14px ui-monospace, Menlo, monospace'
  const lines = ['<!DOCTYPE html>', '<html lang="en">', '  <head>', '    <meta charset="UTF-8" />', '  </head>', '  <body>', '    Your code goes here', '  </body>', '</html>']
  lines.forEach((l, i) => {
    g.fillStyle = '#64748b'
    g.fillText(String(i + 1), 384, 96 + i * 26)
    g.fillStyle = '#e2e8f0'
    g.fillText(l, 430, 96 + i * 26)
  })
  return c.toDataURL('image/jpeg', 0.9)
}
