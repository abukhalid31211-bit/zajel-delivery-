import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

/** شريط وضع عدم الاتصال — يعتمد على حالة الشبكة الحقيقية للمتصفح */
export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  const [justBack, setJustBack] = useState(false)

  useEffect(() => {
    const on = () => {
      setOnline(true)
      setJustBack(true)
      setTimeout(() => setJustBack(false), 3000)
    }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online && !justBack) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex justify-center">
      <div
        className={`mx-auto flex w-full max-w-[430px] items-center justify-center gap-2 px-4 py-2 text-[11px] font-bold ${
          online ? 'bg-black text-white' : 'border-b border-dashed border-black bg-white text-black'
        }`}
      >
        {online ? (
          <>
            <Wifi className="h-3.5 w-3.5" /> ✅ عاد الاتصال. جاري مزامنة البيانات...
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5" /> ⚠️ وضع عدم الاتصال. يمكنك إكمال التوصيل الحالي فقط.
          </>
        )}
      </div>
    </div>
  )
}
