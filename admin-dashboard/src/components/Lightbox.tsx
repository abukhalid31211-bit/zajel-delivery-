import { X } from 'lucide-react'

export default function Lightbox({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/90 p-4" onClick={onClose}>
      <div className="mb-4 flex items-center justify-between text-white">
        <h3 className="text-sm font-bold">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-white/10">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
