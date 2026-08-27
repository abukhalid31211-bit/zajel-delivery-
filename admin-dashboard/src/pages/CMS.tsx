import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FileText, Type, Palette, ImageIcon, BellRing, MessageCircle, Scale,
  HelpCircle, Megaphone, Bike, Store, List, MessageSquare, SmartphoneNfc,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import Toggle from '../components/Toggle'
import RichEditor from '../components/RichEditor'
import { useToast } from '../components/Toast'
import { notifyCms } from '../lib/i18n'
import { useDbList, logAudit } from '../lib/store'
import { uid, nowIso } from '../lib/db'
import { applyTheme, defaultTheme, getBrand, getTheme, saveBrand, type Brand, type ThemeColors } from '../lib/settings'
import type { CmsAuto, CmsBanner, CmsFaq, CmsLegal, CmsPage, CmsTemplate, CmsText } from '../lib/types'
import {
  CAPTAIN_SCREENS, STORE_SCREENS, CAPTAIN_COPY, STORE_COPY,
  CATALOG_TEMPLATES, CATALOG_AUTO, CATALOG_SMS, CATALOG_OPTIONS, CATALOG_FAQ, CATALOG_LEGAL,
  type CatalogCopy, type CatalogOption, type CatalogScreen,
} from '../lib/cmsCatalog'

const sections = [
  { key: 'c-screens', label: 'شاشات الكابتن', icon: Bike },
  { key: 's-screens', label: 'شاشات المحل', icon: Store },
  { key: 'c-copy', label: 'قاموس الكابتن', icon: Type },
  { key: 's-copy', label: 'قاموس المحل', icon: Type },
  { key: 'options', label: 'قوائم الخيارات', icon: List },
  { key: 'templates', label: 'قوالب الإشعارات', icon: BellRing },
  { key: 'auto', label: 'الرسائل التلقائية', icon: MessageCircle },
  { key: 'sms', label: 'رسائل SMS', icon: SmartphoneNfc },
  { key: 'legal', label: 'النصوص القانونية', icon: Scale },
  { key: 'faq', label: 'أسئلة شائعة', icon: HelpCircle },
  { key: 'banners', label: 'البانرات', icon: Megaphone },
  { key: 'theme', label: 'الألوان والثيم', icon: Palette },
  { key: 'brand', label: 'الشعار والهوية', icon: ImageIcon },
  { key: 'pages', label: 'صفحات حرة', icon: FileText },
]

function upsertText(list: CmsText[], key: string, ar: string, place: string): CmsText[] {
  const i = list.findIndex((t) => t.key === key)
  if (i >= 0) {
    const next = [...list]
    next[i] = { ...next[i], ar }
    return next
  }
  return [...list, { id: uid(), key, ar, en: '', ku: '', place }]
}

function ScreenGrid({ screens, onOpen }: { screens: CatalogScreen[]; onOpen: (s: CatalogScreen) => void }) {
  const groups = [...new Set(screens.map((s) => s.group))]
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g}>
          <h2 className="mb-3 text-sm font-bold">{g}</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {screens.filter((s) => s.group === g).map((s) => (
              <button key={s.id} type="button" className="rounded-xl border border-line px-4 py-3 text-right hover:bg-page" onClick={() => onOpen(s)}>
                <p className="text-xs font-bold">{s.name}</p>
                <p className="mt-1 text-[10px] text-mute">{s.fields.length} نص قابل للتحرير</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CopyTable({
  catalog, stored, onSave, q,
}: {
  catalog: CatalogCopy[]
  stored: CmsText[]
  onSave: (key: string, ar: string, place: string) => void
  q: string
}) {
  const [edit, setEdit] = useState<string | null>(null)
  const [val, setVal] = useState('')
  const rows = useMemo(() => {
    const qq = q.trim()
    return catalog.filter((c) => !qq || `${c.key} ${c.ar} ${c.place}`.includes(qq))
  }, [catalog, q])
  return (
    <DataTable
      columns={['المفتاح', 'النص الحالي', 'المكان', 'الإجراءات']}
      rows={rows.map((c) => {
        const hit = stored.find((t) => t.key === c.key)
        const ar = hit?.ar || c.ar
        return {
          key: c.key,
          cells: [
            <span className="font-mono text-[10px]">{c.key}</span>,
            edit === c.key ? (
              <span className="flex items-center gap-1">
                <input className="field min-w-48 py-1" value={val} onChange={(e) => setVal(e.target.value)} />
                <button className="btn-primary px-2 py-1 text-[10px]" onClick={() => { onSave(c.key, val, c.place); setEdit(null) }}>✅</button>
              </span>
            ) : ar,
            c.place,
            <button className="btn-ghost px-2 py-1" onClick={() => { setEdit(c.key); setVal(ar) }}>✏️</button>,
          ],
        }
      })}
      emptyIcon={Type}
      emptyTitle="لا توجد نصوص"
    />
  )
}

export default function CMS() {
  const [params, setParams] = useSearchParams()
  const tabKey = params.get('tab') || 'c-screens'
  const navigate = useNavigate()
  const pages = useDbList<CmsPage>('cmsPages')
  const texts = useDbList<CmsText>('cmsTexts')
  const templates = useDbList<CmsTemplate>('cmsTemplates')
  const autos = useDbList<CmsAuto>('cmsAuto')
  const faqs = useDbList<CmsFaq>('cmsFaqs')
  const banners = useDbList<CmsBanner>('cmsBanners')
  const legal = useDbList<CmsLegal>('cmsLegal')
  const options = useDbList<CatalogOption>('cmsOptions')
  const sms = useDbList<CmsText>('cmsSms')
  const [theme, setTheme] = useState<ThemeColors>(() => getTheme())
  const [brand, setBrand] = useState<Brand>(() => getBrand())
  const [q, setQ] = useState('')
  const [modal, setModal] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const { toast, node } = useToast()

  const saveCopy = (key: string, ar: string, place: string) => {
    texts.setItems((p) => upsertText(p, key, ar, place))
    notifyCms()
    toast('تم تحديث النص')
  }

  const seedTemplates = () => {
    if (templates.items.length) return toast('القوالب موجودة — لن تُستبدل')
    templates.setItems(CATALOG_TEMPLATES.map((t) => ({ id: uid(), ...t })))
    toast('تم تحميل قوالب الإشعارات من وثائق التطبيقات')
  }
  const seedAuto = () => {
    if (autos.items.length) return toast('الرسائل موجودة — لن تُستبدل')
    autos.setItems(CATALOG_AUTO.map((t) => ({ id: uid(), ...t })))
    toast('تم تحميل الرسائل التلقائية')
  }
  const seedFaq = () => {
    if (faqs.items.length) return toast('الأسئلة موجودة — لن تُستبدل')
    faqs.setItems(CATALOG_FAQ.map((f, i) => ({ id: uid(), q: f.q, a: f.a, order: String(i + 1), app: f.app })))
    toast('تم تحميل الأسئلة')
  }
  const seedLegal = () => {
    if (legal.items.length) return
    legal.setItems(CATALOG_LEGAL.map((t) => ({ id: uid(), title: t.title, body: t.body, enabled: true })))
  }
  const seedOptions = () => {
    if (options.items.length) return toast('القوائم موجودة — لن تُستبدل')
    options.setItems(CATALOG_OPTIONS)
    toast('تم تحميل قوائم الخيارات من الوثائق')
  }
  const seedSms = () => {
    if (sms.items.length) return toast('قوالب SMS موجودة')
    sms.setItems(CATALOG_SMS.map((s) => ({ id: uid(), key: s.key, ar: s.ar, en: '', ku: '', place: s.place })))
    toast('تم تحميل قوالب SMS')
  }

  const optGroups = [...new Set((options.items.length ? options.items : CATALOG_OPTIONS).map((o) => o.group))]
  const optList = options.items.length ? options.items : CATALOG_OPTIONS

  const colorGroups = [
    { title: 'الألوان الأساسية', keys: [['primary', 'اللون الأساسي'], ['secondary', 'اللون الثانوي'], ['page', 'لون الخلفية'], ['text', 'لون النصوص'], ['line', 'لون الحدود']] as const },
    { title: 'ألوان الحالات', keys: [['success', 'لون النجاح'], ['warn', 'لون التحذير'], ['error', 'لون الخطأ'], ['info', 'لون المعلومات']] as const },
    { title: 'ألوان الأزرار', keys: [['btn', 'لون الزر الرئيسي'], ['btnText', 'لون نص الزر'], ['btn2', 'لون الزر الثانوي'], ['btn2Border', 'حدود الزر الثانوي']] as const },
  ]

  return (
    <div>
      <PageHeader
        title="إدارة المحتوى (CMS)"
        subtitle="كل شاشة ونص وقالب وإشعار من وثيقتي الكابتن والمحل — قابل للتحرير من هنا بدون مبرمج"
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => { setParams({ tab: s.key }); setQ('') }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-semibold ${
              tabKey === s.key ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            <s.icon className="h-3.5 w-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {tabKey === 'c-screens' && <ScreenGrid screens={CAPTAIN_SCREENS} onOpen={(s) => navigate(`/cms/editor?screenId=${s.id}`)} />}
      {tabKey === 's-screens' && <ScreenGrid screens={STORE_SCREENS} onOpen={(s) => navigate(`/cms/editor?screenId=${s.id}`)} />}

      {(tabKey === 'c-copy' || tabKey === 's-copy') && (
        <>
          <input className="field mb-4 max-w-md" placeholder="ابحث في المفاتيح والنصوص..." value={q} onChange={(e) => setQ(e.target.value)} />
          <CopyTable
            catalog={tabKey === 'c-copy' ? CAPTAIN_COPY : STORE_COPY}
            stored={texts.items}
            onSave={saveCopy}
            q={q}
          />
        </>
      )}

      {tabKey === 'options' && (
        <>
          <div className="mb-4"><button className="btn-primary" onClick={seedOptions}>تحميل القوائم الرسمية من الوثائق</button></div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {optGroups.map((g) => (
              <div key={g} className="card p-5">
                <h2 className="mb-3 text-sm font-bold">{g}</h2>
                <div className="space-y-2">
                  {optList.filter((o) => o.group === g).map((o) => (
                    <div key={o.id} className="flex gap-2">
                      <input
                        className="field"
                        value={o.label}
                        onChange={(e) => {
                          const base = options.items.length ? options.items : CATALOG_OPTIONS
                          options.setItems(base.map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x)))
                        }}
                      />
                      <button className="btn-ghost" onClick={() => {
                        const base = options.items.length ? options.items : CATALOG_OPTIONS
                        options.setItems(base.filter((x) => x.id !== o.id))
                      }}>🗑️</button>
                    </div>
                  ))}
                  <button className="btn-secondary text-xs" onClick={() => {
                    const base = options.items.length ? options.items : CATALOG_OPTIONS
                    options.setItems([...base, { id: uid(), group: g, app: 'الكل', label: 'خيار جديد' }])
                  }}>+ إضافة خيار</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tabKey === 'templates' && (
        <>
          <div className="mb-4 flex gap-2">
            <button className="btn-primary" onClick={seedTemplates}>تحميل قوالب الوثائق</button>
            <button className="btn-ghost" onClick={() => { setForm({ event: '', to: 'الكابتن', channel: 'Push', title: '', body: '' }); setModal('tpl') }}>+ قالب</button>
          </div>
          <DataTable
            columns={['الحدث', 'المرسل إليه', 'القناة', 'العنوان', 'المحتوى', '']}
            rows={templates.items.map((t) => ({
              key: t.id,
              cells: [t.event, t.to, t.channel, t.title, t.body, <button className="btn-ghost px-2 py-1" onClick={() => { setForm({ ...t }); setModal('tpl-edit') }}>✏️</button>],
            }))}
            emptyIcon={BellRing}
            emptyTitle="لا توجد قوالب"
            emptyHint="حمّل قوالب الإشعارات من وثيقتي الكابتن والمحل ثم عدّلها."
          />
        </>
      )}

      {tabKey === 'auto' && (
        <>
          <div className="mb-4"><button className="btn-primary" onClick={seedAuto}>تحميل الرسائل التلقائية</button></div>
          <DataTable
            columns={['الحالة', 'الرسالة', 'التطبيق', '']}
            rows={autos.items.map((a) => ({
              key: a.id,
              cells: [
                a.state,
                a.message,
                a.app,
                <button className="btn-ghost px-2 py-1" onClick={() => autos.setItems((p) => p.filter((x) => x.id !== a.id))}>🗑️</button>,
              ],
            }))}
            emptyIcon={MessageCircle}
            emptyTitle="لا توجد رسائل تلقائية"
            emptyHint="صيانة، خارج الشفت، موقوف، لا كباتن، أوفلاين..."
          />
        </>
      )}

      {tabKey === 'sms' && (
        <>
          <div className="mb-4"><button className="btn-primary" onClick={seedSms}>تحميل قالب SMS للزبون</button></div>
          <DataTable
            columns={['المفتاح', 'القالب', '']}
            rows={(sms.items.length ? sms.items : CATALOG_SMS.map((s) => ({ id: s.key, key: s.key, ar: s.ar, en: '', ku: '', place: s.place }))).map((t) => ({
              key: t.key,
              cells: [
                t.key,
                <textarea className="field min-h-16" defaultValue={t.ar} onBlur={(e) => sms.setItems([{ id: t.id || uid(), key: t.key, ar: e.target.value, en: '', ku: '', place: 'SMS الزبون' }])} />,
                'OTP الزبون',
              ],
            }))}
            emptyIcon={MessageSquare}
            emptyTitle="لا توجد قوالب SMS"
          />
        </>
      )}

      {tabKey === 'legal' && (
        <div>
          <div className="mb-4"><button className="btn-primary" onClick={seedLegal}>تهيئة الأقسام القانونية</button></div>
          {legal.items.length === 0 ? (
            <EmptyState icon={Scale} title="لا توجد نصوص قانونية" />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {legal.items.map((t) => (
                <div key={t.id} className="card p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold">{t.title}</h3>
                    <Toggle on={t.enabled} onChange={(v) => legal.setItems((p) => p.map((x) => x.id === t.id ? { ...x, enabled: v } : x))} />
                  </div>
                  <RichEditor value={t.body} onChange={(v) => legal.setItems((p) => p.map((x) => x.id === t.id ? { ...x, body: v } : x))} />
                  <button className="btn-primary mt-3 text-xs" onClick={() => toast('تم حفظ النص القانوني')}>حفظ</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tabKey === 'faq' && (
        <>
          <div className="mb-4 flex gap-2">
            <button className="btn-primary" onClick={seedFaq}>تحميل أسئلة الوثائق</button>
            <button className="btn-ghost" onClick={() => { setForm({ q: '', a: '', order: '1', app: 'الكل' }); setModal('faq') }}>+ سؤال</button>
          </div>
          <DataTable
            columns={['السؤال', 'الإجابة', 'التطبيق', '']}
            rows={faqs.items.map((f) => ({
              key: f.id,
              cells: [f.q, f.a, f.app, <button className="btn-ghost px-2 py-1" onClick={() => faqs.setItems((p) => p.filter((x) => x.id !== f.id))}>🗑️</button>],
            }))}
            emptyIcon={HelpCircle}
            emptyTitle="لا توجد أسئلة"
          />
        </>
      )}

      {tabKey === 'banners' && (
        <>
          <div className="mb-4"><button className="btn-primary" onClick={() => { setForm({ title: '', app: 'كلاهما', order: '1', from: '', to: '', link: '' }); setModal('banner') }}>+ بانر</button></div>
          <DataTable
            columns={['العنوان', 'التطبيق', 'الترتيب', 'من', 'إلى', '']}
            rows={banners.items.map((b) => ({
              key: b.id,
              cells: [b.title, b.app, b.order, b.from || '—', b.to || '—', <button className="btn-ghost px-2 py-1" onClick={() => banners.setItems((p) => p.filter((x) => x.id !== b.id))}>🗑️</button>],
            }))}
            emptyIcon={Megaphone}
            emptyTitle="لا توجد بانرات"
          />
        </>
      )}

      {tabKey === 'theme' && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {colorGroups.map((g) => (
            <div key={g.title} className="card p-5">
              <h2 className="mb-4 text-sm font-bold">{g.title}</h2>
              {g.keys.map(([k, label]) => (
                <div key={k} className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold">{label}</span>
                  <div className="flex items-center gap-2" dir="ltr">
                    <span className="font-mono text-[11px] text-mute">{String(theme[k])}</span>
                    <input type="color" value={String(theme[k])} onChange={(e) => setTheme({ ...theme, [k]: e.target.value })} className="h-8 w-12 cursor-pointer rounded-lg border border-line" />
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold">الوضع الليلي</h2>
            <div className="mb-3 flex justify-between text-xs font-semibold"><span>Dark Mode</span><Toggle on={theme.darkMode} onChange={(v) => setTheme({ ...theme, darkMode: v })} /></div>
            <div className="mb-4 flex justify-between text-xs font-semibold"><span>تلقائي مع الجهاز</span><Toggle on={theme.autoDark} onChange={(v) => setTheme({ ...theme, autoDark: v })} /></div>
            <button className="btn-primary" onClick={() => { applyTheme(theme); notifyCms(); logAudit({ action: 'تغيير إعداد', entity: 'الثيم', details: 'ألوان', oldValue: defaultTheme.primary, newValue: theme.primary }); toast('تم تحديث الألوان') }}>حفظ</button>
          </div>
        </div>
      )}

      {tabKey === 'brand' && (
        <div className="card max-w-2xl space-y-4 p-6">
          <h2 className="text-sm font-bold">الشعار والهوية</h2>
          <label className="btn-secondary w-fit cursor-pointer">رفع شعار
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const r = new FileReader()
              r.onload = () => setBrand({ ...brand, logo: String(r.result) })
              r.readAsDataURL(f)
            }} />
          </label>
          <input className="field" value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} />
          <input className="field" value={brand.short} onChange={(e) => setBrand({ ...brand, short: e.target.value })} />
          <button className="btn-primary" onClick={() => { saveBrand(brand); toast('تم تحديث الشعار') }}>حفظ</button>
        </div>
      )}

      {tabKey === 'pages' && (
        <>
          <div className="mb-4"><button className="btn-primary" onClick={() => { setForm({ name: '', place: 'مشترك' }); setModal('page') }}>+ صفحة</button></div>
          <DataTable
            columns={['الاسم', 'المكان', 'الحالة', '']}
            rows={pages.items.map((p) => ({
              key: p.id,
              cells: [p.name, p.place, p.status, <button className="btn-ghost px-2 py-1" onClick={() => navigate(`/cms/editor?id=${p.id}`)}>✏️</button>],
            }))}
            emptyIcon={FileText}
            emptyTitle="لا صفحات حرة"
          />
        </>
      )}

      {modal === 'page' && (
        <Modal title="صفحة جديدة" onClose={() => setModal(null)}>
          <input className="field mt-4" placeholder="الاسم" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <button className="btn-primary mt-4 w-full" disabled={!form.name} onClick={() => {
            const id = uid()
            pages.setItems((p) => [...p, { id, name: form.name, place: 'مشترك', status: 'مسودة', title: form.name, subtitle: '', content: '', updatedAt: nowIso() }])
            setModal(null)
            navigate(`/cms/editor?id=${id}`)
          }}>فتح المحرر</button>
        </Modal>
      )}
      {modal === 'faq' && (
        <Modal title="سؤال" onClose={() => setModal(null)}>
          <input className="field mt-4" placeholder="السؤال" value={form.q || ''} onChange={(e) => setForm({ ...form, q: e.target.value })} />
          <textarea className="field mt-3 min-h-20" placeholder="الإجابة" value={form.a || ''} onChange={(e) => setForm({ ...form, a: e.target.value })} />
          <select className="field mt-3" value={form.app} onChange={(e) => setForm({ ...form, app: e.target.value })}>
            <option>الكابتن</option><option>المحل</option><option>الكل</option>
          </select>
          <button className="btn-primary mt-4 w-full" onClick={() => { faqs.setItems((p) => [...p, { id: uid(), q: form.q, a: form.a, order: '1', app: form.app }]); setModal(null) }}>حفظ</button>
        </Modal>
      )}
      {modal === 'banner' && (
        <Modal title="بانر" onClose={() => setModal(null)}>
          <input className="field mt-4" placeholder="العنوان" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <button className="btn-primary mt-4 w-full" onClick={() => {
            banners.setItems((p) => [...p, { id: uid(), title: form.title, app: form.app || 'كلاهما', order: form.order || '1', active: true, from: form.from, to: form.to, link: form.link }])
            setModal(null)
          }}>حفظ</button>
        </Modal>
      )}
      {(modal === 'tpl' || modal === 'tpl-edit') && (
        <Modal title="قالب إشعار" onClose={() => setModal(null)} wide>
          <input className="field mt-4" placeholder="الحدث" value={form.event || ''} onChange={(e) => setForm({ ...form, event: e.target.value })} />
          <input className="field mt-3" placeholder="العنوان" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="field mt-3 min-h-24" value={form.body || ''} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <button className="btn-primary mt-4 w-full" onClick={() => {
            if (modal === 'tpl-edit' && form.id) templates.setItems((p) => p.map((x) => x.id === form.id ? { ...x, ...form } as CmsTemplate : x))
            else templates.setItems((p) => [...p, { id: uid(), event: form.event, to: form.to || 'الكابتن', channel: form.channel || 'Push', title: form.title, body: form.body }])
            setModal(null)
          }}>حفظ</button>
        </Modal>
      )}
      {node}
    </div>
  )
}
