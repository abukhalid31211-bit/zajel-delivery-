import { dbGet, dbSet, dbRemove, nowIso } from './db'

export type Session = {
  phone: string
  name: string
  role: string
  loginAt: string
  lastActive: number
  super: boolean
  perms: Record<string, string[]>
  govIds: string[]
  districtIds: string[]
  storeIds: string[]
  captainIds: string[]
}

const KEY = 'session'
export const SESSION_IDLE_MS = 15 * 60 * 1000

export function getSession(): Session | null {
  return dbGet<Session | null>(KEY, null)
}

export function setSession(s: Session) {
  dbSet(KEY, s)
}

export function touchSession() {
  const s = getSession()
  if (!s) return
  s.lastActive = Date.now()
  dbSet(KEY, s)
}

export function clearSession() {
  dbRemove(KEY)
}

export function isSessionExpired() {
  const s = getSession()
  if (!s) return true
  return Date.now() - s.lastActive > SESSION_IDLE_MS
}

export function startSession(
  phone: string,
  name: string,
  role: string,
  extra?: Partial<Pick<Session, 'super' | 'perms' | 'govIds' | 'districtIds' | 'storeIds' | 'captainIds'>>,
) {
  const s: Session = {
    phone,
    name,
    role,
    loginAt: nowIso(),
    lastActive: Date.now(),
    super: extra?.super ?? role === 'Super Admin',
    perms: extra?.perms || {},
    govIds: extra?.govIds || [],
    districtIds: extra?.districtIds || [],
    storeIds: extra?.storeIds || [],
    captainIds: extra?.captainIds || [],
  }
  setSession(s)
  return s
}
