import { Star } from 'lucide-react'

/** مقياس نجوم ذهبي تفاعلي */
export default function Stars({
  value,
  onChange,
  size = 32,
  readOnly = false,
}: {
  value: number
  onChange?: (n: number) => void
  size?: number
  readOnly?: boolean
}) {
  return (
    <div className="flex justify-center gap-1.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? 'cursor-default' : 'transition-transform active:scale-90'}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? 'fill-gold stroke-gold' : 'stroke-line-strong'}
            strokeWidth={1.4}
          />
        </button>
      ))}
    </div>
  )
}
