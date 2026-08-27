import { useState } from 'react'
import { Map, MapPin, PencilRuler } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const tabs = [
  { label: 'المحافظات', icon: Map },
  { label: 'المناطق', icon: MapPin },
  { label: 'رسم الحدود (Geofencing)', icon: PencilRuler },
]

export default function Zones() {
  const [tab, setTab] = useState(0)
  const [addGov, setAddGov] = useState(false)
  const [addDistrict, setAddDistrict] = useState(false)
  const [name, setName] = useState('')
  const { toast, node } = useToast()
  return (
    <div>
      <PageHeader
        title="المناطق والجغرافيا"
        subtitle="إدارة المحافظات العراقية والمناطق التابعة لها ورسم الحدود الجغرافية"
        actions={
          tab === 0 ? (
            <button className="btn-primary" onClick={() => setAddGov(true)}>+ إضافة محافظة</button>
          ) : tab === 1 ? (
            <button className="btn-primary" onClick={() => setAddDistrict(true)}>+ إضافة منطقة جديدة</button>
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

      {addGov && (
        <Modal title="إضافة محافظة" onClose={() => setAddGov(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم المحافظة</label>
              <input className="field" placeholder="مثال: بغداد" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-black" /> مفعّلة
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!name.trim()}
              onClick={() => { setAddGov(false); setName(''); toast('تمت إضافة المحافظة بنجاح ✅') }}
            >
              حفظ
            </button>
            <button className="btn-ghost flex-1" onClick={() => setAddGov(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {addDistrict && (
        <Modal title="إضافة منطقة جديدة" onClose={() => setAddDistrict(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم المنطقة</label>
              <input className="field" placeholder="اسم المنطقة الإدارية" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المحافظة</label>
              <select className="field cursor-pointer text-mute" defaultValue="">
                <option value="" disabled>لا توجد محافظات معرفة — أضف محافظة أولاً</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-black" /> مفعّلة
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!name.trim()}
              onClick={() => { setAddDistrict(false); setName(''); toast('تمت إضافة المنطقة بنجاح ✅') }}
            >
              حفظ
            </button>
            <button className="btn-ghost flex-1" onClick={() => setAddDistrict(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
