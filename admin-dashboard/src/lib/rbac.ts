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

export function inGeoScope(govId?: string) {
  if (isSuper()) return true
  const s = getSession()
  if (!s?.govIds?.length) return true
  if (!govId) return true
  return s.govIds.includes(govId)
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
