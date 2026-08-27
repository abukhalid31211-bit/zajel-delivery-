import { useState } from 'react'
import { Download, Info, ReceiptText } from 'lucide-react'

const periods = ['اليوم', 'هذا الأسبوع', 'هذا الشهر', 'مخصص']
const tabs = ['الحركات', 'الطلبات الملغاة']

export default function Ledger() {
  const [period, setPeriod] = useState(0)
  const [tab, setTab] = useState(0)
  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">كشف الحساب</h1>
        <button className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-[11px] font-bold">
          <Download className="h-3.5 w-3.5" /> تصدير الكشف
        </button>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-dashed border-line bg-white p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
        <p className="text-[11px] leading-relaxed text-mute">
          تنبيه: هذا تقرير محاسبي نقدي (كاش) لضبط الحسابات وليس محفظة إلكترونية.
        </p>
      </div>

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
          ['عدد الطلبات', '0'],
          ['ما دفعته للمحلات', '0 د.ع'],
          ['ما استلمته من الزبائن', '0 د.ع'],
          ['صافي أجور التوصيل (أرباحك)', '0 د.ع'],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-[10px] font-medium leading-relaxed text-mute">{l}</p>
            <p className="mt-1.5 text-lg font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="card mt-3 flex items-center justify-between p-4">
        <p className="text-xs font-bold">حالة التسوية اليومية مع الإدارة</p>
        <span className="badge bg-faint text-white">⏳ لم تُسوَّ</span>
      </div>

      <div className="mt-5 flex gap-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card mt-4 mb-6 flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-line bg-page">
          <ReceiptText className="h-6 w-6 text-faint" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-bold">{tab === 0 ? 'لا توجد حركات مالية في هذه الفترة' : 'لا توجد طلبات ملغاة'}</p>
        <p className="max-w-64 text-[11px] leading-relaxed text-mute">
          {tab === 0
            ? 'كل طلبية تسلّمها ستظهر هنا: ما دفعته للمحل، ما حصّلته من الزبون، وأجرتك الصافية.'
            : 'تظهر هنا الطلبات الملغاة مع المرحلة والسبب والمبالغ المستردة من المحلات.'}
        </p>
      </div>
    </div>
  )
}
