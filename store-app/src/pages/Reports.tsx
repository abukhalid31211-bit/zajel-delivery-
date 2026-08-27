import { useState } from 'react'
import { BarChart3 } from 'lucide-react'

const periods = ['اليوم', 'الأسبوع', 'الشهر', 'مخصص']
const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export default function Reports() {
  const [period, setPeriod] = useState(0)
  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-bold">تقارير محلك</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {periods.map((p, i) => (
          <button
            key={p}
            onClick={() => setPeriod(i)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              period === i ? 'bg-black text-white' : 'border border-line bg-white text-mute'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          ['إجمالي الطلبات', '0'],
          ['المكتملة', '0'],
          ['الملغاة', '0'],
          ['متوسط قيمة الطلب', '0 د.ع'],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-[10px] font-medium text-mute">{l}</p>
            <p className="mt-1.5 text-lg font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="card mt-3 flex items-center justify-between p-4">
        <p className="text-xs font-bold">إجمالي أجور التوصيل المدفوعة</p>
        <p className="text-base font-bold">0 د.ع</p>
      </div>

      <div className="card mt-5 mb-6 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <BarChart3 className="h-4 w-4" /> عدد الطلبات يومياً
        </h2>
        <div className="flex h-40 items-end justify-between gap-2 border-b border-line px-1">
          {days.map((d) => (
            <div key={d} className="flex flex-1 flex-col items-center">
              <div className="w-full max-w-8 rounded-t-md bg-page" style={{ height: 4 }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between px-1">
          {days.map((d) => (
            <span key={d} className="flex-1 text-center text-[8.5px] text-faint">{d}</span>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-faint">لا توجد بيانات لعرضها خلال هذه الفترة</p>
      </div>
    </div>
  )
}
