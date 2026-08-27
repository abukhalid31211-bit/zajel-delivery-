import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from './Modal'

export default function ExportDialog({
  summary,
  onClose,
  onDone,
}: {
  summary: string
  onClose: () => void
  onDone: (msg: string) => void
}) {
  const [fmt, setFmt] = useState('Excel (.xlsx)')
  const [charts, setCharts] = useState(true)
  const [details, setDetails] = useState(true)
  const [loading, setLoading] = useState(false)

  return (
    <Modal title="تصدير التقرير" onClose={onClose}>
      <p className="mt-2 text-[11px] leading-relaxed text-mute">ملخص الفلاتر: {summary}</p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold">الصيغة</label>
          <select className="field cursor-pointer" value={fmt} onChange={(e) => setFmt(e.target.value)}>
            <option>Excel (.xlsx)</option>
            <option>PDF</option>
            <option>CSV</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium">
          <input type="checkbox" className="h-4 w-4 accent-black" checked={charts} onChange={(e) => setCharts(e.target.checked)} />
          تضمين الرسوم البيانية (لـ PDF)
        </label>
        <label className="flex items-center gap-2 text-xs font-medium">
          <input type="checkbox" className="h-4 w-4 accent-black" checked={details} onChange={(e) => setDetails(e.target.checked)} />
          تضمين البيانات التفصيلية (لـ Excel)
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className="btn-primary flex-1"
          disabled={loading}
          onClick={() => {
            setLoading(true)
            window.setTimeout(() => {
              setLoading(false)
              onClose()
              onDone('لا توجد بيانات للتصدير في الفترة المحددة')
            }, 900)
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> جاري إنشاء التقرير...
            </>
          ) : (
            'تصدير'
          )}
        </button>
        <button className="btn-ghost flex-1" onClick={onClose}>
          إلغاء
        </button>
      </div>
    </Modal>
  )
}
