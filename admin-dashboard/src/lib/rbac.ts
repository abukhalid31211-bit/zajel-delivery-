import { getSession } from './session'

export const ROUTE_SECTION: { test: (path: string, search: string) => boolean; section: string | 'SUPER' | 'ANY' }[] = [
  { test: (p) => p === '/' || p === '/profile' || p === '/search', section: 'ANY' },
  { test: (p, s) => p.startsWith('/captains') && s.includes('tab=shifts'), section: 'الشفتات' },
  { test: (p) => p.startsWith('/captains'), section: 'الكباتن' },
  { test: (p) => p.startsWith('/stores'), section: 'المحلات' },
  { test: (p) => p.startsWith('/orders'), section: 'الطلبيات' },
  { test: (p) => p.startsWith('/zones'), section: 'المناطق' },
  { test: (p) => p.startsWith('/price-customization'), section: 'تخصيص الأسعار' },
  { test: (p) => p.startsWith('/pricing'), section: 'الأسعار' },
  { test: (p) => p.startsWith('/reports') || p.startsWith('/settlement'), section: 'التقارير' },
  { test: (p) => p.startsWith('/notifications'), section: 'الإشعارات' },
  { test: (p) => p.startsWith('/complaints'), section: 'الشكاوى' },
  { test: (p) => p.startsWith('/cms') || p.startsWith('/settings') || p.startsWith('/audit-log'), section: 'الإعدادات' },
  { test: (p) => p.startsWith('/admins'), section: 'SUPER' },
]

export type GeoEntity = {
  govId?: string
  districtId?: string
  districtIds?: string[]
  storeId?: string
  captainId?: string
}

export type StoreScoped = { id: string; govId?: string; districtId?: string }
export type CaptainScoped = { id: string; govId?: string; districtIds?: string[] }
export type OrderScoped = { govId?: string; districtId?: string; storeId?: string; captainId?: string }

export function isSuper() {
  const s = getSession()
  return !s || s.super !== false
}

export function can(section: string, action = 'مشاهدة') {
  if (isSuper()) return true
  const s = getSession()
  if (!s) return false
  return (s.perms?.[section] || []).includes(action)
}

export function canAccessPath(path: string, search = '') {
  const rule = ROUTE_SECTION.find((r) => r.test(path, search))
  if (!rule || rule.section === 'ANY') return true
  if (rule.section === 'SUPER') return isSuper()
  return can(rule.section, 'مشاهدة')
}

export function inGovScope(govId?: string) {
  if (isSuper()) return true
  const s = getSession()
  if (!s?.govIds?.length) return true
  if (!govId) return true
  return s.govIds.includes(govId)
}

function districtAllowed(districtId?: string, districtIds?: string[]) {
  const s = getSession()
  if (isSuper()) return true
  if (!s?.districtIds?.length) return true
  if (districtId) return s.districtIds.includes(districtId)
  if (districtIds?.length) return districtIds.some((id) => s.districtIds.includes(id))
  return false
}

/**
 * يتحقق من نطاق المحافظات والمناطق. إذا كان للأدمن مناطق محددة فيجب أن تتطابق المنطقة
 * أو تتقاطع قائمة مناطق الكابتن معها. يستخدم في كل الجداول والتقارير حتى يرى الليدر
 * بيانات محافظته/منطقته فقط.
 */
export function inGeoScope(govId?: string, districtId?: string, districtIds?: string[]) {
  if (!inGovScope(govId)) return false
  return districtAllowed(districtId, districtIds)
}

export function inStoreScope(store?: StoreScoped | null) {
  if (!store) return false
  if (!inGeoScope(store.govId, store.districtId)) return false
  if (isSuper()) return true
  const s = getSession()
  if (s?.storeIds?.length) return s.storeIds.includes(store.id)
  return true
}

export function inCaptainScope(captain?: CaptainScoped | null) {
  if (!captain) return false
  if (!inGeoScope(captain.govId, undefined, captain.districtIds)) return false
  if (isSuper()) return true
  const s = getSession()
  if (s?.captainIds?.length) return s.captainIds.includes(captain.id)
  return true
}

export function inOrderScope(order?: OrderScoped | null) {
  if (!order) return false
  if (!inGeoScope(order.govId, order.districtId)) return false
  if (isSuper()) return true
  const s = getSession()
  if (s?.storeIds?.length && (!order.storeId || !s.storeIds.includes(order.storeId))) return false
  if (s?.captainIds?.length && (!order.captainId || !s.captainIds.includes(order.captainId))) return false
  return true
}

export function hasEntityScope() {
  if (isSuper()) return false
  const s = getSession()
  return !!(s?.govIds?.length || s?.districtIds?.length || s?.storeIds?.length || s?.captainIds?.length)
}

export const NAV_SECTION: Record<string, string | 'SUPER' | 'ANY'> = {
  '/': 'ANY',
  '/orders': 'الطلبيات',
  '/captains': 'الكباتن',
  '/stores': 'المحلات',
  '/zones': 'المناطق',
  '/pricing': 'الأسعار',
  '/price-customization': 'تخصيص الأسعار',
  '/reports': 'التقارير',
  '/settlement': 'التقارير',
  '/notifications': 'الإشعارات',
  '/complaints': 'الشكاوى',
  '/cms': 'الإعدادات',
  '/admins': 'SUPER',
  '/audit-log': 'الإعدادات',
  '/settings': 'الإعدادات',
}
