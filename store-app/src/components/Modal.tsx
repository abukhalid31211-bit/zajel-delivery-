import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** نافذة سفلية/مركزية موحدة */
export default function Modal({
  title,
  subtitle,
  children,
  onClose,
  dismissable = true,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  onClose?: () => void
  dismissable?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 sm:items-center"
      onClick={() => dismissable && onClose?.()}
    >
      <div
        className="animate-fade-up mx-auto max-h-[88dvh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white p-6 sm:mx-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold">{title}</h3>
            {subtitle && <p className="mt-1 text-xs leading-relaxed text-mute">{subtitle}</p>}
          </div>
          {onClose && dismissable && (
            <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-line text-mute">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

/* ---------------- Toast ---------------- */
export function Toast({ message, tone = 'gold', onDone }: { message: string; tone?: 'gold' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-6">
      <div
        className={`animate-fade-up max-w-[380px] rounded-2xl px-5 py-3 text-center text-xs font-bold text-white shadow-2xl ${
          tone === 'error' ? 'bg-danger' : 'bg-gold-strong'
        }`}
      >
        {message}
      </div>
    </div>
  )
}

export function useToast() {
  const [msg, setMsg] = useState<{ text: string; tone: 'gold' | 'error' } | null>(null)
  const toast = (text: string, tone: 'gold' | 'error' = 'gold') => setMsg({ text, tone })
  const node = msg ? <Toast message={msg.text} tone={msg.tone} onDone={() => setMsg(null)} /> : null
  return { toast, node }
}
