export function digitsOnly(v: string) {
  return v.replace(/\D/g, '')
}

export function isIraqMobile(v: string) {
  const d = digitsOnly(v)
  return /^7\d{9}$/.test(d)
}

export function passwordStrength(pass: string): 'ضعيفة' | 'متوسطة' | 'قوية' | null {
  if (!pass) return null
  if (pass.length < 6) return 'ضعيفة'
  const strong = pass.length > 8 && /\d/.test(pass) && /[^A-Za-z0-9\u0600-\u06FF]/.test(pass)
  if (strong) return 'قوية'
  return 'متوسطة'
}
