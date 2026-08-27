import { dbGet, dbSet } from './db'

export type AppSettings = {
  maintenance: boolean
  maintenanceMessage: string
  pricingMode: 'route' | 'geo'
  otpProof: boolean
  photoProof: boolean
  deliveryProof: 'مطلوب' | 'اختياري' | 'معطّل'
  otpMechanism: 'SMS تلقائي' | 'المحل يولّد الرمز' | 'الكابتن يولّد الرمز' | 'معطّل'
  whoPays: 'الزبون' | 'المحل' | 'حسب الطلب'
  customerCancel: string
  customerNoPay: 'إرجاع للمحل' | 'إلغاء' | 'تحويل للإدارة'
  editOrder: boolean
  storeDailyLimit: number
  storePickCaptain: boolean
  queueWaitMin: number
  maxActiveOrders: number
  stuckAlertMin: number
  considerLocation: boolean
  considerActiveCount: boolean
  considerPriority: boolean
  shiftChangePerWeek: number
  cancelRequireReason: boolean
  cancelWho: string[]
  cancelReasons: string[]
  captainMinVersion: string
  captainForceUpdate: boolean
  captainUpdateMsg: string
  storeMinVersion: string
  storeForceUpdate: boolean
  storeUpdateMsg: string
  autoBackup: boolean
  backupFreq: 'يومياً' | 'أسبوعياً' | 'شهرياً'
  backupTime: string
  vehicleTypes: string[]
}

export const defaultSettings: AppSettings = {
  maintenance: false,
  maintenanceMessage: 'النظام في وضع صيانة مؤقت. نعتذر عن الإزعاج.',
  pricingMode: 'route',
  otpProof: true,
  photoProof: true,
  deliveryProof: 'مطلوب',
  otpMechanism: 'SMS تلقائي',
  whoPays: 'الزبون',
  customerCancel: 'يُلغى الطلب ويُعاد إشعار المحل والكابتن',
  customerNoPay: 'تحويل للإدارة',
  editOrder: false,
  storeDailyLimit: 0,
  storePickCaptain: false,
  queueWaitMin: 5,
  maxActiveOrders: 3,
  stuckAlertMin: 15,
  considerLocation: true,
  considerActiveCount: true,
  considerPriority: false,
  shiftChangePerWeek: 1,
  cancelRequireReason: true,
  cancelWho: ['المحل', 'الكابتن', 'الإدارة'],
  cancelReasons: ['طلب من المحل', 'مشكلة مع الكابتن', 'خطأ في البيانات', 'أخرى'],
  captainMinVersion: '1.0.0',
  captainForceUpdate: false,
  captainUpdateMsg: 'يرجى تحديث التطبيق للمتابعة.',
  storeMinVersion: '1.0.0',
  storeForceUpdate: false,
  storeUpdateMsg: 'يرجى تحديث التطبيق للمتابعة.',
  autoBackup: true,
  backupFreq: 'يومياً',
  backupTime: '03:00',
  vehicleTypes: ['دراجة نارية 🏍️', 'سيارة 🚗', 'دراجة هوائية 🚲', 'مشي 🚶'],
}

export function getSettings(): AppSettings {
  return { ...defaultSettings, ...dbGet<Partial<AppSettings>>('settings', {}) }
}

export function saveSettings(s: AppSettings) {
  dbSet('settings', s)
}

export type ThemeColors = {
  primary: string
  secondary: string
  page: string
  text: string
  line: string
  success: string
  warn: string
  error: string
  info: string
  btn: string
  btnText: string
  btn2: string
  btn2Border: string
  darkMode: boolean
  autoDark: boolean
}

export const defaultTheme: ThemeColors = {
  primary: '#000000',
  secondary: '#FFFFFF',
  page: '#F5F5F5',
  text: '#000000',
  line: '#E0E0E0',
  success: '#000000',
  warn: '#666666',
  error: '#333333',
  info: '#999999',
  btn: '#000000',
  btnText: '#FFFFFF',
  btn2: '#FFFFFF',
  btn2Border: '#000000',
  darkMode: false,
  autoDark: false,
}

export function getTheme(): ThemeColors {
  return { ...defaultTheme, ...dbGet<Partial<ThemeColors>>('theme', {}) }
}

export function applyTheme(t: ThemeColors) {
  dbSet('theme', t)
  const root = document.documentElement
  const dark = t.darkMode
  root.style.setProperty('--color-ink', dark ? '#ffffff' : t.text)
  root.style.setProperty('--color-paper', dark ? '#111111' : t.secondary)
  root.style.setProperty('--color-page', dark ? '#000000' : t.page)
  root.style.setProperty('--color-line', dark ? '#333333' : t.line)
  root.style.setProperty('--color-mute', dark ? '#bbbbbb' : '#666666')
  root.style.setProperty('--color-faint', dark ? '#888888' : '#999999')
  root.style.setProperty('--color-btn', t.btn)
  root.style.setProperty('--color-btn-text', t.btnText)
}

export type Brand = {
  name: string
  short: string
  logoText: boolean
  logoTextValue: string
  logoW: number
  logoH: number
  logo?: string
  icon?: string
}

export const defaultBrand: Brand = {
  name: 'زاجل ديلفري — Zajel Delivery',
  short: 'زاجل',
  logoText: true,
  logoTextValue: 'زاجل ديلفري',
  logoW: 120,
  logoH: 40,
}

export function getBrand(): Brand {
  return { ...defaultBrand, ...dbGet<Partial<Brand>>('brand', {}) }
}

export function saveBrand(b: Brand) {
  dbSet('brand', b)
}
