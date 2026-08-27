/* ============================================================
   Zajel Store App — طبقة البيانات والمنطق
   بدون أي بيانات وهمية (Mock). القوائم الثابتة هنا هي قوائم
   نظام معتمدة من الوثيقة التنفيذية (المحافظات، أسباب الإلغاء،
   أنواع الشكاوى...) ومنطق خالص قابل للربط المباشر مع Back-end.
   ============================================================ */

export type LatLng = { lat: number; lng: number }

export type OrderStatus =
  | 'searching' // بانتظار كابتن
  | 'assigned' // كابتن قبل الطلب
  | 'heading' // متوجه للمحل
  | 'arrived' // وصل المحل
  | 'picked_up' // استلم الطلب
  | 'on_way' // بالطريق للتوصيل
  | 'delivered' // تم التسليم
  | 'completed' // مكتمل
  | 'cancelled' // ملغي
  | 'returned' // مرتجع

export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export type ComplaintStatus = 'open' | 'reviewing' | 'resolved' | 'closed'

export type UpdateSource = 'store' | 'captain' | 'admin' | 'system'

export type NotificationKind = 'order' | 'warning' | 'success' | 'announce' | 'complaint'

export type NotificationTarget =
  | { type: 'order'; orderId: string }
  | { type: 'complaint'; complaintId: string }
  | { type: 'home' }
  | { type: 'orders' }
  | { type: 'profile' }
  | { type: 'register' }

export interface StoreProfile {
  name: string
  type: string
  phone: string
  owner: string
  password: string
  address: string
  governorate: string
  location: LatLng | null
  status: StoreStatus
  rejectionReason?: string
  submittedAt: string
  approvedAt?: string
  logo?: string // صورة المحل (Data URL من رفع المستخدم)
  pendingChanges?: { phone?: string; location?: LatLng; type?: string; owner?: string }
}

export interface Customer {
  name: string
  phone: string
  notes?: string
}

export interface Captain {
  id: string
  name: string
  phone: string
  rating: number
  vehicle: string
  plate: string
  online: boolean
}

export interface Proof {
  kind: 'otp' | 'photo'
  otp?: string
  note?: string
}

export interface TimelineEvent {
  at: string
  source: UpdateSource
  label: string
  detail?: string
}

export interface Order {
  id: string
  createdAt: string
  status: OrderStatus
  customer: Customer
  dropoff: { address: string; district: string; location: LatLng }
  value: number
  fee: number
  total: number
  notes?: string
  preferredCaptainId?: string
  captain?: Captain
  timeline: TimelineEvent[]
  editLog: { at: string; fields: string[] }[]
  proof?: Proof
  cancel?: { reason: string; detail?: string; by: UpdateSource }
  returned?: { at: string; note?: string }
  rating?: { stars: number; prepared: string; comment?: string; at: string }
  attempt: number
  lastAttemptAt?: string
}

export interface Complaint {
  id: string
  orderId?: string
  type: string
  desc: string
  photo?: string
  createdAt: string
  status: ComplaintStatus
  timeline: TimelineEvent[]
  adminReply?: { text: string; at: string }
}

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  target: NotificationTarget
  createdAt: string
  read: boolean
}

/* ---------------- قوائم النظام المعتمدة (من الوثيقة) ---------------- */

export const BUSINESS_TYPES = [
  { label: 'مطعم 🍕', icon: 'Pizza' },
  { label: 'سوبرماركت / مأكولات 🛒', icon: 'ShoppingCart' },
  { label: 'صيدلية 💊', icon: 'Pill' },
  { label: 'محل تجاري / متجر 🛍️', icon: 'ShoppingBag' },
]

export const GOVERNORATES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'كركوك', 'الأنبار', 'ديالى', 'واسط',
  'ميسان', 'ذي قار', 'المثنى', 'القادسية', 'بابل', 'صلاح الدين', 'دهوك', 'السليمانية',
]

export interface Zone {
  name: string
  governorate: string
  center: LatLng
  radiusKm: number
}

/** مناطق التغطية الجغرافية (Geofencing) — تُدار من لوحة الإدارة وتُجلب من الـ API لاحقاً */
export const SERVICE_ZONES: Zone[] = [
  { name: 'المنصور', governorate: 'بغداد', center: { lat: 33.311, lng: 44.345 }, radiusKm: 2.4 },
  { name: 'الكرادة', governorate: 'بغداد', center: { lat: 33.296, lng: 44.428 }, radiusKm: 2.2 },
  { name: 'الأعظمية', governorate: 'بغداد', center: { lat: 33.375, lng: 44.365 }, radiusKm: 2.3 },
  { name: 'زيونة', governorate: 'بغداد', center: { lat: 33.322, lng: 44.442 }, radiusKm: 2.0 },
  { name: 'الجادريه', governorate: 'بغداد', center: { lat: 33.283, lng: 44.385 }, radiusKm: 2.0 },
  { name: 'البياع', governorate: 'بغداد', center: { lat: 33.262, lng: 44.339 }, radiusKm: 2.2 },
  { name: 'الحرية', governorate: 'بغداد', center: { lat: 33.345, lng: 44.302 }, radiusKm: 2.1 },
  { name: 'مدينة الصدر', governorate: 'بغداد', center: { lat: 33.356, lng: 44.412 }, radiusKm: 2.3 },
  { name: 'الدورة', governorate: 'بغداد', center: { lat: 33.244, lng: 44.399 }, radiusKm: 2.1 },
]

export const CANCEL_REASONS = ['الزبون ألغى', 'خطأ في البيانات', 'تأخر الكابتن', 'لا يوجد كباتن متاحون', 'أخرى']

export const COMPLAINT_TYPES = [
  '🚚 مشكلة في التوصيل (تأخر، ضياع، تلف)',
  '💰 مشكلة في المبلغ (دفع ناقص، رفض دفع)',
  '📦 مشكلة في التسليم (تسليم خاطئ، إثبات مزور)',
  '🤝 مشكلة مع الطرف الآخر (كابتن / محل)',
  '📱 مشكلة تقنية (التطبيق، الموقع، الإشعارات)',
  '❓ أخرى',
]

export const ORDER_STAGES: { key: string; label: string; at: OrderStatus }[] = [
  { key: 'created', label: 'طلب جديد', at: 'searching' },
  { key: 'searching', label: 'انتظار كابتن', at: 'searching' },
  { key: 'assigned', label: 'قبول', at: 'assigned' },
  { key: 'heading', label: 'متوجه', at: 'heading' },
  { key: 'arrived', label: 'وصل المحل', at: 'arrived' },
  { key: 'picked_up', label: 'استلام', at: 'picked_up' },
  { key: 'on_way', label: 'بالطريق', at: 'on_way' },
  { key: 'delivered', label: 'تسليم', at: 'delivered' },
  { key: 'completed', label: 'مكتمل', at: 'completed' },
]

export const STATUS_META: Record<OrderStatus, { label: string; emoji: string; cls: string }> = {
  searching: { label: 'بانتظار كابتن', emoji: '🟡', cls: 'bg-gold-soft text-gold-deep' },
  assigned: { label: 'كابتن قبل الطلب', emoji: '🔵', cls: 'bg-gold-soft text-gold-deep' },
  heading: { label: 'الكابتن متوجه للمحل', emoji: '🔵', cls: 'bg-gold-soft text-gold-deep' },
  arrived: { label: 'الكابتن وصل المحل', emoji: '🔵', cls: 'bg-gold-soft text-gold-deep' },
  picked_up: { label: 'استلم الكابتن الطلب', emoji: '🔵', cls: 'bg-gold-soft text-gold-deep' },
  on_way: { label: 'بالطريق للتوصيل', emoji: '🟡', cls: 'bg-gold-soft text-gold-deep' },
  delivered: { label: 'تم التسليم', emoji: '🟢', cls: 'bg-gold text-white' },
  completed: { label: 'مكتمل', emoji: '🟢', cls: 'bg-gold text-white' },
  cancelled: { label: 'ملغي', emoji: '🔴', cls: 'bg-line text-ink' },
  returned: { label: 'مرتجع', emoji: '↩️', cls: 'bg-line text-ink' },
}

export const COMPLAINT_STATUS_META: Record<ComplaintStatus, { label: string; emoji: string; cls: string }> = {
  open: { label: 'مفتوحة', emoji: '🔴', cls: 'bg-gold-soft text-gold-deep' },
  reviewing: { label: 'قيد المراجعة', emoji: '🟡', cls: 'bg-gold-soft text-gold-deep' },
  resolved: { label: 'محلولة', emoji: '🟢', cls: 'bg-gold text-white' },
  closed: { label: 'مغلقة', emoji: '⚪', cls: 'bg-line text-ink' },
}

/** قواعد تعديل الطلب حسب المرحلة — الجدول المعتمد في الوثيقة (القسم 6.3) */
export function editableFields(status: OrderStatus): { label: string; key: string; locked?: boolean }[] {
  const all = [
    { label: 'اسم الزبون', key: 'name' },
    { label: 'رقم هاتف الزبون', key: 'phone' },
    { label: 'عنوان التوصيل', key: 'address' },
    { label: 'قيمة الطلبية', key: 'value' },
    { label: 'الملاحظات', key: 'notes' },
  ]
  if (status === 'searching') return all.map((f) => ({ ...f }))
  if (status === 'assigned') return all.map((f) => ({ ...f, locked: f.key === 'value' }))
  if (status === 'heading' || status === 'arrived') return all.map((f) => ({ ...f, locked: f.key !== 'notes' }))
  return all.map((f) => ({ ...f, locked: true })) // بعد الاستلام: ممنوع التعديل منعاً باتاً
}

export function canEditOrder(status: OrderStatus): boolean {
  return status === 'searching' || status === 'assigned' || status === 'heading' || status === 'arrived'
}

export function canCancelOrder(status: OrderStatus): boolean {
  return status === 'searching' || status === 'assigned' || status === 'heading' || status === 'arrived'
}

/* ---------------- أدوات مساعدة خالصة ---------------- */

export const nowIso = () => new Date().toISOString()

let seq = 0
export const nextSeq = () => {
  seq += 1
  return String(seq).padStart(4, '0')
}

export const fmtNum = (n: number) => n.toLocaleString('en-US')
export const fmtIQD = (n: number) => `${fmtNum(n)} د.ع`

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })

export const fmtDateTime = (iso: string) => `${fmtDate(iso)} — ${fmtTime(iso)}`

export function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'الآن'
  if (min < 60) return `منذ ${min} دقيقة`
  const h = Math.floor(min / 60)
  if (h < 24) return `منذ ${h} ساعة`
  const d = Math.floor(h / 24)
  if (d === 1) return 'أمس'
  return `منذ ${d} يوم`
}

export function minutesBetween(a: string, b: string): number {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000))
}

/** المسافة بين نقطتين بالكيلومتر (Haversine) */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

export const etaMin = (km: number) => Math.max(1, Math.round(km / 0.45))

/** تحديد المنطقة الجغرافية لنقطة ما (Geofencing) */
export function zoneFor(pos: LatLng): Zone | null {
  let best: Zone | null = null
  let bestDist = Infinity
  for (const z of SERVICE_ZONES) {
    const d = distanceKm(pos, z.center)
    if (d <= z.radiusKm && d < bestDist) {
      best = z
      bestDist = d
    }
  }
  return best
}

/** حساب أجرة التوصيل: قاعدة 3,000 + 400 د.ع لكل كم، بحد أقصى 10,000 (من محرك الأسعار) */
export function feeFor(storePos: LatLng, dropoffPos: LatLng): number {
  const km = distanceKm(storePos, dropoffPos)
  const raw = 3000 + Math.round(km * 400)
  const capped = Math.min(10000, Math.max(3000, raw))
  return Math.round(capped / 250) * 250
}

export function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }
}

export function strengthOf(pass: string): { label: string; pct: number } | null {
  if (!pass) return null
  if (pass.length < 6) return { label: 'ضعيفة', pct: 33 }
  if (pass.length <= 8) return { label: 'متوسطة', pct: 66 }
  return { label: 'قوية', pct: 100 }
}

export function isValidIraqiPhone(p: string): boolean {
  return /^7\d{9}$/.test(p.replace(/\s/g, ''))
}

/* ---------------- سجل أحداث مختصر ---------------- */
export function tl(source: UpdateSource, label: string, detail?: string): TimelineEvent {
  return { at: nowIso(), source, label, detail }
}
