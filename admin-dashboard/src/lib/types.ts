export type Governorate = { id: string; name: string; enabled: boolean }
export type District = {
  id: string
  govId: string
  name: string
  enabled: boolean
  points: { x: number; y: number }[]
}
export type PriceRoute = { id: string; govId: string; fromId: string; toId: string; price: string }
export type GeoPrice = { id: string; districtId: string; base: string; perKm: string }
export type Shift = { id: string; name: string; start: string; end: string; enabled: boolean }
export type Captain = {
  id: string
  name: string
  phone: string
  email: string
  govId: string
  districtIds: string[]
  shiftId: string
  vehicle: string
  status: 'نشط' | 'بانتظار الموافقة' | 'موقوف' | 'مرفوض'
  rating: string
  createdAt: string
  rejectReason?: string
  reapply?: boolean
}
export type StoreItem = {
  id: string
  name: string
  type: string
  phone: string
  owner: string
  address: string
  govId: string
  districtId: string
  status: 'نشط' | 'بانتظار الموافقة' | 'موقوف'
  createdAt: string
}
export type StoreChange = {
  id: string
  storeId: string
  field: string
  oldValue: string
  newValue: string
  createdAt: string
  status: 'معلق' | 'مقبول' | 'مرفوض'
}
export type AdminUser = {
  id: string
  name: string
  phone: string
  password: string
  role: string
  enabled: boolean
  lastLogin?: string
  govIds: string[]
  districtIds: string[]
  perms: Record<string, string[]>
}
export type SentNotification = {
  id: string
  title: string
  body: string
  audience: string
  priority: string
  count: number
  sender: string
  createdAt: string
}
export type Complaint = {
  id: string
  type: string
  submitter: string
  orderId: string
  status: 'مفتوحة' | 'قيد المراجعة' | 'محلولة'
  desc: string
  createdAt: string
  notes: string
  timeline: { at: string; text: string }[]
}
export type AuditEntry = {
  id: string
  at: string
  admin: string
  action: string
  entity: string
  details: string
  oldValue: string
  newValue: string
}
export type SecurityEntry = {
  id: string
  at: string
  type: string
  user: string
  ip: string
  device: string
  result: 'نجاح' | 'فشل'
  details: string
}
export type CmsPage = {
  id: string
  name: string
  place: string
  status: 'منشورة' | 'مسودة'
  title: string
  subtitle: string
  content: string
  updatedAt: string
}
export type CmsText = { id: string; key: string; ar: string; en: string; ku: string; place: string }
export type CmsTemplate = {
  id: string
  event: string
  to: string
  channel: string
  title: string
  body: string
}
export type CmsAuto = { id: string; state: string; message: string; app: string }
export type CmsFaq = { id: string; q: string; a: string; order: string; app: string }
export type CmsBanner = {
  id: string
  title: string
  app: string
  order: string
  active: boolean
  from: string
  to: string
  image?: string
  link?: string
}
export type BackupItem = { id: string; at: string; size: string; status: string }
export type CmsLegal = { id: string; title: string; body: string; enabled: boolean }

export type OrderEvent = { at: string; text: string }
export type OrderItem = {
  id: string
  number: string
  storeId: string
  storeName: string
  customerName: string
  customerPhone: string
  govId: string
  districtId: string
  districtName: string
  captainId: string
  captainName: string
  status: string
  value: string
  fee: string
  notes: string
  createdAt: string
  waitingStartedAt?: string
  attempts: number
  timeline: OrderEvent[]
}
