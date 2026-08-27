import { useState } from 'react'
import { Map, MapPin, PencilRuler } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'

const tabs = [
  { label: 'المحافظات', icon: Map },
  { label: 'المناطق', icon: MapPin },
  { label: 'رسم الحدود (Geofencing)', icon: PencilRuler },
]

export default function Zones() {
  const [tab, setTab] = useState(0)
  return (
    <div>
      <PageHeader
        title="المناطق والجغرافيا"
        subtitle="إدارة المحافظات العراقية والمناطق التابعة لها ورسم الحدود الجغرافية"
        actions={
          tab === 0 ? (
            <button className="btn-primary">+ إضافة محافظة</button>
          ) : tab === 1 ? (
            <button className="btn-primary">+ إضافة منطقة جديدة</button>
          ) : undefined
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <DataTable
          columns={['اسم المحافظة', 'عدد المناطق', 'الحالة', 'الإجراءات']}
          emptyIcon={Map}
          emptyTitle="لم يتم تفعيل أي محافظة بعد"
          emptyHint="أضف المحافظات العراقية وفعّلها لبدء استقبال الطلبيات فيها. إيقاف المحافظة يوقف جميع المناطق والطلبيات المرتبطة بها فوراً."
        />
      )}

      {tab === 1 && (
        <>
          <div className="card mb-5 flex flex-wrap items-center gap-3 p-4">
            <span className="text-xs font-semibold">اختر المحافظة:</span>
            <select className="field w-auto min-w-44 cursor-pointer text-mute" defaultValue="">
              <option value="" disabled>لا توجد محافظات معرفة</option>
            </select>
          </div>
          <DataTable
            columns={['اسم المنطقة', 'المحافظة', 'الحالة', 'عدد الطلبيات اليوم', 'الإجراءات']}
            emptyIcon={MapPin}
            emptyTitle="لا توجد مناطق معرفة"
            emptyHint="أضف المناطق داخل المحافظات لتحديد نطاقات التوصيل والتسعير."
          />
        </>
      )}

      {tab === 2 && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3.5">
            <button className="btn-ghost">✏️ رسم مضلع</button>
            <button className="btn-ghost">🔧 تعديل</button>
            <button className="btn-ghost">🗑️ حذف</button>
            <div className="flex-1" />
            <button className="btn-primary">💾 حفظ الحدود</button>
          </div>
          <div
            className="relative flex h-96 items-center justify-center"
            style={{
              backgroundImage:
                'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              backgroundColor: '#fafafa',
            }}
          >
            <EmptyState
              icon={PencilRuler}
              title="الخريطة التفاعلية غير متصلة"
              hint="عند ربط مزود الخرائط (Google Maps / Mapbox) ستتمكن من رسم حدود المناطق الجغرافية (Geofence) هنا مباشرة بالنقر على الخريطة."
            />
          </div>
        </div>
      )}
    </div>
  )
}
