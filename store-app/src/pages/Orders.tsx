import { useState } from 'react'
import { Search, PackageSearch } from 'lucide-react'

const tabs = ['الكل', 'نشطة', 'مكتملة', 'ملغاة']

export default function Orders() {
  const [tab, setTab] = useState(0)
  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-bold">سجل الطلبات</h1>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input className="field pr-10" placeholder="ابحث برقم الطلب أو اسم الزبون أو الهاتف" />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card mt-5 flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-line bg-page">
          <PackageSearch className="h-6 w-6 text-faint" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-bold">لا توجد طلبات مطابقة</p>
        <p className="max-w-64 text-[11px] leading-relaxed text-mute">
          سيظهر هنا سجل كامل بجميع طلبياتك مع الحالة والكابتن والقيمة والأجرة وتاريخ كل طلب.
        </p>
      </div>
    </div>
  )
}
