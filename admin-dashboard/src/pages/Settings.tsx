import { useState } from 'react'

function Toggle({ defaultOn = false, disabled = false }: { defaultOn?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-black' : 'bg-line'} ${disabled ? 'opacity-60' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'right-0.5' : 'right-[22px]'}`}
      />
    </button>
  )
}

function SettingRow({ label, hint, control }: { label: string; hint?: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-0">
      <div>
        <p className="text-[13px] font-semibold">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] leading-relaxed text-mute">{hint}</p>}
      </div>
      {control}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-2 border-b border-line pb-3 text-sm font-bold">{title}</h2>
      {children}
      <button className="btn-primary mt-4">حفظ التغييرات</button>
    </div>
  )
}

export default function Settings() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">الإعدادات المركزية</h1>
        <p className="mt-1 text-xs text-mute">جميع إعدادات التشغيل قابلة للتعديل من هنا. التغييرات تُطبق فوراً على النظام وتُسجل في سجل العمليات.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Section title="إعدادات التشغيل العامة">
          <SettingRow label="وضع الصيانة" hint="عند التفعيل لن يتمكن المحلات من إنشاء طلبيات جديدة" control={<Toggle />} />
          <SettingRow
            label="نظام التسعير النشط"
            control={
              <select className="field w-44 cursor-pointer text-xs">
                <option>من ← إلى</option>
                <option>المناطق الجغرافية</option>
              </select>
            }
          />
          <SettingRow label="تفعيل إثبات التسليم بالـ OTP" control={<Toggle defaultOn />} />
          <SettingRow label="تفعيل إثبات التسليم بالصورة" control={<Toggle defaultOn />} />
          <SettingRow
            label="إثبات التسليم"
            control={
              <select className="field w-44 cursor-pointer text-xs">
                <option>مطلوب</option>
                <option>اختياري</option>
                <option>معطّل</option>
              </select>
            }
          />
        </Section>

        <Section title="إعدادات الطابور الذكي">
          <SettingRow
            label="مدة انتظار استجابة الكابتن (بالدقائق)"
            hint="إذا لم يستجب الكابتن خلال هذه المدة، ينتقل الطلب للكابتن التالي"
            control={<input type="number" className="field w-24 text-center" defaultValue={5} />}
          />
          <SettingRow
            label="الحد الأقصى للطلبيات النشطة لكل كابتن"
            control={<input type="number" className="field w-24 text-center" defaultValue={3} />}
          />
          <SettingRow
            label="مدة تنبيه الطلب العالق (بالدقائق)"
            hint="إذا بقي الطلب بدون كابتن أكثر من هذه المدة يتم تنبيه الإدارة"
            control={<input type="number" className="field w-24 text-center" defaultValue={15} />}
          />
          <SettingRow label="أخذ موقع الكابتن بعين الاعتبار" control={<Toggle defaultOn />} />
          <SettingRow label="أخذ عدد الطلبيات النشطة بعين الاعتبار" control={<Toggle defaultOn />} />
          <SettingRow label="أخذ أولوية الكابتن بعين الاعتبار" control={<Toggle />} />
        </Section>

        <Section title="إعدادات الشفتات">
          <SettingRow
            label="عدد مرات تغيير الشفت المسموحة أسبوعياً"
            control={<input type="number" className="field w-24 text-center" defaultValue={1} />}
          />
          <SettingRow
            label="منع استلام الطلبيات خارج الشفت"
            hint="⚠️ هذه القاعدة إجبارية ولا يمكن تعطيلها"
            control={<Toggle defaultOn disabled />}
          />
        </Section>

        <Section title="إعدادات الإلغاء">
          <SettingRow label="طلب سبب الإلغاء إجبارياً" control={<Toggle defaultOn />} />
          <SettingRow
            label="من يمكنه إلغاء الطلب؟"
            control={
              <div className="flex gap-3 text-xs font-medium">
                {['المحل', 'الكابتن', 'الإدارة'].map((w) => (
                  <label key={w} className="flex items-center gap-1.5">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-black" /> {w}
                  </label>
                ))}
              </div>
            }
          />
        </Section>

        <Section title="إعدادات التحديث والإصدارات">
          <SettingRow
            label="تطبيق الكابتن — أقل إصدار مسموح"
            control={<input className="field w-32 text-center" placeholder="X.Y.Z" dir="ltr" />}
          />
          <SettingRow label="تحديث إجباري لتطبيق الكابتن" control={<Toggle />} />
          <SettingRow
            label="تطبيق المحل — أقل إصدار مسموح"
            control={<input className="field w-32 text-center" placeholder="X.Y.Z" dir="ltr" />}
          />
          <SettingRow label="تحديث إجباري لتطبيق المحل" control={<Toggle />} />
        </Section>

        <Section title="إعدادات النسخ الاحتياطي">
          <SettingRow label="نسخ احتياطي تلقائي" control={<Toggle defaultOn />} />
          <SettingRow
            label="التكرار"
            control={
              <select className="field w-32 cursor-pointer text-xs">
                <option>يومياً</option>
                <option>أسبوعياً</option>
                <option>شهرياً</option>
              </select>
            }
          />
          <SettingRow label="وقت النسخ الاحتياطي" control={<input type="time" className="field w-32" />} />
          <div className="pt-3">
            <button className="btn-secondary w-full">إنشاء نسخة احتياطية الآن</button>
          </div>
        </Section>
      </div>
    </div>
  )
}
