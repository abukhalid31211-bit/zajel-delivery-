import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Modal from '../components/Modal'
import RichEditor from '../components/RichEditor'
import { useToast } from '../components/Toast'
import { useDbList } from '../lib/store'
import { nowIso, uid } from '../lib/db'
import { notifyCms } from '../lib/i18n'
import type { CmsPage, CmsText } from '../lib/types'
import { ALL_SCREENS } from '../lib/cmsCatalog'

export default function CmsEditor() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const screenId = params.get('screenId')
  const screenName = params.get('screen')
  const navigate = useNavigate()
  const pages = useDbList<CmsPage>('cmsPages')
  const texts = useDbList<CmsText>('cmsTexts')
  const catalog = ALL_SCREENS.find((s) => s.id === screenId)
  const page = pages.items.find((p) => p.id === id)
  const [title, setTitle] = useState(page?.title || catalog?.name || screenName || '')
  const [subtitle, setSubtitle] = useState(page?.subtitle || catalog?.group || '')
  const [content, setContent] = useState(page?.content || '')
  const [btn, setBtn] = useState(catalog?.fields[0]?.ar || 'متابعة')
  const [device, setDevice] = useState<'m' | 'd'>('m')
  const [confirm, setConfirm] = useState<'pub' | 'draft' | null>(null)
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {}
    catalog?.fields.forEach((f) => {
      o[f.key] = texts.items.find((t) => t.key === f.key)?.ar || f.ar
    })
    return o
  })
  const { toast, node } = useToast()

  const previewTitle = catalog ? vals[catalog.fields[0]?.key] || catalog.name : title
  const previewSub = catalog ? vals[catalog.fields[1]?.key] || '' : subtitle
  const previewBtn = catalog ? (catalog.fields.find((f) => f.key.startsWith('btn_')) ? vals[catalog.fields.find((f) => f.key.startsWith('btn_'))!.key] : btn) : btn

  const preview = useMemo(
    () => (
      <div className={`mx-auto overflow-hidden rounded-[28px] border border-line bg-white shadow-lg ${device === 'm' ? 'w-[280px] min-h-[520px]' : 'w-full min-h-[360px]'}`}>
        <div className="bg-black px-4 py-3 text-center text-[10px] text-white">{catalog?.app || 'زاجل ديلفري'}</div>
        <div className="p-5">
          <p className="text-[10px] font-semibold text-mute">{catalog?.name || 'صفحة'}</p>
          <h2 className="mt-2 text-base font-bold">{previewTitle}</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-mute">{previewSub}</p>
          <div className="mt-4 space-y-1.5">
            {(catalog?.fields || []).slice(0, 8).map((f) => (
              <p key={f.key} className="rounded-lg bg-page px-2 py-1.5 text-[10px]">{vals[f.key] || f.ar}</p>
            ))}
          </div>
          <button className="btn-primary mt-6 w-full text-xs">{previewBtn}</button>
        </div>
      </div>
    ),
    [device, catalog, previewTitle, previewSub, previewBtn, vals],
  )

  const persistPage = (status: CmsPage['status']) => {
    if (page) {
      pages.setItems((p) => p.map((x) => (x.id === page.id ? { ...x, title, subtitle, content, status, updatedAt: nowIso() } : x)))
    } else if (!catalog) {
      pages.setItems((p) => [...p, { id: uid(), name: title || 'صفحة', place: 'مشترك', status, title, subtitle, content, updatedAt: nowIso() }])
    }
  }

  const saveScreen = () => {
    if (!catalog) return
    let next = [...texts.items]
    catalog.fields.forEach((f) => {
      const ar = vals[f.key] ?? f.ar
      const i = next.findIndex((t) => t.key === f.key)
      if (i >= 0) next[i] = { ...next[i], ar }
      else next.push({ id: uid(), key: f.key, ar, en: '', ku: '', place: `${catalog.app} — ${catalog.name}` })
    })
    texts.setItems(next)
    notifyCms()
    toast('تم حفظ نصوص الشاشة')
    navigate(`/cms?tab=${catalog.app === 'الكابتن' ? 'c-screens' : 's-screens'}`)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/cms" className="text-[11px] text-faint hover:text-black">← رجوع لإدارة المحتوى</Link>
          <h1 className="mt-1 text-xl font-bold">تعديل: {catalog?.name || page?.name || screenName || 'صفحة'}</h1>
          {catalog && <p className="mt-1 text-[11px] text-mute">{catalog.app} · {catalog.group} · {catalog.fields.length} حقل</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {catalog ? (
            <button className="btn-primary" onClick={saveScreen}>حفظ ونشر النصوص</button>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => setConfirm('draft')}>حفظ كمسودة</button>
              <button className="btn-primary" onClick={() => setConfirm('pub')}>نشر</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="card space-y-4 p-5">
          {catalog ? (
            catalog.fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1.5 block text-[11px] font-semibold">{f.label} <span className="font-mono font-normal text-faint">({f.key})</span></label>
                <textarea className="field min-h-16 resize-y" value={vals[f.key] ?? f.ar} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
              </div>
            ))
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">العنوان الرئيسي</label>
                <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">العنوان الفرعي</label>
                <input className="field" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">المحتوى</label>
                <RichEditor value={content} onChange={setContent} minH="min-h-48" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">نص الزر</label>
                <input className="field" value={btn} onChange={(e) => setBtn(e.target.value)} />
              </div>
            </>
          )}
        </div>
        <div className="card p-5">
          <div className="mb-4 flex gap-2">
            <button className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold ${device === 'm' ? 'bg-black text-white' : 'border border-line'}`} onClick={() => setDevice('m')}>📱 موبايل</button>
            <button className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold ${device === 'd' ? 'bg-black text-white' : 'border border-line'}`} onClick={() => setDevice('d')}>💻 كمبيوتر</button>
          </div>
          {preview}
        </div>
      </div>

      {confirm && (
        <Modal title={confirm === 'pub' ? 'نشر التغييرات؟' : 'حفظ كمسودة'} onClose={() => setConfirm(null)}>
          <p className="mt-2 text-xs text-mute">{confirm === 'pub' ? 'ستظهر فوراً لجميع المستخدمين.' : 'لن تظهر حتى النشر.'}</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => {
              persistPage(confirm === 'pub' ? 'منشورة' : 'مسودة')
              setConfirm(null)
              toast(confirm === 'pub' ? 'تم نشر الصفحة بنجاح' : 'تم حفظ المسودة')
              navigate('/cms?tab=pages')
            }}>تأكيد</button>
            <button className="btn-ghost flex-1" onClick={() => setConfirm(null)}>إلغاء</button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
