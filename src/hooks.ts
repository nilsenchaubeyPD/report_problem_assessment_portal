import { useEffect, useState } from 'react'

/** True on phones (design: Mobile 360). Tablet 768+ keeps the desktop modal. */
export function useIsMobile(): boolean {
  const query = '(max-width: 640px)'
  const [mobile, setMobile] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return mobile
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])
  return online
}

export const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function readCount(key: string): number {
  try {
    return Number(localStorage.getItem(key) ?? 0) || 0
  } catch {
    return 0
  }
}

export function writeCount(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    /* storage unavailable – ignore */
  }
}
