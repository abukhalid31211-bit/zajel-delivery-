import { Check } from 'lucide-react'

/** مؤشر خطوات (Stepper) */
export default function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const n = i + 1
        const done = current > n
        const active = current === n
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                done
                  ? 'bg-gold text-white'
                  : active
                    ? 'border-2 border-gold bg-white text-gold-strong'
                    : 'border border-line bg-white text-faint'
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            <span className={`text-[9.5px] font-bold ${active ? 'text-gold-deep' : 'text-faint'}`}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
