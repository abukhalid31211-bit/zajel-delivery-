import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({
  title,
  children,
  onClose,
  wide = false,
  extraWide = false,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  wide?: boolean
  extraWide?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const max = extraWide ? 'max-w-4xl' : wide ? 'max-w-2xl' : 'max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`animate-fade-up max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${max}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="text-base font-bold">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-mute hover:bg-page hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
