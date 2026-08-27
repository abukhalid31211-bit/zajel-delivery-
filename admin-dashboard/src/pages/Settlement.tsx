import { useState } from 'react'
import { Wallet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../components/Toast'
import { useDbList, logAudit } from '../lib/store'
import OtherField, { OtherOption } from '../components/OtherOption'
import { isOther, otherName } from '../lib/customOption'
import { dbGet, dbSet } from '../lib/db'
import type { Captain, OrderItem } from '../lib/types'

type Row = { id: string; settled: boolean; amount: string; method: string; notes: string }

export default function Settlement() {
  const captains = useDbList<Captain>('captains').items.filter((c) => c.status === 'نشط')
  const allOrders = useDbList<OrderItem>('orders').items
  const dayOrders = allOrders.filter((o) => o.createdAt.slice(0, 10) === date && o.status === 'مكتمل')
  const sumFee = dayOrders.reduce((n, o) => n + Number(o.fee || 0), 0)
  const sumVal = dayOrders.reduce((n, o) => n + Number(o.value || 0), 0)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState<Row[]>(() => dbGet<Row[]>(`settle-${new Date().toISOString().slice(0, 10)}`, []))
  const [open, setOpen] = useState<Captain | null>(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('نقدًا')
  /* «أخرى»: طريقة تسوية يكتبها المدير يدوياً */
  const [otherMethod, setOtherMethod] = useState('')
  const [notes, setNotes] = useState('')
  const { toast, node } = useToast()

  const loadDate = (d: string) => {
    setDate(d)
    setRows(dbGet<Row[]>(`settle-${d}`, []))
  }

  const settled = rows.filter((r) => r.settled).length

  return (
    <div>
      <PageHeader
        title="التسوية المالية اليومية"
        subtitle="مطابقة وتسوية الحسابات النقدية (الكاش) للكباتن — تقرير محاسبي وليس محفظة إلكترونية"
        actions={<input type="date" className="field w-auto cursor-pointer" value={date} onChange={(e) => loadDate(e.target.value)} />}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          ['إجمالي ما دفعه الكباتن للمحلات', `${sumVal} د.ع`],
          ['إجمالي ما استلمه الكباتن من الزبائن', `${sumVal} د.ع`],
          ['إجمالي أجور التوصيل', `${sumFee} د.ع`],
          ['الكباتن المُسوَّون / الإجمالي', `${settled} / ${captains.length}`],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-[11px] font-medium text-mute">{l}</p>
            <p className="mt-1.5 text-xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={['الكابتن', 'عدد الطلبات', 'دفع للمحلات', 'استلم من الزبائن', 'صافي الأجرة', 'حالة التسوية', 'الإجراءات']}
        rows={captains.map((c) => {
          const row = rows.find((r) => r.id === c.id)
          const mine = dayOrders.filter((o) => o.captainId === c.id)
          const fee = mine.reduce((n, o) => n + Number(o.fee || 0), 0)
          const val = mine.reduce((n, o) => n + Number(o.value || 0), 0)
          return {
            key: c.id,
            cells: [
              c.name,
              String(mine.length),
              `${val} د.ع`,
              `${val} د.ع`,
              `${fee} د.ع`,
              <StatusBadge status={row?.settled ? 'مُسوَّى' : 'لم تُسوَّ'} />,
              row?.settled ? '—' : (
                <button className="btn-primary px-3 py-1 text-[10px]" onClick={() => { setOpen(c); setAmount(''); setNotes(''); setMethod('نقدًا'); setOtherMethod('') }}>تسوية</button>
              ),
            ],
          }
        })}
        emptyIcon={Wallet}
        emptyTitle="لا توجد حسابات بانتظار التسوية اليوم"
        emptyHint="ستظهر هنا حسابات الكباتن اليومية مع حالتها (⏳ لم تُسوَّ / ✅ مُسوَّى) لإجراء التسوية النقدية اليدوية."
      />

      {open && (
        <Modal title={`تسوية حساب ${open.name}`} onClose={() => setOpen(null)}>
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-xl bg-page p-3">
              <p>عدد الطلبات: {dayOrders.filter((o) => o.captainId === open.id).length}</p>
              <p>دفع للمحلات: {dayOrders.filter((o) => o.captainId === open.id).reduce((n, o) => n + Number(o.value || 0), 0)} د.ع</p>
              <p>استلم من الزبائن: {dayOrders.filter((o) => o.captainId === open.id).reduce((n, o) => n + Number(o.value || 0), 0)} د.ع</p>
              <p>صافي الأجرة: {dayOrders.filter((o) => o.captainId === open.id).reduce((n, o) => n + Number(o.fee || 0), 0)} د.ع</p>
            </div>
            <div>
              <label className="mb-1.5 block font-semibold">المبلغ الفعلي المُسلَّم</label>
              <input className="field" inputMode="numeric" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} />
            </div>
            <div>
              <label className="mb-1.5 block font-semibold">طريقة التسوية</label>
              <select className="field cursor-pointer" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option>نقدًا</option>
                <option>تحويل بنكي</option>
                <OtherOption label="➕ أخرى — طريقة تسوية أخرى" />
              </select>
              {isOther(method) && (
                <OtherField
                  label="طريقة التسوية"
                  placeholder="مثال: cheque / حوالة خارجية"
                  value={otherMethod}
                  onChange={setOtherMethod}
                  hint="تُحفظ مع سجل التسوية كما كتبتها."
                />
              )}
            </div>
            <textarea className="field min-h-16 resize-none" placeholder="ملاحظات (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                const resolvedMethod = isOther(method) ? otherName(otherMethod) : method
                if (isOther(method) && !resolvedMethod) {
                  toast('اكتب طريقة التسوية')
                  return
                }
                const next = [...rows.filter((r) => r.id !== open.id), { id: open.id, settled: true, amount, method: resolvedMethod, notes }]
                setRows(next)
                dbSet(`settle-${date}`, next)
                logAudit({ action: 'أخرى', entity: open.name, details: `تسوية ${method}`, oldValue: 'لم تُسوَّ', newValue: 'مُسوَّى' })
                setOpen(null)
                toast(`تمت تسوية حساب الكابتن ${open.name}`)
              }}
            >
              تأكيد التسوية
            </button>
            <button className="btn-ghost flex-1" onClick={() => setOpen(null)}>إلغاء</button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
