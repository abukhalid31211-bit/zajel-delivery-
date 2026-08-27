import { useEffect, useRef } from 'react'
import { OTHER } from '../lib/customOption'

/* ============================================================
   عناصر واجهة موحّدة لخيار «أخرى» داخل القوائم المنسدلة
   ============================================================ */

/** خيار «أخرى» — يُضاف في آخر القائمة المنسدلة */
export function OtherOption({ label = `➕ ${OTHER} — اكتب اسماً جديداً` }: { label?: string }) {
  return <option value={OTHER}>{label}</option>
}

/** حقل إدخال الاسم الجديد الذي يظهر بعد اختيار «أخرى» */
export default function OtherField({
  label,
  placeholder,
  value,
  onChange,
  hint,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <div className="mt-2 rounded-xl border border-dashed border-black bg-page/70 p-3">
      <label className="mb-1.5 block text-[11px] font-semibold">{label}</label>
      <input
        ref={ref}
        className="field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1.5 text-[10px] leading-relaxed text-faint">{hint}</p>}
    </div>
  )
}
