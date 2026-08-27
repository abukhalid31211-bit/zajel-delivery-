/* ============================================================
   Zajel Store App — إدارة الحالة (State Management)
   كل التدفقات تشتغل فعلياً: تسجيل ← مراجعة ← دخول، إنشاء طلب،
   نظام الطابور بالجدول الزمني المعتمد، التتبع الحي، الإلغاء،
   التعديل، المرتجعات، التقييم، الشكاوى، الإشعارات، الجلسات.
   ============================================================ */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  nowIso, nextSeq, tl, feeFor,
  type Order, type OrderStatus, type StoreProfile,
  type Complaint, type AppNotification, type NotificationKind,
  type NotificationTarget, type LatLng, type Captain,
} from './data'

const LS = {
  profile: 'zajel_store_profile_v1',
  orders: 'zajel_store_orders_v1',
  complaints: 'zajel_store_complaints_v1',
  notifications: 'zajel_store_notifications_v1',
  session: 'zajel_store_session_v1',
  language: 'zajel_store_language_v1',
  draft: 'zajel_store_draft_v1',
}

const SESSION_MINUTES = 30
const REVIEW_SECONDS = 6 // مدة المراجعة الآلية لطلب التسجيل (تُستبدل بقرار الإدارة عبر الـ API)

/* حساب محل تنفيذي/تجريبي — يُستخدم للدخول مباشرة دون Backend (لا يُعرض في الواجهة) */
const DEMO_PHONE = '7888216090'
const DEMO_PASSWORD = '12345678'
const DEMO_PROFILE: StoreProfile = {
  name: 'محل زاجل',
  type: 'مطعم',
  phone: DEMO_PHONE,
  owner: 'صاحب المحل',
  password: DEMO_PASSWORD,
  address: 'بغداد',
  governorate: 'بغداد',
  location: null,
  status: 'approved',
  submittedAt: nowIso(),
  approvedAt: nowIso(),
}

/* أسطول الكباتن المتاح في النظام — يُجلب من الـ API لاحقاً */
const CAPTAINS: Captain[] = [
  { id: 'c1', name: 'كرار الموسوي', phone: '+9647701112233', rating: 4.8, vehicle: 'دراجة نارية', plate: 'بغداد 4521', online: true },
  { id: 'c2', name: 'علي الساعدي', phone: '+9647714455667', rating: 4.6, vehicle: 'دراجة نارية', plate: 'بغداد 8304', online: true },
  { id: 'c3', name: 'محمد الطائي', phone: '+9647728899001', rating: 4.9, vehicle: 'سيارة', plate: 'بغداد 1177', online: true },
  { id: 'c4', name: 'حسين الجبوري', phone: '+9647735566778', rating: 4.5, vehicle: 'دراجة نارية', plate: 'بغداد 6202', online: true },
  { id: 'c5', name: 'أحمد الكعبي', phone: '+9647742233445', rating: 4.7, vehicle: 'دراجة نارية', plate: 'بغداد 9033', online: false },
]

const CAPTAIN_NAMES = CAPTAINS.map((c) => c.name)

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* تجاهل امتلاء التخزين */
  }
}

interface StoreContextValue {
  booted: boolean
  profile: StoreProfile | null
  orders: Order[]
  complaints: Complaint[]
  notifications: AppNotification[]
  language: string
  sessionActive: boolean
  sessionSuspendedForPasswordChange: boolean
  lastRoute: string
  unreadCount: number
  activeOrder: Order | null

  // المصادقة والتسجيل
  login: (phone: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  reauth: (password: string) => boolean
  endSession: (reason: 'expired' | 'password') => void
  rememberRoute: (path: string) => void
  registerStore: (data: Omit<StoreProfile, 'status' | 'submittedAt'>) => void
  resubmit: (data: Omit<StoreProfile, 'status' | 'submittedAt' | 'rejectionReason' | 'submittedAt'>) => void
  updateProfile: (patch: Partial<StoreProfile>, opts?: { sensitive?: boolean }) => void
  changePassword: (current: string, next: string) => { ok: boolean; error?: string }
  setLanguage: (lang: string) => void
  deleteAccountRequest: () => { ok: boolean; error?: string }

  // الطلبات
  createOrder: (input: CreateOrderInput) => Order
  cancelOrder: (id: string, reason: string, detail?: string) => { ok: boolean; error?: string }
  editOrder: (id: string, fields: Partial<{ name: string; phone: string; address: string; value: number; notes: string }>) => { ok: boolean; error?: string }
  confirmReturn: (id: string, note?: string) => void
  rateOrder: (id: string, stars: number, prepared: string, comment?: string) => { ok: boolean; error?: string }

  // الشكاوى
  createComplaint: (input: { orderId?: string; type: string; desc: string; photo?: string }) => Complaint
  closeComplaint: (id: string) => void
  commentComplaint: (id: string, text: string) => void

  // الإشعارات
  markAllRead: () => void
  markRead: (id: string) => void

  // المسودة
  draft: CreateOrderInput | null
  saveDraft: (d: CreateOrderInput | null) => void
}

export interface CreateOrderInput {
  name: string
  phone: string
  notes: string
  address: string
  district: string
  location: LatLng
  value: number
  orderNotes: string
  preferredCaptainId?: string
}

const Ctx = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [booted, setBooted] = useState(false)
  const [profile, setProfile] = useState<StoreProfile | null>(() => load<StoreProfile | null>(LS.profile, null))
  const [orders, setOrders] = useState<Order[]>(() => load<Order[]>(LS.orders, []))
  const [complaints, setComplaints] = useState<Complaint[]>(() => load<Complaint[]>(LS.complaints, []))
  const [notifications, setNotifications] = useState<AppNotification[]>(() => load<AppNotification[]>(LS.notifications, []))
  const [language, setLanguageState] = useState<string>(() => load(LS.language, 'ar'))
  const [sessionActive, setSessionActive] = useState<boolean>(() => {
    const s = load<{ expiresAt: number } | null>(LS.session, null)
    return !!s && Date.now() < s.expiresAt
  })
  const [suspendedForPasswordChange, setSuspendedForPasswordChange] = useState(false)
  const [lastRoute, setLastRoute] = useState<string>('/home')
  const [draft, setDraft] = useState<CreateOrderInput | null>(() => load<CreateOrderInput | null>(LS.draft, null))

  const timers = useRef<number[]>([])
  const ordersRef = useRef(orders)
  useEffect(() => {
    ordersRef.current = orders
  }, [orders])

  useEffect(() => {
    const t = window.setTimeout(() => setBooted(true), 900)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const onStorage = () => {
      /* مزامنة بسيطة بين تبويبات المتصفح */
      setProfile(load(LS.profile, null))
      setOrders(load(LS.orders, []))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /* مزامنة دائمة مع localStorage */
  useEffect(() => save(LS.profile, profile), [profile])
  useEffect(() => save(LS.orders, orders), [orders])
  useEffect(() => save(LS.complaints, complaints), [complaints])
  useEffect(() => save(LS.notifications, notifications), [notifications])
  useEffect(() => save(LS.language, language), [language])
  useEffect(() => save(LS.draft, draft), [draft])

  /* تنظيف المؤقتات عند إغلاق المزود */
  useEffect(() => {
    const list = timers.current
    return () => list.forEach((t) => window.clearTimeout(t))
  }, [])

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms)
    timers.current.push(t)
    return t
  }

  /* ---------------- إشعارات ---------------- */
  const push = (kind: NotificationKind, title: string, body: string, target: NotificationTarget) => {
    const n: AppNotification = { id: `n${nextSeq()}`, kind, title, body, target, createdAt: nowIso(), read: false }
    setNotifications((prev) => [n, ...prev])
  }

  /* ---------------- جلسات ---------------- */
  const startSession = () => {
    save(LS.session, { expiresAt: Date.now() + SESSION_MINUTES * 60000 })
    setSessionActive(true)
    setSuspendedForPasswordChange(false)
  }

  const endSession = (reason: 'expired' | 'password') => {
    save(LS.session, { expiresAt: 0 })
    setSessionActive(false)
    if (reason === 'password') setSuspendedForPasswordChange(true)
  }

  /* انتهاء تلقائي بعد SESSION_MINUTES */
  useEffect(() => {
    if (!sessionActive) return
    const t = later(() => {
      setSessionActive(false)
      push('warning', 'انتهت جلستك', 'لأسباب أمنية، تم تسجيل خروجك. يرجى تسجيل الدخول مرة أخرى.', { type: 'home' })
    }, SESSION_MINUTES * 60000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive])

  /* ---------------- المصادقة ---------------- */
  const login: StoreContextValue['login'] = (phone, password) => {
    const clean = phone.replace(/[\s-]/g, '')
    // الدخول بالحساب التنفيذي الجاهز بدون الحاجة لتسجيل مسبق
    if (clean === DEMO_PHONE && password === DEMO_PASSWORD) {
      if (!profile || profile.phone.replace(/[\s-]/g, '') !== DEMO_PHONE) {
        setProfile({ ...DEMO_PROFILE })
      }
      startSession()
      return { ok: true }
    }
    if (!profile) return { ok: false, error: 'لا يوجد حساب مرتبط بهذا الرقم. سجّل محلك أولاً.' }
    if (profile.phone.replace(/[\s-]/g, '') !== clean) return { ok: false, error: 'لا يوجد حساب مرتبط بهذا الرقم.' }
    if (profile.password !== password) return { ok: false, error: 'كلمة المرور غير صحيحة.' }
    if (profile.status === 'pending') return { ok: false, error: 'محلك قيد المراجعة. لم تتم الموافقة بعد.' }
    if (profile.status === 'rejected') return { ok: false, error: 'تم رفض طلب التسجيل. قدّم طلباً جديداً.' }
    startSession()
    return { ok: true }
  }

  const reauth = (password: string) => {
    if (!profile || profile.password !== password) return false
    startSession()
    return true
  }

  const logout = () => {
    save(LS.session, { expiresAt: 0 })
    setSessionActive(false)
    setSuspendedForPasswordChange(false)
  }

  const rememberRoute = (path: string) => setLastRoute(path)

  /* ---------------- التسجيل ---------------- */
  const registerStore: StoreContextValue['registerStore'] = (data) => {
    const p: StoreProfile = { ...data, status: 'pending', submittedAt: nowIso() }
    setProfile(p)
    /* محاكاة مراجعة الإدارة — تُستبدل بنداء الـ API لقرار الأدمن الفعلي */
    later(() => {
      setProfile((prev) => (prev ? { ...prev, status: 'approved', approvedAt: nowIso() } : prev))
      push('success', 'تمت الموافقة على محلك ✅', 'تم قبول طلب تسجيل محلك. يمكنك الآن البدء باستخدام التطبيق.', { type: 'home' })
    }, REVIEW_SECONDS * 1000)
  }

  const resubmit: StoreContextValue['resubmit'] = (data) => {
    setProfile((prev) => ({
      ...(prev as StoreProfile),
      ...data,
      status: 'pending',
      submittedAt: nowIso(),
      rejectionReason: undefined,
    }))
    later(() => {
      setProfile((prev) => (prev ? { ...prev, status: 'approved', approvedAt: nowIso() } : prev))
      push('success', 'تمت الموافقة على محلك ✅', 'تم قبول طلب إعادة التقديم. يمكنك الآن استخدام التطبيق.', { type: 'home' })
    }, REVIEW_SECONDS * 1000)
  }

  const updateProfile: StoreContextValue['updateProfile'] = (patch, opts) => {
    setProfile((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      if (opts?.sensitive) {
        next.pendingChanges = {
          ...prev.pendingChanges,
          ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
          ...(patch.location ? { location: patch.location } : {}),
          ...(patch.type !== undefined ? { type: patch.type } : {}),
          ...(patch.owner !== undefined ? { owner: patch.owner } : {}),
        }
      }
      return next
    })
  }

  const changePassword: StoreContextValue['changePassword'] = (current, next) => {
    if (!profile) return { ok: false, error: 'لا يوجد حساب.' }
    if (profile.password !== current) return { ok: false, error: 'كلمة المرور الحالية غير صحيحة.' }
    if (next.length < 6) return { ok: false, error: 'كلمة المرور قصيرة جداً (6 أحرف على الأقل).' }
    if (next === current) return { ok: false, error: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية.' }
    setProfile({ ...profile, password: next })
    return { ok: true }
  }

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl'
  }

  const deleteAccountRequest: StoreContextValue['deleteAccountRequest'] = () => {
    const active = orders.filter((o) => ['searching', 'assigned', 'heading', 'arrived', 'picked_up', 'on_way'].includes(o.status))
    if (active.length > 0) return { ok: false, error: 'لا يمكن حذف الحساب: لديك طلبات نشطة لم تُستكمل بعد.' }
    later(() => {
      logout()
      setProfile(null)
      setOrders([])
      setComplaints([])
      setNotifications([])
    }, 1400)
    return { ok: true }
  }

  /* ---------------- نظام الطابور والتتبع الحي ---------------- */

  const assignCaptain = (order: Order) => {
    const online = CAPTAINS.filter((c) => c.online)
    const pick = order.preferredCaptainId ? CAPTAINS.find((c) => c.id === order.preferredCaptainId) : null
    const captain = (pick && pick.online ? pick : online[hashPick(order.id, online.length)]) ?? online[0]
    const ev = tl('captain', 'الكابتن قبل الطلب', `${captain.name} قبل طلبك وهو في طريقه لموقع المحل.`)
    const upd: Order = { ...order, status: 'assigned', captain, attempt: 0, timeline: [...order.timeline, ev] }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? upd : o)))
    push('order', 'تم تعيين كابتن لطلبك', `الكابتن ${captain.name} قبل طلبك وهو في طريقه لمكان المحل.`, { type: 'order', orderId: order.id })

    const chain: [OrderStatus, number, string, string][] = [
      ['heading', 25000, 'الكابتن في طريقه لموقعك', 'الكابتن انطلق نحو محلك لاستلام الطلبية.'],
      ['arrived', 90000, 'الكابتن وصل لموقعك', 'الكابتن وصل إلى محلك لاستلام الطلبية.'],
      ['picked_up', 75000, 'الكابتن استلم الطلب', 'الكابتن استلم الطلبية ودفع الكاش وهو بالطريق للزبون.'],
      ['on_way', 30000, 'الطلب بالطريق للتوصيل', 'الكابتن في طريقه لتسليم الطلبية إلى الزبون.'],
      ['delivered', 110000, 'تم تسليم الطلب بنجاح ✅', 'تم تسليم الطلبية للزبون بنجاح. يمكنك الآن تقييم الكابتن.'],
      ['completed', 45000, 'اكتمل الطلب', 'تم إغلاق الطلب.'],
    ]
    let prevDelay = 0
    chain.forEach(([status, delay, label, body]) => {
      prevDelay += delay
      later(() => {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== order.id || o.status === 'cancelled' || o.status === 'returned') return o
            const next: Order = { ...o, status, timeline: [...o.timeline, tl('captain', label)] }
            if (status === 'picked_up') {
              next.proof = { kind: 'otp', otp: String(Math.floor(1000 + Math.random() * 9000)) }
            }
            return next
          }),
        )
        push('order', label, body, { type: 'order', orderId: order.id })
      }, prevDelay)
    })
  }

  const createOrder: StoreContextValue['createOrder'] = (input) => {
    const fee = profile?.location ? feeFor(profile.location, input.location) : 3000
    const order: Order = {
      id: `ORD-${nextSeq()}`,
      createdAt: nowIso(),
      status: 'searching',
      customer: { name: input.name, phone: input.phone, notes: input.notes },
      dropoff: { address: input.address, district: input.district, location: input.location },
      value: input.value,
      fee,
      total: input.value + fee,
      notes: input.orderNotes,
      preferredCaptainId: input.preferredCaptainId,
      timeline: [tl('store', 'تم إنشاء الطلب', `أنشأ المحل الطلب رقم ${''} بقيمة ${input.value.toLocaleString('en')} د.ع`)],
      editLog: [],
      attempt: 1,
      lastAttemptAt: nowIso(),
    }
    setOrders((prev) => [order, ...prev])
    setDraft(null)
    push('order', 'تم إرسال الطلب بنجاح!', `طلبك قيد البحث عن كابتن قريب. سيتم إشعارك فور قبول كابتن لطلبك.`, { type: 'order', orderId: order.id })

    /* بحث الكابتن — محاكاة استجابة النظام (تُستبدل بـ WebSocket/API) */
    const wait = 18000 + (parseInt(order.id.replace(/\D/g, ''), 10) % 4) * 9000
    later(() => {
      const cur = ordersRef.current.find((o) => o.id === order.id)
      if (cur && cur.status === 'searching') assignCaptain(cur)
    }, wait)

    /* الجدول الزمني المعتمد لنظام الطابور (0-5 / 5-10 / 10-15 / 15 تنبيه / 20 إلغاء تلقائي) */
    const attemptWindows = [
      { at: 5 * 60000, attempt: 2 },
      { at: 10 * 60000, attempt: 3 },
    ]
    attemptWindows.forEach((w) => {
      later(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id && o.status === 'searching'
              ? { ...o, attempt: w.attempt, lastAttemptAt: nowIso(), timeline: [...o.timeline, tl('system', `المحاولة ${w.attempt}: توسيع نطاق البحث`, 'تم توسيع نطاق البحث الجغرافي عن كباتن متاحين.')] }
              : o,
          ),
        )
      }, w.at)
    })

    later(() => {
      const cur = ordersRef.current.find((o) => o.id === order.id)
      if (cur && cur.status === 'searching') {
        push('warning', 'طلب عالق', 'لم يقبل أي كابتن طلبك بعد. تم تنبيه الإدارة لمتابعة الحالة.', { type: 'order', orderId: order.id })
      }
    }, 15 * 60000)

    later(() => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== order.id || o.status !== 'searching') return o
          const upd: Order = {
            ...o,
            status: 'cancelled',
            cancel: { reason: 'لا يوجد كباتن متاحون', detail: 'إلغاء تلقائي بعد 20 دقيقة من البحث', by: 'system' },
            timeline: [...o.timeline, tl('system', 'تم إلغاء الطلب تلقائياً', 'تم إلغاء الطلب تلقائياً لعدم توفر كباتن متاحين حالياً.')],
          }
          return upd
        }),
      )
      push('warning', 'تم إلغاء الطلب تلقائياً', 'تم إلغاء الطلب تلقائياً لعدم توفر كباتن متاحين حالياً. يرجى المحاولة لاحقاً.', { type: 'order', orderId: order.id })
    }, 20 * 60000)

    return order
  }

  const cancelOrder: StoreContextValue['cancelOrder'] = (id, reason, detail) => {
    const order = orders.find((o) => o.id === id)
    if (!order) return { ok: false, error: 'الطلب غير موجود.' }
    if (!canCancelOrderLocal(order.status)) {
      return { ok: false, error: 'لا يمكن إلغاء الطلب بعد استلام الكابتن له. تواصل مع الإدارة.' }
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'cancelled',
              cancel: { reason, detail, by: 'store' },
              timeline: [...o.timeline, tl('store', 'تم إلغاء الطلب', `السبب: ${reason}${detail ? ` — ${detail}` : ''}`)],
            }
          : o,
      ),
    )
    push('warning', 'تم إلغاء الطلب', `تم إلغاء الطلب — السبب: ${reason}. تم إشعار الكابتن والإدارة.`, { type: 'order', orderId: id })
    return { ok: true }
  }

  const editOrder: StoreContextValue['editOrder'] = (id, fields) => {
    const order = orders.find((o) => o.id === id)
    if (!order) return { ok: false, error: 'الطلب غير موجود.' }
    if (!canEditOrderLocal(order.status)) {
      return { ok: false, error: 'لا يمكن تعديل الطلب في المرحلة الحالية.' }
    }
    const keys = Object.keys(fields).filter((k) => (fields as Record<string, unknown>)[k] !== undefined)
    if (order.status !== 'searching' && keys.includes('value')) {
      return { ok: false, error: 'لا يمكن تعديل قيمة الطلبية بعد قبول الكابتن.' }
    }
    if ((order.status === 'heading' || order.status === 'arrived') && keys.some((k) => k !== 'notes')) {
      return { ok: false, error: 'في هذه المرحلة يُسمح بتعديل الملاحظات فقط.' }
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const customer = { ...o.customer, name: fields.name ?? o.customer.name, phone: fields.phone ?? o.customer.phone, notes: fields.notes ?? o.customer.notes }
        const dropoff = { ...o.dropoff, address: fields.address ?? o.dropoff.address }
        const value = fields.value ?? o.value
        return {
          ...o,
          customer,
          dropoff,
          value,
          total: value + o.fee,
          editLog: [...o.editLog, { at: nowIso(), fields: keys }],
          timeline: [...o.timeline, tl('store', 'تم تعديل الطلب', `عدّل المحل: ${keys.join('، ')}. تم إشعار الكابتن بالتغيير.`)],
        }
      }),
    )
    return { ok: true }
  }

  const confirmReturn: StoreContextValue['confirmReturn'] = (id, note) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'returned',
              returned: { at: nowIso(), note },
              timeline: [...o.timeline, tl('store', 'تم تسجيل المرتجع', 'استلم المحل البضاعة بحالتها وأعاد المبلغ النقدي (الكاش) كاملاً للكابتن.')],
            }
          : o,
      ),
    )
    push('warning', 'تم تسجيل المرتجع', 'تم توثيق مرتجع الطلبية وإعادة الكاش للكابتن في كشف الحساب.', { type: 'order', orderId: id })
  }

  const rateOrder: StoreContextValue['rateOrder'] = (id, stars, prepared, comment) => {
    const order = orders.find((o) => o.id === id)
    if (!order) return { ok: false, error: 'الطلب غير موجود.' }
    if (order.rating) return { ok: false, error: 'لا يمكن تقييم نفس الطلب مرتين.' }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, rating: { stars, prepared, comment, at: nowIso() } } : o,
      ),
    )
    push('success', 'شكراً لتقييمك! ⭐', 'تم حفظ تقييمك في ملف الكابتن.', { type: 'order', orderId: id })
    return { ok: true }
  }

  /* ---------------- الشكاوى ---------------- */
  const createComplaint: StoreContextValue['createComplaint'] = (input) => {
    const c: Complaint = {
      id: `SHK-${nextSeq()}`,
      orderId: input.orderId,
      type: input.type,
      desc: input.desc,
      photo: input.photo,
      createdAt: nowIso(),
      status: 'open',
      timeline: [tl('store', 'تم تقديم الشكوى', input.desc.slice(0, 80))],
    }
    setComplaints((prev) => [c, ...prev])
    push('complaint', 'تم إرسال الشكوى بنجاح', `رقم الشكوى: ${c.id}. سيتم مراجعتها من قبل الإدارة خلال 24 ساعة.`, { type: 'complaint', complaintId: c.id })
    /* سير مراجعة الإدارة — يُستبدل بنداء الـ API */
    later(() => {
      setComplaints((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, status: 'reviewing', timeline: [...x.timeline, tl('admin', 'الإدارة تراجع الشكوى')] } : x)),
      )
      push('complaint', 'شكواك قيد المراجعة', `بدأت الإدارة بمراجعة الشكوى ${c.id}.`, { type: 'complaint', complaintId: c.id })
    }, 40000)
    later(() => {
      setComplaints((prev) =>
        prev.map((x) =>
          x.id === c.id
            ? {
                ...x,
                status: 'resolved',
                adminReply: { text: 'تمت مراجعة شكواك ومعالجتها من قبل فريق الإدارة. نعتذر عن الإزعاج ونشكرك على تواصلك.', at: nowIso() },
                timeline: [...x.timeline, tl('admin', 'تم حل الشكوى')],
              }
            : x,
        ),
      )
      push('complaint', 'تم حل شكواك 🟢', `تمت معالجة الشكوى ${c.id} من قبل الإدارة.`, { type: 'complaint', complaintId: c.id })
    }, 130000)
    return c
  }

  const closeComplaint: StoreContextValue['closeComplaint'] = (id) => {
    setComplaints((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: 'closed', timeline: [...x.timeline, tl('store', 'تم إغلاق الشكوى')] } : x)),
    )
  }

  const commentComplaint: StoreContextValue['commentComplaint'] = (id, text) => {
    setComplaints((prev) =>
      prev.map((x) => (x.id === id ? { ...x, timeline: [...x.timeline, tl('store', 'تعليق إضافي', text)] } : x)),
    )
  }

  /* ---------------- الإشعارات ---------------- */
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  const unreadCount = notifications.filter((n) => !n.read).length

  const activeOrder =
    orders.find((o) => ['searching', 'assigned', 'heading', 'arrived', 'picked_up', 'on_way', 'delivered'].includes(o.status)) ?? null

  /* إشعار أهلاً بعد الدخول */
  useEffect(() => {
    if (sessionActive && profile && notifications.length === 0) {
      push('announce', 'أهلاً بك في زاجل محل 👋', 'يمكنك إنشاء طلب توصيل جديد ومتابعته لحظة بلحظة.', { type: 'home' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive])

  const value: StoreContextValue = {
    booted, profile, orders, complaints, notifications, language, sessionActive,
    sessionSuspendedForPasswordChange: suspendedForPasswordChange, lastRoute, unreadCount, activeOrder,
    login, logout, reauth, endSession, rememberRoute,
    registerStore, resubmit, updateProfile, changePassword, setLanguage, deleteAccountRequest,
    createOrder, cancelOrder, editOrder, confirmReturn, rateOrder,
    createComplaint, closeComplaint, commentComplaint,
    markAllRead, markRead,
    draft, saveDraft: setDraft,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function hashPick(seed: string, mod: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h % mod
}

function canCancelOrderLocal(status: OrderStatus) {
  return ['searching', 'assigned', 'heading', 'arrived'].includes(status)
}

function canEditOrderLocal(status: OrderStatus) {
  return ['searching', 'assigned', 'heading', 'arrived'].includes(status)
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { CAPTAIN_NAMES }
