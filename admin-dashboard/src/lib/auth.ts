export const SUPER_PHONE = '7888216090'
export const SUPER_PASSWORD = '12345678'
export const SUPER_NAME = 'مدير النظام'

export function isSuperLogin(phone: string, password: string) {
  const p = phone.replace(/\D/g, '')
  return p === SUPER_PHONE && password === SUPER_PASSWORD
}

export function isSuperPhone(phone: string) {
  return phone.replace(/\D/g, '') === SUPER_PHONE
}
