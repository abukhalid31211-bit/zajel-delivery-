import { useState } from 'react'
import Toggle from '../components/Toggle'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { defaultSettings, getSettings, saveSettings, type AppSettings } from '../lib/settings'
import { logAudit } from '../lib/store'
import { useDbList } from '../lib/store'
import { uid, nowIso, formatDate } from '../lib/db'
import type { BackupItem } from '../lib/types'
import { Loader2 } from 'lucide-react'

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

function Section({ title, children, onSave }: { title: string; children: React.ReactNode; onSave: () => void }) {
  return (
    <div className="card p-5">
      <h2 className="mb-2 border-b border-line pb-3 text-sm font-bold">{title}</h2>
      {children}
      <button className="btn-primary mt-4" onClick={onSave}>حفظ التغييرات</button>
    </div>
  )
}

export default function Settings() {
  const [s, setS] = useState<AppSettings>(() => getSettings())
  const [maintAsk, setMaintAsk] = useState(false)
  const backups = useDbList<BackupItem>('backups')
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState('')
  const { toast, node } = useToast()

  const save = (next = s, msg = 'تم حفظ الإعدادات بنجاح') => {
    const prev = getSettings()
    saveSettings(next)
    setS(next)
    logAudit({ action: 'تغيير إعداد', entity: 'الإعدادات المركزية', details: msg, oldValue: JSON.stringify(prev.maintenance), newValue: JSON.stringify(next.maintenance) })
    toast(msg)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">الإعدادات المركزية</h1>
        <p className="mt-1 text-xs text-mute">جميع إعدادات التشغيل قابلة للتعديل من هنا. التغييرات تُطبق فوراً على النظام وتُسجل في سجل العمليات.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Section title="إعدادات التشغيل العامة" onSave={() => save()}>
          <SettingRow
            label="وضع الصيانة"
            hint="عند التفعيل لن يتمكن المحلات من إنشاء طلبيات جديدة"
            control={<Toggle on={s.maintenance} onChange={(v) => (v ? setMaintAsk(true) : save({ ...s, maintenance: false }, 'تم إيقاف وضع الصيانة'))} />}
          />
          <div className="border-b border-line py-3">
            <label className="mb-1.5 block text-xs font-semibold">رسالة الصيانة</label>
            <input className="field" value={s.maintenanceMessage} onChange={(e) => setS({ ...s, maintenanceMessage: e.target.value })} />
          </div>
          <SettingRow
            label="نظام التسعير النشط"
            control={
              <select className="field w-44 cursor-pointer text-xs" value={s.pricingMode} onChange={(e) => setS({ ...s, pricingMode: e.target.value as AppSettings['pricingMode'] })}>
                <option value="route">من ← إلى</option>
                <option value="geo">المناطق الجغرافية</option>
              </select>
            }
          />
          <SettingRow label="من يدفع أجرة التوصيل" control={
            <select className="field w-44 cursor-pointer text-xs" value={s.whoPays} onChange={(e) => setS({ ...s, whoPays: e.target.value as AppSettings['whoPays'] })}>
              <option>الزبون</option>
              <option>المحل</option>
              <option>حسب الطلب</option>
            </select>
          } />
          <SettingRow label="تعديل الطلب بعد الإنشاء" control={<Toggle on={s.editOrder} onChange={(v) => setS({ ...s, editOrder: v })} />} />
          <SettingRow label="حد طلبات المحل اليومية (0 = بلا حد)" control={<input type="number" className="field w-24 text-center" value={s.storeDailyLimit} onChange={(e) => setS({ ...s, storeDailyLimit: Number(e.target.value) })} />} />
          <SettingRow
            label="إذا لم يدفع الزبون"
            control={
              <select className="field w-44 cursor-pointer text-xs" value={s.customerNoPay} onChange={(e) => setS({ ...s, customerNoPay: e.target.value as AppSettings['customerNoPay'] })}>
                <option>إرجاع للمحل</option>
                <option>إلغاء</option>
                <option>تحويل للإدارة</option>
              </select>
            }
          />
        </Section>

        <Section title="إعدادات التسليم وإثبات الاستلام" onSave={() => save()}>
          <SettingRow label="تفعيل إثبات التسليم بالـ OTP" control={<Toggle on={s.otpProof} onChange={(v) => setS({ ...s, otpProof: v })} />} />
          <SettingRow label="تفعيل إثبات التسليم بالصورة" control={<Toggle on={s.photoProof} onChange={(v) => setS({ ...s, photoProof: v })} />} />
          <SettingRow
            label="إثبات التسليم"
            control={
              <select className="field w-44 cursor-pointer text-xs" value={s.deliveryProof} onChange={(e) => setS({ ...s, deliveryProof: e.target.value as AppSettings['deliveryProof'] })}>
                <option>مطلوب</option>
                <option>اختياري</option>
                <option>معطّل</option>
              </select>
            }
          />
          <SettingRow
            label="آلية OTP للزبون"
            control={
              <select className="field w-48 cursor-pointer text-xs" value={s.otpMechanism} onChange={(e) => setS({ ...s, otpMechanism: e.target.value as AppSettings['otpMechanism'] })}>
                <option>SMS تلقائي</option>
                <option>المحل يولّد الرمز</option>
                <option>الكابتن يولّد الرمز</option>
                <option>معطّل</option>
              </select>
            }
          />
        </Section>

        <Section title="إعدادات الطابور الذكي" onSave={() => save(s, 'تم حفظ إعدادات الطابور بنجاح')}>
          <SettingRow label="مدة انتظار استجابة الكابتن (بالدقائق)" hint="إذا لم يستجب الكابتن خلال هذه المدة، ينتقل الطلب للكابتن التالي" control={<input type="number" className="field w-24 text-center" value={s.queueWaitMin} onChange={(e) => setS({ ...s, queueWaitMin: Number(e.target.value) })} />} />
          <SettingRow label="الحد الأقصى للطلبيات النشطة لكل كابتن" control={<input type="number" className="field w-24 text-center" value={s.maxActiveOrders} onChange={(e) => setS({ ...s, maxActiveOrders: Number(e.target.value) })} />} />
          <SettingRow label="مدة تنبيه الطلب العالق (بالدقائق)" hint="إذا بقي الطلب بدون كابتن أكثر من هذه المدة يتم تنبيه الإدارة" control={<input type="number" className="field w-24 text-center" value={s.stuckAlertMin} onChange={(e) => setS({ ...s, stuckAlertMin: Number(e.target.value) })} />} />
          <SettingRow label="أخذ موقع الكابتن بعين الاعتبار" control={<Toggle on={s.considerLocation} onChange={(v) => setS({ ...s, considerLocation: v })} />} />
          <SettingRow label="أخذ عدد الطلبيات النشطة بعين الاعتبار" control={<Toggle on={s.considerActiveCount} onChange={(v) => setS({ ...s, considerActiveCount: v })} />} />
          <SettingRow label="أخذ أولوية الكابتن بعين الاعتبار" control={<Toggle on={s.considerPriority} onChange={(v) => setS({ ...s, considerPriority: v })} />} />
          <SettingRow label="يمكن للمحل طلب كابتن محدد" control={<Toggle on={s.storePickCaptain} onChange={(v) => setS({ ...s, storePickCaptain: v })} />} />
        </Section>

        <Section title="إعدادات الشفتات والمركبات" onSave={() => save()}>
          <SettingRow label="عدد مرات تغيير الشفت المسموحة أسبوعياً" control={<input type="number" className="field w-24 text-center" value={s.shiftChangePerWeek} onChange={(e) => setS({ ...s, shiftChangePerWeek: Number(e.target.value) })} />} />
          <SettingRow label="منع استلام الطلبيات خارج الشفت" hint="⚠️ هذه القاعدة إجبارية ولا يمكن تعطيلها" control={<Toggle on onChange={() => undefined} disabled />} />
          <div className="py-3">
            <p className="mb-2 text-[13px] font-semibold">أنواع المركبات</p>
            <div className="flex flex-wrap gap-2">
              {s.vehicleTypes.map((v) => (
                <span key={v} className="badge border border-line bg-page">{v}</span>
              ))}
            </div>
          </div>
        </Section>

        <Section title="إعدادات الإلغاء" onSave={() => save()}>
          <SettingRow label="طلب سبب الإلغاء إجبارياً" control={<Toggle on={s.cancelRequireReason} onChange={(v) => setS({ ...s, cancelRequireReason: v })} />} />
          <SettingRow
            label="من يمكنه إلغاء الطلب؟"
            control={
              <div className="flex gap-3 text-xs font-medium">
                {['المحل', 'الكابتن', 'الإدارة'].map((w) => (
                  <label key={w} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={s.cancelWho.includes(w)}
                      onChange={(e) => setS({ ...s, cancelWho: e.target.checked ? [...s.cancelWho, w] : s.cancelWho.filter((x) => x !== w) })}
                      className="h-4 w-4 accent-black"
                    /> {w}
                  </label>
                ))}
              </div>
            }
          />
          <div className="pt-3">
            <p className="mb-2 text-[13px] font-semibold">أسباب الإلغاء المتاحة</p>
            <div className="space-y-2">
              {s.cancelReasons.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input className="field" value={r} onChange={(e) => setS({ ...s, cancelReasons: s.cancelReasons.map((x, j) => (j === i ? e.target.value : x)) })} />
                  <button className="btn-ghost" onClick={() => setS({ ...s, cancelReasons: s.cancelReasons.filter((_, j) => j !== i) })}>🗑️</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input className="field" placeholder="سبب جديد" value={reason} onChange={(e) => setReason(e.target.value)} />
                <button className="btn-secondary" onClick={() => { if (!reason.trim()) return; setS({ ...s, cancelReasons: [...s.cancelReasons, reason.trim()] }); setReason('') }}>+ إضافة سبب جديد</button>
              </div>
            </div>
          </div>
        </Section>

        <Section title="إعدادات التحديث والإصدارات" onSave={() => save()}>
          <p className="py-2 text-xs text-mute">تطبيق الكابتن — الإصدار الحالي للوحة: واجهة فقط</p>
          <SettingRow label="تطبيق الكابتن — أقل إصدار مسموح" control={<input className="field w-32 text-center" dir="ltr" value={s.captainMinVersion} onChange={(e) => setS({ ...s, captainMinVersion: e.target.value })} />} />
          <SettingRow label="تحديث إجباري لتطبيق الكابتن" control={<Toggle on={s.captainForceUpdate} onChange={(v) => setS({ ...s, captainForceUpdate: v })} />} />
          <div className="border-b border-line py-3">
            <label className="mb-1.5 block text-xs font-semibold">رسالة التحديث — الكابتن</label>
            <input className="field" value={s.captainUpdateMsg} onChange={(e) => setS({ ...s, captainUpdateMsg: e.target.value })} />
          </div>
          <SettingRow label="تطبيق المحل — أقل إصدار مسموح" control={<input className="field w-32 text-center" dir="ltr" value={s.storeMinVersion} onChange={(e) => setS({ ...s, storeMinVersion: e.target.value })} />} />
          <SettingRow label="تحديث إجباري لتطبيق المحل" control={<Toggle on={s.storeForceUpdate} onChange={(v) => setS({ ...s, storeForceUpdate: v })} />} />
          <div className="py-3">
            <label className="mb-1.5 block text-xs font-semibold">رسالة التحديث — المحل</label>
            <input className="field" value={s.storeUpdateMsg} onChange={(e) => setS({ ...s, storeUpdateMsg: e.target.value })} />
          </div>
        </Section>

        <div className="card p-5 xl:col-span-2">
          <h2 className="mb-2 border-b border-line pb-3 text-sm font-bold">إعدادات النسخ الاحتياطي</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SettingRow label="نسخ احتياطي تلقائي" control={<Toggle on={s.autoBackup} onChange={(v) => setS({ ...s, autoBackup: v })} />} />
            <SettingRow
              label="التكرار"
              control={
                <select className="field w-32 cursor-pointer text-xs" value={s.backupFreq} onChange={(e) => setS({ ...s, backupFreq: e.target.value as AppSettings['backupFreq'] })}>
                  <option>يومياً</option>
                  <option>أسبوعياً</option>
                  <option>شهرياً</option>
                </select>
              }
            />
            <SettingRow label="وقت النسخ الاحتياطي" control={<input type="time" className="field w-32" value={s.backupTime} onChange={(e) => setS({ ...s, backupTime: e.target.value })} />} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => save()}>حفظ التغييرات</button>
            <button
              className="btn-secondary"
              disabled={busy}
              onClick={() => {
                setBusy(true)
                toast('جاري إنشاء نسخة احتياطية...')
                window.setTimeout(() => {
                  backups.setItems((p) => [{ id: uid(), at: nowIso(), size: '0 ك.ب', status: 'جاهزة' }, ...p])
                  setBusy(false)
                  toast('تم إنشاء نسخة احتياطية بنجاح')
                }, 900)
              }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              إنشاء نسخة احتياطية الآن
            </button>
            <button className="btn-ghost" onClick={() => { setS(defaultSettings); saveSettings(defaultSettings); toast('أُعيدت الإعدادات الافتراضية') }}>إعادة الافتراضي</button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-max text-right text-xs">
              <thead>
                <tr className="border-b border-line bg-page/60">
                  {['التاريخ', 'الحجم', 'الحالة', 'الإجراءات'].map((c) => <th key={c} className="px-3 py-2 font-semibold text-mute">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {backups.items.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-8 text-center text-mute">لا توجد نسخ احتياطية سابقة</td></tr>
                )}
                {backups.items.map((b) => (
                  <tr key={b.id} className="border-b border-line">
                    <td className="px-3 py-2">{formatDate(b.at)}</td>
                    <td className="px-3 py-2">{b.size}</td>
                    <td className="px-3 py-2">{b.status}</td>
                    <td className="px-3 py-2">
                      <button className="btn-ghost px-2 py-1" onClick={() => toast('لا توجد بيانات للتحميل')}>📥 تحميل</button>
                      <button className="btn-ghost px-2 py-1" onClick={() => backups.setItems((p) => p.filter((x) => x.id !== b.id))}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {maintAsk && (
        <Modal title="تفعيل وضع الصيانة" onClose={() => setMaintAsk(false)}>
          <p className="mt-2 text-xs text-mute">هل تريد تفعيل وضع الصيانة؟ لن يتمكن المحلات من إنشاء طلبات جديدة.</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { save({ ...s, maintenance: true }, 'تم تفعيل وضع الصيانة'); setMaintAsk(false) }}>تأكيد</button>
            <button className="btn-ghost flex-1" onClick={() => setMaintAsk(false)}>إلغاء</button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
