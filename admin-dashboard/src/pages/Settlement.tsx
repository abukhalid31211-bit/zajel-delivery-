import { Wallet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function Settlement() {
  return (
    <div>
      <PageHeader
        title="التسوية المالية اليومية"
        subtitle="مطابقة وتسوية الحسابات النقدية (الكاش) للكباتن — تقرير محاسبي وليس محفظة إلكترونية"
        actions={<input type="date" className="field w-auto cursor-pointer" />}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          'إجمالي ما دفعه الكباتن للمحلات',
          'إجمالي ما استلمه الكباتن من الزبائن',
          'إجمالي أجور التوصيل',
          'الكباتن المُسوَّون / الإجمالي',
        ].map((l, i) => (
          <div key={l} className="card p-4">
            <p className="text-[11px] font-medium text-mute">{l}</p>
            <p className="mt-1.5 text-xl font-bold">{i === 3 ? '0 / 0' : '0 د.ع'}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={['الكابتن', 'عدد الطلبيات', 'دفع للمحلات', 'استلم من الزبائن', 'صافي الأجرة', 'حالة التسوية', 'الإجراءات']}
        emptyIcon={Wallet}
        emptyTitle="لا توجد حسابات بانتظار التسوية اليوم"
        emptyHint="ستظهر هنا حسابات الكباتن اليومية مع حالتها (⏳ لم تُسوَّ / ✅ مُسوَّى) لإجراء التسوية النقدية اليدوية."
      />
    </div>
  )
}
