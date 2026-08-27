import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page p-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-dashed border-black bg-white">
        <Lock className="h-9 w-9" strokeWidth={1.5} />
      </span>
      <h1 className="mt-5 text-2xl font-bold">غير مصرح لك 🔒</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-mute">
        لا تملك صلاحية الوصول لهذه الصفحة. تواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.
      </p>
      <button className="btn-primary mt-6" onClick={() => navigate('/')}>
        العودة للرئيسية
      </button>
    </div>
  )
}
