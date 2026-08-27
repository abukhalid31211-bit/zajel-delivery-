import { useEffect, useState } from 'react'
import { dbGet } from './db'
import type { CmsText } from './types'

export const DEFAULT_TEXTS: Record<string, string> = {
  nav_dashboard: 'الرئيسية (Dashboard)',
  nav_orders: 'إدارة الطلبيات',
  nav_active_orders: 'الطلبيات النشطة',
  nav_stuck_orders: 'الطلبيات العالقة ⚠️',
  nav_captains: 'إدارة الكباتن',
  nav_captains_list: 'قائمة الكباتن',
  nav_captains_approval: 'طلبات تسجيل الكباتن',
  nav_shifts: 'شفتات العمل',
  nav_attendance: 'سجل الحضور والغياب',
  nav_stores: 'المحلات والمطاعم',
  nav_stores_list: 'قائمة المحلات',
  nav_stores_approval: 'طلبات المحلات الجديدة',
  nav_geofencing: 'المناطق والجغرافيا',
  nav_governorates: 'المحافظات',
  nav_districts: 'المناطق',
  nav_pricing: 'أسعار التوصيل',
  nav_reports: 'التقارير والمحاسبة',
  nav_settlements: 'التسوية المالية',
  nav_notifications: 'مركز الإشعارات',
  nav_complaints: 'الشكاوى والمشاكل',
  nav_cms: 'إدارة المحتوى (CMS)',
  nav_subadmins: 'الأدمنات الفرعيين والصلاحيات',
  nav_audit_log: 'سجل العمليات (Audit Log)',
  nav_security_log: 'سجل الأمان',
  nav_settings: 'الإعدادات المركزية',
  admin_login_title: 'لوحة إدارة زاجل ديلفري',
  admin_login_subtitle: 'يوصلك بسرعة وثقة — أدخل بيانات الحساب للدخول',
  field_phone_label: 'رقم الهاتف',
  field_password_label: 'كلمة المرور',
  btn_admin_login: 'تسجيل الدخول للوحة التحكم',
  forgot_password_link: 'نسيت كلمة المرور؟',
  err_invalid_credentials: 'رقم الهاتف أو كلمة المرور غير صحيحة',
  common_save: 'حفظ',
  common_cancel: 'إلغاء',
  common_search: 'بحث',
  common_logout: 'تسجيل الخروج',
  stat_today_orders: 'طلبيات اليوم',
  stat_active_orders: 'الطلبيات النشطة الآن',
  stat_online_captains: 'الكباتن المتصلون',
  stat_unassigned_orders: 'طلبيات بدون كابتن',
  search_placeholder: 'ابحث عن طلب، كابتن، محل، رقم هاتف...',
  search_min: 'اكتب 3 أحرف على الأقل لعرض النتائج الفورية',
  search_none: 'لا توجد نتائج مطابقة',
}

export function t(key: string) {
  const texts = dbGet<CmsText[]>('cmsTexts', [])
  const hit = texts.find((x) => x.key === key)
  if (hit?.ar) return hit.ar
  return DEFAULT_TEXTS[key] || key
}

export function notifyCms() {
  window.dispatchEvent(new Event('zajel-cms'))
}

export function useT() {
  const [, setN] = useState(0)
  useEffect(() => {
    const fn = () => setN((n) => n + 1)
    window.addEventListener('zajel-cms', fn)
    return () => window.removeEventListener('zajel-cms', fn)
  }, [])
  return t
}
