import { useEffect, useRef, useState } from 'react'

/** عداد تنازلي حقيقي يعيد النداء عند الصفر */
export default function Countdown({
  seconds,
  onDone,
  className = '',
}: {
  seconds: number
  onDone?: () => void
  className?: string
}) {
  const [left, setLeft] = useState(seconds)
  const doneRef = useRef(false)

  useEffect(() => {
    setLeft(seconds)
    doneRef.current = false
  }, [seconds])

  useEffect(() => {
    if (left <= 0) {
      if (!doneRef.current) {
        doneRef.current = true
        onDone?.()
      }
      return
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return (
    <span className={className} dir="ltr">
      {mm}:{ss}
    </span>
  )
}
