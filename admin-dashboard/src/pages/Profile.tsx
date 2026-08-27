import { User, Camera, KeyRound } from 'lucide-react'
import PageHeader from '../components/PageHeader'

export default function Profile() {
  return (
    <div>
      <PageHeader title="الملف الشخصي" subtitle="إدارة بيانات حسابك الإداري" />
      <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-black text-white">
              <User className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <button className="absolute -bottom-1.5 -left-1.5 flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white shadow-sm hover:bg-page">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <p className="text-sm font-bold">مدير النظام</p>
            <p className="mt-1 text-[11px] text-mute">Super Admin</p>
          </div>
          <span className="badge bg-black text-white">صلاحيات كاملة</span>
        </div>

        <div className="card space-y-4 p-6 md:col-span-2">
          <h2 className="text-sm font-bold">تعديل البيانات</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الاسم</label>
              <input className="field" placeholder="اسم الأدمن" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف</label>
              <input className="field" placeholder="+964 7XX XXX XXXX" dir="ltr" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="btn-primary">حفظ التغييرات</button>
            <button className="btn-secondary">
              <KeyRound className="h-4 w-4" /> تغيير كلمة المرور
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
