import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/* ------------------------------------------------------------------ */
/* أنواع البيانات                                                      */
/* ------------------------------------------------------------------ */

export type AccountStatus = 'pending' | 'active' | 'suspended' | 'rejected'

export type OrderStage =
  | 'new'
  | 'accepted'
  | 'toShop'
  | 'atShop'
  | 'toCustomer'
  | 'delivered'
  | 'canceled'
  | 'returned'
  | 'awaitRefund'
  | 'refunded'

export interface Captain {
  name: string
  phone: string
  password: string
  gmail: string
  gov: string
  vehicle: string
  docs: boolean[]
  status: AccountStatus
  statusReason: string
  shiftId: string
  shiftChangesLeft: number
  online: boolean
  checkIn: string
  checkOut: string
}

export interface Order {
  id: string
  title: string
  shopName: string
  shopPhone: string
  shopAddress: string
  pickupArea: string
  dropArea: string
  itemPrice: number
  deliveryFee: number
  note: string
  customerName: string
  customerPhone: string
  customerAddress: string
  stage: OrderStage
  createdAt: string
  acceptedAt?: string
  arrivedShopAt?: string
  pickedAt?: string
  arrivedCustomerAt?: string
  deliveredAt?: string
  canceledAt?: string
  cancelReason?: string
  problem?: string
  problemAction?: 'wait' | 'return'
  returnedAt?: string
  refundConfirmedAt?: string
  refundReceived?: boolean
  otpCode?: string
  photoProof?: boolean
  photoPickup?: boolean
  oTptAttempts: number
  adminNote?: string
}

export interface Complaint {
  id: string
  orderId: string
  type: string
  desc: string
  photo: boolean
  status: 'open' | 'review' | 'resolved'
  createdAt: string
  adminReply?: string
  comments: { at: string; text: string }[]
}

export interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
  target?: string
}

export interface LedgerEntry {
  id: string
  orderId: string
  shopName: string
  customerName: string
  paidToShop: number
  collectedFromCustomer: number
  deliveryFee: number
  refund: number
  at: string
  type: 'delivered' | 'returned' | 'canceled'
}

export interface Rating {
  id: string
  orderId: string
  ready: string
  treat: string
  stars: number
  comment: string
  createdAt: string
}

interface AppState {
  captain: Captain | null
  orders: Order[]
  complaints: Complaint[]
  notifications: AppNotification[]
  ledger: LedgerEntry[]
  ratings: Rating[]
  language: 'ar' | 'en' | 'ku'
  activeOrderId: string
  lastLocation: string
}

/* ------------------------------------------------------------------ */
/* الحالة الابتدائية                                                    */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'zajel-captain-state-v1'

/** حساب كابتن تجريبي/تنفيذي — يُستخدم للدخول مباشرة دون Backend */
const DEMO_PHONE = '7888216090'
const DEMO_PASS = '12345678'
const DEMO_NAME = 'كابتن زاجل'

const initial: AppState = {
  captain: null,
  orders: [],
  complaints: [],
  notifications: [],
  ledger: [],
  ratings: [],
  language: 'ar',
  activeOrderId: '',
  lastLocation: '',
}

function uid(prefix = '') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial
    const parsed = JSON.parse(raw)
    return { ...initial, ...parsed }
  } catch {
    return initial
  }
}

function persistState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* تجاهل أخطاء التخزين المحلي */
  }
}

function now() {
  return new Date().toISOString()
}

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ar')
  } catch {
    return iso
  }
}

function money(n: number) {
  return `${(n || 0).toLocaleString('en-US')} د.ع`
}

/* ------------------------------------------------------------------ */
/* الـ Context                                                         */
/* ------------------------------------------------------------------ */

interface DemoOrderInput {
  shopName: string
  shopPhone: string
  shopAddress: string
  pickupArea: string
  dropArea: string
  itemPrice: number
  deliveryFee: number
  note: string
  customerName: string
  customerPhone: string
  customerAddress: string
}

interface CaptainCtx {
  state: AppState
  captainName: (id?: string) => string
  shopName: (id?: string) => string
  orderPrice: (o: Order) => number
  orderTotal: (o: Order) => number
  fmtTime: (iso: string) => string
  fmtDate: (iso: string) => string
  money: (n: number) => string

  register: (data: Omit<Captain, 'status' | 'statusReason' | 'shiftId' | 'shiftChangesLeft' | 'online' | 'checkIn' | 'checkOut'>) => boolean
  login: (phone: string, password: string) => boolean
  logout: () => void
  changePassword: (current: string, next: string) => boolean
  setStatus: (status: AccountStatus, reason?: string) => void

  setLanguage: (l: AppState['language']) => void
  pickShift: (id: string) => void
  consumeShiftChange: () => void
  setOnline: (online: boolean) => void
  checkIn: () => void
  checkOut: () => void

  createDemoOrder: (input: DemoOrderInput) => string
  acceptOrder: (id: string) => void
  rejectOrder: (id: string, byTimeout?: boolean) => void
  arriveShop: (id: string) => void
  pickup: (id: string, photo: boolean) => void
  toCustomer: (id: string) => void
  sendSmsOtp: (id: string) => void
  completeDelivery: (id: string, otp: string, photo: boolean) => string | null
  cancelOrder: (id: string, reason: string, details?: string) => void
  reportProblem: (id: string, problem: string, action: 'wait' | 'return') => void
  arriveReturn: (id: string) => void
  confirmRefund: (id: string, received: boolean) => void
  rateStore: (id: string, data: { ready: string; treat: string; stars: number; comment: string }) => void
  sendEmergency: (desc?: string) => void

  addComplaint: (data: { orderId: string; type: string; desc: string; photo: boolean }) => string
  addComment: (complaintId: string, text: string) => void
  closeComplaint: (complaintId: string) => void
  setComplaintStatus: (complaintId: string, status: Complaint['status']) => void
  markAllRead: () => void
  markRead: (id: string) => void

  setActiveOrder: (id: string) => void
  getOrder: (id?: string) => Order | undefined
  getActiveOrder: () => Order | undefined
  getLedgerForOrder: (id: string) => LedgerEntry[]
}

const Ctx = createContext<CaptainCtx | null>(null)

export function CaptainProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)

  useEffect(() => {
    persistState(state)
  }, [state])

  const register: CaptainCtx['register'] = (data) => {
    const exists = state.captain && state.captain.phone.replace(/\D/g, '') === data.phone.replace(/\D/g, '')
    if (exists) return false
    setState((s) => ({
      ...s,
      captain: {
        ...data,
        status: 'pending',
        statusReason: '',
        shiftId: '',
        shiftChangesLeft: 1,
        online: false,
        checkIn: '',
        checkOut: '',
      },
    }))
    return true
  }

  const login: CaptainCtx['login'] = (phone, password) => {
    const clean = phone.replace(/\D/g, '')
    // الدخول بالحساب التنفيذي الجاهز بدون الحاجة لتسجيل مسبق
    if (clean === DEMO_PHONE && password === DEMO_PASS) {
      setState((s) => ({
        ...s,
        captain: s.captain && s.captain.phone.replace(/\D/g, '') === clean
          ? s.captain
          : {
              name: DEMO_NAME,
              phone: DEMO_PHONE,
              password: DEMO_PASS,
              gmail: '',
              gov: '',
              vehicle: 'دراجة نارية 🏍️',
              docs: [true, true, true, true],
              status: 'active',
              statusReason: '',
              shiftId: s.captain?.shiftId || '',
              shiftChangesLeft: s.captain?.shiftChangesLeft ?? 1,
              online: s.captain?.online || false,
              checkIn: s.captain?.checkIn || '',
              checkOut: s.captain?.checkOut || '',
            },
      }))
      return true
    }
    if (!state.captain) return false
    const okPhone = state.captain.phone.replace(/\D/g, '') === clean
    if (!okPhone || state.captain.password !== password) return false
    return true
  }

  const logout = () => setState((s) => ({ ...s, captain: null, activeOrderId: '' }))

  const changePassword: CaptainCtx['changePassword'] = (current, next) => {
    if (!state.captain) return false
    if (state.captain.password !== current) return false
    setState((s) => (s.captain ? { ...s, captain: { ...s.captain, password: next } } : s))
    return true
  }

  const setStatus: CaptainCtx['setStatus'] = (status, reason = '') =>
    setState((s) => ({
      ...s,
      captain: s.captain ? { ...s.captain, status, statusReason: reason } : s.captain,
    }))

  const setLanguage = (language: AppState['language']) => setState((s) => ({ ...s, language }))

  const pickShift = (shiftId: string) =>
    setState((s) =>
      s.captain && !s.captain.shiftId
        ? { ...s, captain: { ...s.captain, shiftId } }
        : s,
    )

  const consumeShiftChange = () =>
    setState((s) =>
      s.captain && s.captain.shiftChangesLeft > 0
        ? { ...s, captain: { ...s.captain, shiftChangesLeft: s.captain.shiftChangesLeft - 1 } }
        : s,
    )

  const setOnline = (online: boolean) =>
    setState((s) => (s.captain ? { ...s, captain: { ...s.captain, online } } : s))

  const checkIn = () =>
    setState((s) =>
      s.captain ? { ...s, captain: { ...s.captain, checkIn: s.captain.checkIn || now() } } : s,
    )

  const checkOut = () =>
    setState((s) =>
      s.captain ? { ...s, captain: { ...s.captain, checkOut: now() } } : s,
    )

  const createDemoOrder: CaptainCtx['createDemoOrder'] = (input) => {
    const id = uid('o')
    const title = `طلب #${id.slice(-5).toUpperCase()}`
    setState((s) => ({
      ...s,
      activeOrderId: id,
      orders: [
        {
          id,
          title,
          ...input,
          stage: 'new',
          createdAt: now(),
          oTptAttempts: 0,
        },
        ...s.orders,
      ],
      notifications: [
        {
          id: uid('n'),
          type: 'order',
          title: '🚚 طلبية جديدة',
          body: `${title} من ${input.shopName} في ${input.pickupArea}`,
          read: false,
          createdAt: now(),
          target: id,
        },
        ...s.notifications,
      ].slice(0, 120),
    }))
    return id
  }

  const acceptOrder: CaptainCtx['acceptOrder'] = (id) => {
    setState((s) => {
      const orders = s.orders.map((o) =>
        o.id === id ? { ...o, stage: 'toShop' as OrderStage, acceptedAt: now() } : o,
      )
      const o = orders.find((x) => x.id === id)
      return {
        ...s,
        activeOrderId: id,
        orders,
        notifications: [
          {
            id: uid('n'),
            type: 'success',
            title: 'تم قبول الطلب',
            body: o ? `قبلت الطلب من ${o.shopName} ✅` : 'تم قبول الطلب',
            read: false,
            createdAt: now(),
            target: id,
          },
          ...s.notifications,
        ].slice(0, 120),
      }
    })
  }

  const rejectOrder: CaptainCtx['rejectOrder'] = (id, byTimeout = false) => {
    setState((s) => {
      const affected = s.orders.find((o) => o.id === id)
      return {
        ...s,
        activeOrderId: '',
        orders: s.orders.filter((o) => o.id !== id),
        notifications: [
          {
            id: uid('n'),
            type: 'alert',
            title: byTimeout ? 'انتهت مهلة الاستجابة' : 'تم رفض الطلب',
            body: affected
              ? `${byTimeout ? 'انتهت مهلة الاستجابة، أُرسل الطلب لكابتن آخر' : 'أُرسل الطلب لكابتن آخر'} (${affected.shopName})`
              : '',
            read: false,
            createdAt: now(),
          },
          ...s.notifications,
        ].slice(0, 120),
      }
    })
  }

  const arriveShop: CaptainCtx['arriveShop'] = (id) =>
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, stage: 'atShop' as OrderStage, arrivedShopAt: now() } : o,
      ),
    }))

  const pickup: CaptainCtx['pickup'] = (id, photo) =>
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, stage: 'toCustomer' as OrderStage, pickedAt: now(), photoPickup: photo } : o,
      ),
    }))

  const toCustomer: CaptainCtx['toCustomer'] = (id) =>
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, arrivedCustomerAt: now() } : o,
      ),
    }))

  const sendSmsOtp: CaptainCtx['sendSmsOtp'] = (id) => {
    const code = String(Math.floor(1000 + Math.random() * 9000))
    setState((s) => {
      const o = s.orders.find((x) => x.id === id)
      return {
        ...s,
        orders: s.orders.map((x) => (x.id === id ? { ...x, otpCode: code } : x)),
        notifications: [
          {
            id: uid('n'),
            type: 'sms',
            title: 'محاكاة رسالة OTP للزبون',
            body: o
              ? `رمز التحقق المرسل لرقم ${o.customerPhone} هو: ${code}`
              : `رمز التحقق هو: ${code}`,
            read: false,
            createdAt: now(),
          },
          ...s.notifications,
        ].slice(0, 120),
      }
    })
  }

  const completeDelivery: CaptainCtx['completeDelivery'] = (id, otp, photo) => {
    const order = state.orders.find((o) => o.id === id)
    if (!order) return 'الطلب غير موجود'
    if (order.otpCode && otp !== order.otpCode) {
      const attempts = order.oTptAttempts + 1
      setState((s) => ({
        ...s,
        orders: s.orders.map((x) => (x.id === id ? { ...x, oTptAttempts: attempts } : x)),
      }))
      if (attempts >= 3) return 'تم تجاوز عدد المحاولات. أكمل بالصورة أو تواصل مع الإدارة.'
      return 'رمز OTP غير صحيح. حاول مرة أخرى.'
    }
    const delivered = now()
    const entry: LedgerEntry = {
      id: uid('l'),
      orderId: id,
      shopName: order.shopName,
      customerName: order.customerName,
      paidToShop: order.itemPrice,
      collectedFromCustomer: order.itemPrice + order.deliveryFee,
      deliveryFee: order.deliveryFee,
      refund: 0,
      at: delivered,
      type: 'delivered',
    }
    setState((s) => {
      const orders = s.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              stage: 'delivered' as OrderStage,
              deliveredAt: delivered,
              photoProof: photo,
              oTptAttempts: o.otpCode && otp === o.otpCode ? o.oTptAttempts : Math.min(3, o.oTptAttempts),
              adminNote: o.otpCode && otp === o.otpCode ? 'تأكيد عبر OTP' : 'تأكيد بالصورة',
            }
          : o,
      )
      return {
        ...s,
        activeOrderId: '',
        orders,
        ledger: [entry, ...s.ledger],
        notifications: [
          {
            id: uid('n'),
            type: 'success',
            title: 'تم التسليم بنجاح ✅',
            body: `أُضيف الطلب إلى كشف حسابك (${order.shopName})`,
            read: false,
            createdAt: delivered,
          },
          ...s.notifications,
        ].slice(0, 120),
      }
    })
    return null
  }

  const cancelOrder: CaptainCtx['cancelOrder'] = (id, reason, details = '') => {
    setState((s) => {
      const o = s.orders.find((x) => x.id === id)
      const entry: LedgerEntry | null = o
        ? {
            id: uid('l'),
            orderId: id,
            shopName: o.shopName,
            customerName: o.customerName,
            paidToShop: o.stage !== 'new' && o.stage !== 'toShop' ? o.itemPrice : 0,
            collectedFromCustomer: 0,
            deliveryFee: 0,
            refund: 0,
            at: now(),
            type: 'canceled',
          }
        : null
      return {
        ...s,
        activeOrderId: '',
        orders: s.orders.map((x) =>
          x.id === id ? { ...x, stage: 'canceled' as OrderStage, cancelReason: `${reason}${details ? ' — ' + details : ''}`, canceledAt: now() } : x,
        ),
        ledger: entry ? [entry, ...s.ledger] : s.ledger,
        notifications: [
          {
            id: uid('n'),
            type: 'alert',
            title: 'تم إلغاء الطلب',
            body: o ? `أُلغي الطلب من ${o.shopName} (${reason})` : '',
            read: false,
            createdAt: now(),
          },
          ...s.notifications,
        ].slice(0, 120),
      }
    })
  }

  const reportProblem: CaptainCtx['reportProblem'] = (id, problem, action) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              problem,
              problemAction: action,
              stage: action === 'return' ? ('returned' as OrderStage) : o.stage,
            }
          : o,
      ),
      notifications: [
        {
          id: uid('n'),
          type: 'alert',
          title: 'مشكلة في التسليم',
          body: `${problem} — ${action === 'return' ? 'الطلب في طريقه للإرجاع' : 'جرى الانتظار 10 دقائق'}`,
          read: false,
          createdAt: now(),
        },
        ...s.notifications,
      ].slice(0, 120),
    }))
    if (action === 'wait') {
      setTimeout(() => {
        const o = state.orders.find((x) => x.id === id)
        if (!o || o.stage === 'delivered' || o.stage === 'canceled' || o.stage === 'returned') return
        setState((s) => ({
          ...s,
          notifications: [
            {
              id: uid('n'),
              type: 'alert',
              title: 'انتهت فترة الانتظار ⏳',
              body: `الطلب ${o.title} — هل تريد المحاولة مرة أخرى أم إرجاع الطلب؟`,
              read: false,
              createdAt: now(),
              target: id,
            },
            ...s.notifications,
          ].slice(0, 120),
        }))
      }, 10 * 60 * 1000)
    }
  }

  const arriveReturn: CaptainCtx['arriveReturn'] = (id) =>
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, returnedAt: now(), stage: 'awaitRefund' as OrderStage } : o,
      ),
    }))

  const confirmRefund: CaptainCtx['confirmRefund'] = (id, received) => {
    setState((s) => {
      const o = s.orders.find((x) => x.id === id)
      const entry: LedgerEntry | null = o
        ? {
            id: uid('l'),
            orderId: id,
            shopName: o.shopName,
            customerName: o.customerName,
            paidToShop: o.itemPrice,
            collectedFromCustomer: 0,
            deliveryFee: 0,
            refund: received ? o.itemPrice : 0,
            at: now(),
            type: received ? 'returned' : 'canceled',
          }
        : null
      const notification = received
        ? {
            id: uid('n'),
            type: 'success',
            title: 'تم استرداد المبلغ ✅',
            body: o ? `استرددت ${money(o.itemPrice)} من ${o.shopName}` : '',
            read: false as const,
            createdAt: now(),
          }
        : {
            id: uid('n'),
            type: 'alert',
            title: 'بانتظار الاسترداد ⏳',
            body: o ? `المحل ${o.shopName} يرفض الاسترجاع، أُرسل تنبيه عاجل للإدارة` : '',
            read: false as const,
            createdAt: now(),
          }
      return {
        ...s,
        activeOrderId: '',
        orders: s.orders.map((x) =>
          x.id === id ? { ...x, refundConfirmedAt: now(), refundReceived: received, stage: received ? ('refunded' as OrderStage) : ('awaitRefund' as OrderStage) } : x,
        ),
        ledger: entry ? [entry, ...s.ledger] : s.ledger,
        notifications: [notification, ...s.notifications].slice(0, 120),
      }
    })
  }

  const sendEmergency: CaptainCtx['sendEmergency'] = (desc = '') =>
    setState((s) => ({
      ...s,
      notifications: [
        {
          id: uid('n'),
          type: 'alert',
          title: '🚨 تنبيه طوارئ أُرسل للإدارة',
          body: desc || 'أُرسل تنبيه طوارئ مع الموقع والوقت',
          read: false,
          createdAt: now(),
        } as AppNotification,
        ...s.notifications,
      ].slice(0, 120),
    }))

  const rateStore: CaptainCtx['rateStore'] = (id, data) =>
    setState((s) => ({
      ...s,
      ratings: [{ id: uid('r'), orderId: id, ...data, createdAt: now() }, ...s.ratings],
      notifications: [
        {
          id: uid('n'),
          type: 'success',
          title: 'تم إرسال التقييم ⭐',
          body: 'شكراً لتقييمك للمحل!',
          read: false,
          createdAt: now(),
        } as AppNotification,
        ...s.notifications,
      ].slice(0, 120),
    }))

  const addComplaint: CaptainCtx['addComplaint'] = (data) => {
    const id = uid('c')
    setState((s) => ({
      ...s,
      complaints: [
        {
          id,
          ...data,
          status: 'open',
          createdAt: now(),
          comments: [],
        },
        ...s.complaints,
      ],
      notifications: [
        {
          id: uid('n'),
          type: 'info',
          title: 'تم إرسال الشكوى',
          body: `رقم الشكوى #${id.slice(-5).toUpperCase()} — قيد المراجعة`,
          read: false,
          createdAt: now(),
        },
        ...s.notifications,
      ].slice(0, 120),
    }))
    return id
  }

  const addComment: CaptainCtx['addComment'] = (complaintId, text) =>
    setState((s) => ({
      ...s,
      complaints: s.complaints.map((c) =>
        c.id === complaintId ? { ...c, comments: [...c.comments, { at: now(), text }] } : c,
      ),
    }))

  const closeComplaint: CaptainCtx['closeComplaint'] = (complaintId) =>
    setState((s) => ({
      ...s,
      complaints: s.complaints.map((c) =>
        c.id === complaintId ? { ...c, status: 'resolved' } : c,
      ),
    }))

  const setComplaintStatus: CaptainCtx['setComplaintStatus'] = (complaintId, status) =>
    setState((s) => ({
      ...s,
      complaints: s.complaints.map((c) =>
        c.id === complaintId ? { ...c, status } : c,
      ),
    }))

  const markAllRead = () =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }))

  const markRead = (id: string) =>
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))

  const setActiveOrder = (activeOrderId: string) => setState((s) => ({ ...s, activeOrderId }))

  const getOrder = (id?: string) => state.orders.find((o) => o.id === id)
  const getActiveOrder = () => state.orders.find((o) => o.id === state.activeOrderId)
  const getLedgerForOrder = (id: string) => state.ledger.filter((l) => l.orderId === id)

  const captainName = (id?: string) => {
    if (id === 'captain') return state.captain?.name || 'كابتن'
    return state.captain?.name || 'كابتن'
  }
  const shopName = (id?: string) => state.orders.find((o) => o.id === id)?.shopName || 'لم يُحدد'

  const orderPrice = (o: Order) => o.itemPrice
  const orderTotal = (o: Order) => o.itemPrice + o.deliveryFee

  const value: CaptainCtx = useMemo(
    () => ({
      state,
      captainName,
      shopName,
      orderPrice,
      orderTotal,
      fmtTime,
      fmtDate,
      money,
      register,
      login,
      logout,
      changePassword,
      setStatus,
      setLanguage,
      pickShift,
      consumeShiftChange,
      setOnline,
      checkIn,
      checkOut,
      createDemoOrder,
      acceptOrder,
      rejectOrder,
      arriveShop,
      pickup,
      toCustomer,
      sendSmsOtp,
      completeDelivery,
      cancelOrder,
      reportProblem,
      arriveReturn,
      confirmRefund,
      rateStore,
      sendEmergency,
      addComplaint,
      addComment,
      closeComplaint,
      setComplaintStatus,
      markAllRead,
      markRead,
      setActiveOrder,
      getOrder,
      getActiveOrder,
      getLedgerForOrder,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCaptain() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCaptain must be used within CaptainProvider')
  return ctx
}
