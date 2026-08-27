import { useState } from 'react'
import {
  FileText,
  Type,
  Palette,
  ImageIcon,
  Smartphone,
  BellRing,
  MessageCircle,
  Scale,
  HelpCircle,
  Megaphone,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'

const sections = [
  { label: 'الصفحات', icon: FileText },
  { label: 'العناوين والنصوص', icon: Type },
  { label: 'الألوان والثيم', icon: Palette },
  { label: 'الشعار والهوية', icon: ImageIcon },
  { label: 'شاشات التطبيقات', icon: Smartphone },
  { label: 'قوالب الإشعارات', icon: BellRing },
  { label: 'الرسائل التلقائية', icon: MessageCircle },
  { label: 'النصوص القانونية', icon: Scale },
  { label: 'أسئلة شائعة', icon: HelpCircle },
  { label: 'البانرات والإعلانات', icon: Megaphone },
]

const colorGroups = [
  {
    title: 'الألوان الأساسية',
    colors: [
      ['اللون الأساسي', '#000000'],
      ['اللون الثانوي', '#FFFFFF'],
      ['لون الخلفية', '#F5F5F5'],
      ['لون النصوص', '#000000'],
      ['لون الحدود', '#E0E0E0'],
    ],
  },
  {
    title: 'ألوان الحالات',
    colors: [
      ['لون النجاح', '#000000'],
      ['لون التحذير', '#666666'],
      ['لون الخطأ', '#333333'],
      ['لون المعلومات', '#999999'],
    ],
  },
]

export default function CMS() {
  const [tab, setTab] = useState(0)
  return (
    <div>
      <PageHeader
        title="إدارة المحتوى (CMS)"
        subtitle="تحكم كامل بكل نص ولون وصورة وشاشة في التطبيقات ولوحة الإدارة — التغييرات تُطبق فوراً"
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {sections.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setTab(i)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-semibold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            <s.icon className="h-3.5 w-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <DataTable
          columns={['اسم الصفحة', 'المكان', 'الحالة', 'آخر تعديل', 'الإجراءات']}
          emptyIcon={FileText}
          emptyTitle="لا توجد صفحات منشأة"
          emptyHint="أنشئ وحرر صفحات المحتوى لتطبيق الكابتن وتطبيق المحل ولوحة الإدارة من هنا."
        />
      )}

      {tab === 1 && (
        <DataTable
          columns={['المفتاح (Key)', 'النص الحالي', 'المكان', 'الإجراءات']}
          emptyIcon={Type}
          emptyTitle="لا توجد نصوص معرفة"
          emptyHint="ابحث عن أي نص في النظام وعدّله فوراً — يدعم العربية والإنجليزية والكردية."
        />
      )}

      {tab === 2 && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {colorGroups.map((g) => (
            <div key={g.title} className="card p-5">
              <h2 className="mb-4 text-sm font-bold">{g.title}</h2>
              <div className="space-y-3">
                {g.colors.map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold">{label}</span>
                    <div className="flex items-center gap-2" dir="ltr">
                      <span className="text-[11px] font-mono text-mute">{val}</span>
                      <input type="color" defaultValue={val} className="h-8 w-12 cursor-pointer rounded-lg border border-line" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button className="btn-primary flex-1">حفظ التغييرات</button>
                <button className="btn-ghost">إعادة للافتراضي</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 3 && (
        <div className="card max-w-2xl space-y-5 p-6">
          <h2 className="text-sm font-bold">الشعار والهوية البصرية</h2>
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-black">
              <svg viewBox="0 0 64 64" width="48" height="48">
                <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#fff" />
                <circle cx="50" cy="16" r="4" fill="#fff" />
              </svg>
            </div>
            <div className="space-y-2">
              <button className="btn-secondary">رفع شعار جديد</button>
              <p className="text-[11px] text-faint">PNG, SVG, WebP — يظهر فوراً في جميع الشاشات</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم النظام</label>
              <input className="field" defaultValue="زاجل ديلفري — Zajel Delivery" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الاسم المختصر</label>
              <input className="field" defaultValue="زاجل" />
            </div>
          </div>
          <button className="btn-primary">حفظ</button>
        </div>
      )}

      {tab === 4 && (
        <div className="card p-5">
          <div className="mb-4 flex gap-2">
            <button className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white">تطبيق الكابتن</button>
            <button className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-mute hover:bg-page">تطبيق المحل</button>
          </div>
          <EmptyState
            icon={Smartphone}
            title="قائمة الشاشات القابلة للتحرير"
            hint="شاشة الترحيب، التسجيل، انتظار الموافقة، الشاشة الرئيسية، الطلب الجديد، إثبات التسليم، كشف الحساب وغيرها — كل شاشة قابلة للتحرير مع معاينة حية عند ربط الباك إند."
          />
        </div>
      )}

      {tab === 5 && (
        <DataTable
          columns={['الحدث', 'المرسل إليه', 'القناة', 'العنوان', 'المحتوى', 'الإجراءات']}
          emptyIcon={BellRing}
          emptyTitle="لا توجد قوالب إشعارات"
          emptyHint="حرر صياغة كل إشعار في النظام واستخدم المتغيرات الديناميكية مثل {order_id} و {captain_name}."
        />
      )}

      {tab === 6 && (
        <DataTable
          columns={['الحالة', 'الرسالة', 'التطبيق', 'الإجراءات']}
          emptyIcon={MessageCircle}
          emptyTitle="لا توجد رسائل تلقائية معرفة"
          emptyHint="رسائل تظهر تلقائياً في حالات محددة: وضع الصيانة، خارج الشفت، الحد الأقصى، انتهاء الجلسة..."
        />
      )}

      {tab === 7 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {['شروط الاستخدام — الكابتن', 'شروط الاستخدام — المحل', 'سياسة الخصوصية', 'سياسة الإلغاء والاسترجاع'].map((t) => (
            <div key={t} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">{t}</h3>
                <span className="badge bg-page text-mute">مفعّل</span>
              </div>
              <textarea className="field min-h-32 resize-y" placeholder="اكتب النص القانوني هنا..." />
              <div className="mt-3 flex gap-2">
                <button className="btn-primary text-xs">حفظ</button>
                <button className="btn-ghost text-xs">معاينة</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 8 && (
        <DataTable
          columns={['السؤال', 'الإجابة', 'الترتيب', 'التطبيق', 'الإجراءات']}
          emptyIcon={HelpCircle}
          emptyTitle="لا توجد أسئلة شائعة"
          emptyHint="أضف الأسئلة والأجوبة التي تظهر في قسم المساعدة بتطبيقي الكابتن والمحل."
        />
      )}

      {tab === 9 && (
        <DataTable
          columns={['الصورة', 'العنوان', 'التطبيق', 'الترتيب', 'الحالة', 'تاريخ البداية', 'تاريخ النهاية', 'الإجراءات']}
          emptyIcon={Megaphone}
          emptyTitle="لا توجد بانرات إعلانية"
          emptyHint="تحكم بالبانرات التي تظهر أعلى الشاشة الرئيسية للتطبيقات مع جدولة زمنية للعرض."
        />
      )}
    </div>
  )
}
