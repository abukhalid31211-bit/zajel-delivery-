import { useRef } from 'react'

export default function RichEditor({
  value,
  onChange,
  minH = 'min-h-40',
}: {
  value: string
  onChange: (v: string) => void
  minH?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const wrap = (before: string, after = before) => {
    const el = ref.current
    if (!el) {
      onChange(value + before + after)
      return
    }
    const s = el.selectionStart
    const e = el.selectionEnd
    onChange(value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e))
  }

  const btns = [
    { l: 'عريض', fn: () => wrap('**') },
    { l: 'مائل', fn: () => wrap('_') },
    { l: 'تسطير', fn: () => wrap('<u>', '</u>') },
    { l: 'عنوان', fn: () => wrap('\n## ', '\n') },
    { l: 'نقطي', fn: () => wrap('\n- ') },
    { l: 'مرقّم', fn: () => wrap('\n1. ') },
    { l: 'رابط', fn: () => wrap('[', '](https://)') },
  ]

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-t-xl border border-b-0 border-line bg-page p-1.5">
        {btns.map((b) => (
          <button key={b.l} type="button" className="rounded-lg px-2 py-1 text-[11px] font-semibold text-mute hover:bg-white hover:text-black" onClick={b.fn}>
            {b.l}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        className={`field rounded-t-none ${minH} resize-y`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب المحتوى هنا..."
      />
    </div>
  )
}
