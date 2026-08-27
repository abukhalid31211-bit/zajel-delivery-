import { useEffect, useState } from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-black px-4 py-2 text-[11px] font-semibold text-white">
      <WifiOff className="h-3.5 w-3.5" />
      فقد الاتصال بالسيرفر. تحقق من اتصال الإنترنت
      <button type="button" className="inline-flex items-center gap-1 underline" onClick={() => window.location.reload()}>
        <RefreshCw className="h-3 w-3" /> إعادة المحاولة
      </button>
    </div>
  )
}
