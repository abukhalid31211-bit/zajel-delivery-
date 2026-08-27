import { useMemo, useState } from 'react'
import { BarChart3, CalendarDays } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { useStore } from '../lib/StoreContext'
import { fmtIQD } from '../lib/data'

const periods = ['اليوم', 'الأسبوع', 'الشهر', 'مخصص'] as const

export default function Reports() {
  const { orders } = useStore()
  const [period, setPeriod] = useState<(typeof periods)[number]>('اليوم')
  const [custom, setCustom] = useState<{ from: string; to: string }>({ from: '', to: '' })

  const inRange = (iso: string): boolean => {
    const d = new Date(iso)
    const now = new Date()
    if (period === 'اليوم') return d.toDateString() === now.toDateString()
    if (period === 'الأسبوع') return now.getTime() - d.getTime() < 7 * 86400000
    if (period === 'الشهر') return now.getTime() - d.getTime() < 30 * 86400000
    if (period === 'مخصص') {
      if (!custom.from || !custom.to) return false
      const from = new Date(custom.from + 'T00:00:00')
      const to = new Date(custom.to + 'T23:59:59')
      return d >= from && d <= to
    }
    return true
  }

  const inOrders = useMemo(() => orders.filter((o) => inRange(o.createdAt)), [orders, period, custom.from, custom.to])

  const stats = useMemo(() => {
    const completed = inOrders.filter((o) => ['completed', 'delivered'].includes(o.status))
    const cancelled = inOrders.filter((o) => ['cancelled', 'returned'].includes(o.status))
    const totalValue = completed.reduce((s, o) => s + o.value, 0)
    const totalFees = completed.reduce((s, o) => s + o.fee, 0)
    return {
      total: inOrders.length,
      completed: completed.length,
      cancelled: cancelled.length,
      avg: completed.length ? Math.round(totalValue / completed.length) : 0,
      fees: totalFees,
    }
  }, [inOrders])

  /* رسم بياني: عدد الطلبات يومياً */
  const chart = useMemo(() => {
    const days = period === 'اليوم' ? 1 : period === 'الأسبوع' ? 7 : period === 'مخصص' ? daysBetween(custom) : 14
    const arr: { label: string; count: number; value: number }[] = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toDateString()
      const dayOrders = inOrders.filter((o) => new Date(o.createdAt).toDateString() === key)
      arr.push({
        label: d.toLocaleDateString('ar-IQ', { weekday: 'short' }),
        count: dayOrders.length,
        value: dayOrders.filter((o) => ['completed', 'delivered'].includes(o.status)).reduce((s, o) => s + o.value, 0),
      })
    }
    return arr
  }, [inOrders, period, custom])

  const maxCount = Math.max(1, ...chart.map((d) => d.count))

  /* الجدول التفصيلي المعتمد */
  const table = useMemo(() => {
    const rows: { date: string; total: number; completed: number; cancelled: number; value: number; fees: number }[] = []
    const days = period === 'اليوم' ? 1 : period === 'الأسبوع' ? 7 : period === 'مخصص' ? daysBetween(custom) : 14
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toDateString()
      const dayOrders = inOrders.filter((o) => new Date(o.createdAt).toDateString() === key)
      rows.push({
        date: d.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'short' }),
        total: dayOrders.length,
        completed: dayOrders.filter((o) => ['completed', 'delivered'].includes(o.status)).length,
        cancelled: dayOrders.filter((o) => ['cancelled', 'returned'].includes(o.status)).length,
        value: dayOrders.filter((o) => ['completed', 'delivered'].includes(o.status)).reduce((s, o) => s + o.value, 0),
        fees: dayOrders.filter((o) => ['completed', 'delivered'].includes(o.status)).reduce((s, o) => s + o.fee, 0),
      })
    }
    return rows.filter((r) => r.total > 0 || r.completed > 0 || r.cancelled > 0)
  }, [inOrders, period, custom])

  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-extrabold">تقارير محلك</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              period === p ? 'bg-gold text-white shadow shadow-gold/25' : 'border border-line bg-white text-mute'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {period === 'مخصص' && (
        <div className="card mt-3 flex items-center gap-2 p-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-gold" />
          <div className="flex flex-1 gap-2" dir="ltr">
            <input type="date" className="field py-2 text-xs" value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} />
            <span className="self-center text-[10px] font-bold text-faint">إلى</span>
            <input type="date" className="field py-2 text-xs" value={custom.to} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} />
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={BarChart3}
            title="لا توجد بيانات بعد"
            desc="بعد إنشاء أول طلباتك ستظهر هنا إحصائيات المبيعات وأجور التوصيل والرسم البياني اليومي."
          />
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['إجمالي الطلبات', String(stats.total)],
              ['المكتملة', String(stats.completed)],
              ['الملغاة', String(stats.cancelled)],
              ['متوسط قيمة الطلب', fmtIQD(stats.avg)],
            ].map(([l, v]) => (
              <div key={l} className="card p-4">
                <p className="text-[10px] font-bold text-mute">{l}</p>
                <p className="mt-1.5 text-lg font-extrabold text-gold-strong">{v}</p>
              </div>
            ))}
          </div>

          <div className="card mt-3 flex items-center justify-between p-4">
            <p className="text-xs font-extrabold">إجمالي أجور التوصيل المدفوعة</p>
            <p className="text-base font-extrabold text-gold-strong">{fmtIQD(stats.fees)}</p>
          </div>

          {/* الرسم البياني */}
          <div className="card mt-5 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold">
              <BarChart3 className="h-4 w-4 text-gold" /> عدد الطلبات يومياً
            </h2>
            <div className="flex h-40 items-end justify-between gap-1.5 border-b border-line px-1">
              {chart.map((d) => (
                <div key={d.label + d.count} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[9px] font-bold text-gold-deep">{d.count > 0 ? d.count : ''}</span>
                  <div
                    className={`w-full max-w-8 rounded-t-md transition-all ${d.count > 0 ? 'bg-gradient-to-t from-gold-strong to-gold' : 'bg-line/60'}`}
                    style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between px-1">
              {chart.map((d, i) => (
                <span key={i} className="flex-1 text-center text-[8.5px] text-faint">{d.label}</span>
              ))}
            </div>
          </div>

          {/* الجدول التفصيلي */}
          <div className="card mt-5 mb-6 overflow-hidden">
            <h2 className="px-4 pt-4 text-sm font-extrabold">جدول تفصيلي</h2>
            {table.length === 0 ? (
              <p className="p-6 text-center text-[11px] text-faint">لا توجد بيانات في هذه الفترة</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[520px] text-right text-[11px]">
                  <thead>
                    <tr className="border-y border-line bg-gold-faint text-[10px] text-gold-deep">
                      {['التاريخ', 'الطلبات', 'المكتملة', 'الملغاة', 'القيمة الإجمالية', 'الأجور'].map((h) => (
                        <th key={h} className="px-3 py-2.5 font-extrabold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((r) => (
                      <tr key={r.date} className="border-b border-line/60">
                        <td className="px-3 py-2.5 font-bold">{r.date}</td>
                        <td className="px-3 py-2.5">{r.total}</td>
                        <td className="px-3 py-2.5 text-success">{r.completed}</td>
                        <td className="px-3 py-2.5 text-danger">{r.cancelled}</td>
                        <td className="px-3 py-2.5 font-bold">{fmtIQD(r.value)}</td>
                        <td className="px-3 py-2.5 font-bold text-gold-strong">{fmtIQD(r.fees)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function daysBetween(range: { from: string; to: string }): number {
  if (!range.from || !range.to) return 14
  const from = new Date(range.from + 'T00:00:00')
  const to = new Date(range.to + 'T23:59:59')
  const diff = Math.ceil((to.getTime() - from.getTime()) / 86400000)
  return Math.min(Math.max(diff, 1), 60)
}
