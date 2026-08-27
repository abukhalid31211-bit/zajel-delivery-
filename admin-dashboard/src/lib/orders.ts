import { getSettings } from './settings'

export const ACTIVE_STATUSES = [
  'طلب جديد',
  'بانتظار كابتن',
  'تم قبول الكابتن',
  'متوجه للمحل',
  'وصل للمحل',
  'استلم الطلب',
  'بالطريق للزبون',
  'تم التسليم',
]

export function waitMinutes(waitingStartedAt?: string) {
  if (!waitingStartedAt) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(waitingStartedAt).getTime()) / 60000))
}

export function isStuck(status: string, waitingStartedAt?: string) {
  if (status !== 'بانتظار كابتن') return false
  return waitMinutes(waitingStartedAt) >= getSettings().stuckAlertMin
}

export function shouldAutoCancel(status: string, waitingStartedAt?: string) {
  if (status !== 'بانتظار كابتن') return false
  return waitMinutes(waitingStartedAt) >= 20
}
