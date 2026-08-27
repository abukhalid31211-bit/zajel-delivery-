import { useState } from 'react'
import { Download, Info, ReceiptText } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

const periods = ['اليوم', 'هذا الأسبوع', 'هذا الشهر', 'مخصص']
const fmt = ['PDF', 'صورة', 'مشاركة']

export default function Ledger() {
  const { state, money, fmtDate } = useCaptain()
  const { toast, node } = useToast()
  const [period, setPeriod] = useState(0)
  const [tab, setTab] = useState(0)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportPeriod, setExportPeriod] = useState(0)
  const [exportFormat, setExportFormat] = useState(0)

  const totalPaid = state.ledger.reduce((a, l) => a + l.paidToShop, 0)
  const totalCollected = state.ledger.reduce((a, l) => a + l.collectedFromCustomer, 0)
  const totalRefunds = state.ledger.reduce((a, l) => a + l.refund, 0)
  const totalFees = state.ledger.reduce((a, l) => a + l.deliveryFee, 0)
  const totalOrders = state.ledger.filter((l) => l.type === 'delivered').length
  const canceled = state.ledger.filter((l) => l.type === 'canceled')

  const rows = tab === 0 ? state.ledger : canceled

  const runExport = () => {
    if (exportFormat === 2 && navigator.share) {
      navigator.share({
        title: 'كشف حساب زاجل كابتن',
        text: `كشف حساب زاجل كابتن\nالطلبات: ${totalOrders}\nدفعت للمحلات: ${money(totalPaid)}\nاستلمت من الزبائن: ${money(totalCollected)}\nأرباحك: ${money(totalFees)}`,
      }).catch(() => undefined)
    } else if (exportFormat === 0) {
      window.print()
      toast('تم فتح نافذة الطباعة — اختر حفظ كـ PDF ✅')
    } else {
      try {
        const blob = new Blob(
          [`كشف حساب زاجل كابتن\nالطلبات: ${totalOrders}\nدفعت للمحلات: ${money(totalPaid)}\nاستلمت من الزبائن: ${money(totalCollected)}\nأرباحك: ${money(totalFees)}`],
          { type: 'text/plain;charset=utf-8' },
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'zajel-captain-ledger.txt'
        a.click()
        URL.revokeObjectURL(url)
        toast('تم تصدير الكشف كصورة نصية ✅')
      } catch {
        toast('تعذر التصدير. حاول المشاركة من زر الطباعة.')
      }
    }
    setExportOpen(false)
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">كشف الحساب</h1>
        <button onClick={() => setExportOpen(true)} className="flex items-center gap-1.5 rounded-xl border border-gold bg-white px-3 py-2 text-[11px] font-bold text-gold-dark">
          <Download className="h-3.5 w-3.5" /> تصدير الكشف
        </button>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-dashed border-gold bg-white p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
        <p className="text-[11px] leading-relaxed text-mute">تنبيه: هذا تقرير محاسبي نقدي (كاش) لضبط الحسابات وليس محفظة إلكترونية.</p>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {periods.map((p, i) => (
          <button key={p} onClick={() => setPeriod(i)} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${period === i ? 'bg-gold text-white' : 'border border-line bg-white text-mute'}`}>{p}</button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          ['عدد الطلبات المكتملة', String(totalOrders)],
          ['ما دفعته للمحلات', money(totalPaid)],
          ['ما استلمته من الزبائن', money(totalCollected)],
          ['صافي أجور التوصيل (أرباحك)', money(totalFees)],
          ['المبالغ المستردة من المحلات', money(totalRefunds)],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-[10px] font-medium leading-relaxed text-mute">{l}</p>
            <p className="mt-1.5 text-lg font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="card mt-3 flex items-center justify-between p-4">
        <p className="text-xs font-bold">حالة التسوية اليومية مع الإدارة</p>
        <span className="badge bg-gold-light text-gold-dark">⏳ لم تُسوَّ</span>
      </div>

      <div className="mt-5 flex gap-2">
        {['الحركات', 'الطلبات الملغاة'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${tab === i ? 'bg-gold text-white' : 'border border-line bg-white text-mute'}`}>{t}</button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card mt-4 mb-6 flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-gold bg-page">
            <ReceiptText className="h-6 w-6 text-faint" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-bold">{tab === 0 ? 'لا توجد حركات مالية في هذه الفترة' : 'لا توجد طلبات ملغاة'}</p>
          <p className="max-w-64 text-[11px] leading-relaxed text-mute">
            {tab === 0 ? 'كل طلبية تسلّمها ستظهر هنا: ما دفعته للمحل، ما حصّلته من الزبون، وأجرتك الصافية.' : 'تظهر هنا الطلبات الملغاة مع المرحلة والسبب والمبالغ المستردة من المحلات.'}
          </p>
        </div>
      ) : (
        <div className="card mt-4 mb-6 divide-y divide-line">
          <div className="flex items-center justify-between px-4 py-3 text-[10px] font-bold text-mute">
            <span className="flex-1">الطلب</span>
            <span className="w-16 text-center">دفعت</span>
            <span className="w-16 text-center">حصّلت</span>
            <span className="w-14 text-center">أجرة</span>
          </div>
          {rows.map((l) => (
            <div key={l.id} className="flex items-center justify-between px-4 py-3 text-[11px]">
              <span className="flex-1 font-bold text-gold-dark">{l.orderId.slice(-5).toUpperCase()} · {l.shopName}<br /><span className="text-[9px] font-normal text-mute">{fmtDate(l.at)}</span></span>
              <span className="w-16 text-center">{money(l.paidToShop)}</span>
              <span className="w-16 text-center">{money(l.collectedFromCustomer)}</span>
              <span className="w-14 text-center font-bold">{money(l.deliveryFee)}</span>
            </div>
          ))}
        </div>
      )}

      {exportOpen && (
        <Modal title="تصدير كشف الحساب" onClose={() => setExportOpen(false)}>
          <div className="mt-3 space-y-4">
            <div>
              <p className="mb-2 text-xs font-bold">الفترة</p>
              <div className="flex gap-2">
                {periods.map((p, i) => (
                  <button key={p} onClick={() => setExportPeriod(i)} className={`flex-1 rounded-xl px-2 py-2 text-[11px] font-bold ${exportPeriod === i ? 'bg-gold text-white' : 'border border-line bg-white text-mute'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold">الصيغة</p>
              <div className="flex gap-2">
                {fmt.map((f, i) => (
                  <button key={f} onClick={() => setExportFormat(i)} className={`flex-1 rounded-xl px-2 py-2 text-[11px] font-bold ${exportFormat === i ? 'bg-gold text-white' : 'border border-line bg-white text-mute'}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button className="btn-primary flex-1" onClick={runExport}>تصدير</button>
              <button className="btn-secondary flex-1" onClick={() => setExportOpen(false)}>إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
