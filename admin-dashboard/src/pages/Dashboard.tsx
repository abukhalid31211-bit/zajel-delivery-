import { Package, Truck, CircleDot, AlertTriangle, TrendingUp } from 'lucide-react'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export default function Dashboard() {
  return (
    <div>
      <PageHeader title="نظرة عامة" subtitle="ملخص العمليات التشغيلية المباشرة لنظام زاجل ديلفري" />

      {/* stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="طلبيات اليوم" value="0" sub="إجمالي الطلبيات المسجلة اليوم" />
        <StatCard icon={Truck} label="الطلبيات النشطة الآن" value="0" sub="طلبيات جارية قيد التنفيذ" />
        <StatCard icon={CircleDot} label="الكباتن المتصلون" value="0 / 0" sub="من إجمالي كباتن الشفت الحالي" />
        <StatCard icon={AlertTriangle} label="طلبيات بدون كابتن" value="0" sub="بحاجة لتدخل فوري" alert />
      </div>

      {/* chart + top districts */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <TrendingUp className="h-4 w-4" /> مخطط الطلبيات الأسبوعي
            </h2>
            <div className="flex overflow-hidden rounded-xl border border-line text-[11px] font-semibold">
              {['أسبوع', 'شهر', 'سنة'].map((t, i) => (
                <button key={t} className={`px-3.5 py-1.5 transition-colors ${i === 0 ? 'bg-black text-white' : 'text-mute hover:bg-page'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-56 items-end justify-between gap-2 border-b border-line px-2">
            {days.map((d) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full max-w-10 rounded-t-md bg-page" style={{ height: 4 }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between px-2">
            {days.map((d) => (
              <span key={d} className="flex-1 text-center text-[10px] text-faint">{d}</span>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-faint">لا توجد بيانات لعرضها خلال هذه الفترة</p>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-bold">أكثر المناطق نشاطاً</h2>
          <div className="mb-2 grid grid-cols-3 border-b border-line pb-2 text-[11px] font-semibold text-mute">
            <span>المنطقة</span>
            <span className="text-center">عدد الطلبيات</span>
            <span className="text-left">النسبة</span>
          </div>
          <EmptyState title="لا توجد بيانات" hint="ستظهر أكثر 5 مناطق نشاطاً هنا فور تسجيل الطلبيات." />
        </div>
      </div>

      {/* top stores + recent orders */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-bold">أكثر المطاعم والمحلات طلبياً</h2>
          <EmptyState title="لا توجد بيانات" hint="ستظهر أعلى 5 محلات نشاطاً هنا مع متوسط تقييمها." />
        </div>
        <div className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold">أحدث الطلبيات</h2>
            <button className="text-[11px] font-semibold text-mute hover:text-black">عرض الكل</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-right text-sm">
              <thead>
                <tr className="border-b border-line bg-page/60 text-[11px] text-mute">
                  {['رقم الطلب', 'المحل', 'الكابتن', 'الحالة', 'الوقت'].map((c) => (
                    <th key={c} className="px-4 py-3 font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <EmptyState title="لا توجد طلبيات بعد" hint="ستظهر آخر 10 طلبيات هنا لحظة تسجيلها في النظام." />
        </div>
      </div>
    </div>
  )
}
