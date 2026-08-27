import { useEffect, useState } from 'react'

/** Toast صغير يظهر أسفل الشاشة ويختفي تلقائياً */
export default function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-6">
      <div className="animate-fade-up max-w-[380px] rounded-2xl bg-black px-5 py-3 text-center text-xs font-bold text-white shadow-2xl">
        {message}
      </div>
    </div>
  )
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const toast = (m: string) => setMsg(m)
  const node = msg ? <Toast message={msg} onDone={() => setMsg(null)} /> : null
  return { toast, node }
}
