/* ============================================================
   خيار «أخرى» في نهاية القوائم المنسدلة
   ------------------------------------------------------------
   كل قائمة منسدلة تعرض قيماً يُدخلها المستخدم باسمها (المناطق،
   أنواع النشاط، المركبات، الشفتات، الأسباب...) يُضاف في آخرها
   خيار «أخرى»: عند اختياره يظهر حقل إدخال، والاسم المكتوب فيه
   يُحفظ — ويُضاف إلى القائمة الأم (المناطق/الشفتات/المركبات)
   ليظهر في القوائم مرة أخرى.
   المحافظات مستثناة: قائمة المحافظات العراقية ثابتة.
   ============================================================ */
import { uid } from './db'
import { logAudit } from './store'
import type { District, Shift } from './types'

/** القيمة الخاصة بخيار «أخرى» — نفس النص المستخدم في قوائم الأسباب المعتمدة */
export const OTHER = 'أخرى'

/** هل اختار المستخدم «أخرى»؟ */
export const isOther = (value?: string | null) => value === OTHER

/** اسم نظيف مكتوب يدوياً، أو نص فارغ */
export const otherName = (value: string) => value.trim()

/**
 * يضمن وجود منطقة بالاسم المكتوب في «أخرى» داخل المحافظة المحددة:
 * يعيد معرّف المنطقة إن كانت موجودة، وإلا ينشئها في قائمة المناطق
 * (المناطق والجغرافيا) ويعيد معرّفها الجديد. يعيد null إذا كان الاسم فارغاً.
 */
export function ensureOtherDistrict(
  items: District[],
  setItems: (next: (prev: District[]) => District[]) => void,
  name: string,
  govId: string,
): string | null {
  const nm = otherName(name)
  if (!nm) return null
  const found = items.find((d) => d.govId === govId && d.name === nm)
  if (found) return found.id
  const created: District = { id: uid(), govId, name: nm, enabled: true, points: [] }
  setItems((p) => [...p, created])
  logAudit({ action: 'إضافة', entity: 'منطقة', details: `${nm} — عبر خيار «أخرى»`, oldValue: '—', newValue: nm })
  return created.id
}

/**
 * يضمن وجود شفت بالاسم المكتوب في «أخرى»: يعيد معرّف الشفت الموجود
 * أو ينشئ شفتاً جديداً في قائمة الشفتات ويعيد معرّفه. يعيد null إذا كان الاسم فارغاً.
 */
export function ensureOtherShift(
  items: Shift[],
  setItems: (next: (prev: Shift[]) => Shift[]) => void,
  name: string,
  start: string,
  end: string,
): string | null {
  const nm = otherName(name)
  if (!nm) return null
  const found = items.find((s) => s.name === nm)
  if (found) return found.id
  const created: Shift = { id: uid(), name: nm, start, end, enabled: true }
  setItems((p) => [...p, created])
  logAudit({ action: 'إضافة', entity: 'شفت', details: `${nm} — عبر خيار «أخرى»`, oldValue: '—', newValue: `${start} → ${end}` })
  return created.id
}
