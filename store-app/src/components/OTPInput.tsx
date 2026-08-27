import { useEffect, useRef, useState } from 'react'

/** حقول رمز التحقق المنفصلة مع انتقال تلقائي للتركيز */
export default function OTPInput({
  length = 4,
  shake,
  disabled,
  onComplete,
}: {
  length?: number
  shake?: boolean
  disabled?: boolean
  onComplete?: (code: string) => void
}) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const firedRef = useRef(false)

  useEffect(() => {
    if (shake) {
      setDigits(Array(length).fill(''))
      firedRef.current = false
      setTimeout(() => refs.current[0]?.focus(), 100)
    }
  }, [shake, length])

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < length - 1) refs.current[i + 1]?.focus()
    if (next.every((d) => d !== '') && !firedRef.current) {
      firedRef.current = true
      onComplete?.(next.join(''))
    }
  }

  return (
    <div className={`flex justify-center gap-2.5 ${shake ? 'animate-shake' : ''}`} dir="ltr">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="field h-14 w-13 text-center text-xl font-extrabold"
          maxLength={1}
          inputMode="numeric"
          disabled={disabled}
          value={d}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus()
          }}
        />
      ))}
    </div>
  )
}
