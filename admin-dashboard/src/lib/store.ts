import { useCallback, useState } from 'react'
import { dbGet, dbSet, uid, nowIso } from './db'
import { getSession } from './session'
import type { AuditEntry, SecurityEntry } from './types'

export function useDbList<T extends { id: string }>(key: string) {
  const [items, setItems] = useState<T[]>(() => dbGet<T[]>(key, []))

  const persist = useCallback(
    (next: T[] | ((prev: T[]) => T[])) => {
      setItems((prev) => {
        const value = typeof next === 'function' ? (next as (p: T[]) => T[])(prev) : next
        dbSet(key, value)
        return value
      })
    },
    [key],
  )

  return { items, setItems: persist }
}

export function logAudit(partial: Omit<AuditEntry, 'id' | 'at' | 'admin'> & { admin?: string }) {
  const admin = partial.admin || getSession()?.name || 'مدير النظام'
  const list = dbGet<AuditEntry[]>('audit', [])
  list.unshift({
    id: uid(),
    at: nowIso(),
    admin,
    action: partial.action,
    entity: partial.entity,
    details: partial.details,
    oldValue: partial.oldValue,
    newValue: partial.newValue,
  })
  dbSet('audit', list)
}

export function logSecurity(partial: Omit<SecurityEntry, 'id' | 'at' | 'ip' | 'device'> & { ip?: string; device?: string }) {
  const list = dbGet<SecurityEntry[]>('security', [])
  list.unshift({
    id: uid(),
    at: nowIso(),
    type: partial.type,
    user: partial.user,
    ip: partial.ip || '—',
    device: partial.device || navigator.userAgent.slice(0, 48),
    result: partial.result,
    details: partial.details,
  })
  dbSet('security', list)
}

export const PERM_SECTIONS = ['الكباتن', 'المحلات', 'الطلبيات', 'الأسعار', 'المناطق', 'الشفتات', 'التقارير', 'الإشعارات', 'الشكاوى', 'الإعدادات']
export const PERM_ACTIONS = ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف', 'حذف']

export const VEHICLES = ['دراجة نارية 🏍️', 'سيارة 🚗', 'دراجة هوائية 🚲', 'مشي 🚶']
export const STORE_TYPES = ['مطعم', 'محل', 'صيدلية', 'سوبرماركت']
export const ORDER_STATUSES = [
  'طلب جديد',
  'بانتظار كابتن',
  'تم قبول الكابتن',
  'متوجه للمحل',
  'وصل للمحل',
  'استلم الطلب',
  'بالطريق للزبون',
  'تم التسليم',
  'مكتمل',
  'ملغي',
]
