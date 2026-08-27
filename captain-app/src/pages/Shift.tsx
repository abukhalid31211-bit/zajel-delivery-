import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sunrise, Sunset, Moon, Users } from 'lucide-react'
import { useCaptain } from '../state'

const shifts = [
  { id: 'morning', icon: Sunrise, name: 'الشفت الصباحي', time: '8:00 صباحاً — 4:00 عصراً' },
  { id: 'evening', icon: Sunset, name: 'الشفت المسائي', time: '4:00 عصراً — 12:00 ليلاً' },
  { id: 'night', icon: Moon, name: 'الشفت الليلي', time: '12:00 ليلاً — 8:00 صباحاً' },
]

export default function Shift() {
  const navigate = useNavigate()
  const { state, pickShift, consumeShiftChange } = useCaptain()
  const initial = shifts.findIndex((s) => s.id === state.captain?.shiftId)
  const [selected, setSelected] = useState<number | null>(initial >= 0 ? initial : null)
  const [confirm, setConfirm] = useState(false)
  const captain = state.captain
  const alreadyHas = Boolean(captain?.shiftId)
  const cannotChange = alreadyHas && captain?.shiftChangesLeft === 0
  const currentName = shifts.find((s) => s.id === captain?.shiftId)?.name

  const confirmChoice = () => {
    if (selected === null) return
    if (!alreadyHas) {
      pickShift(shifts[selected].id)
    } else {
      consumeShiftChange()
    }
    setConfirm(false)
    navigate('/home')
  }

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">اختر شفت العمل الأسبوعي</h1>
          <p className="mt-0.5 text-[11px] text-mute">يمكنك تغيير شفت عملك مرة واحدة فقط خلال الأسبوع</p>
        </div>
      </div>

      {cannotChange ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-dashed border-gold bg-white">
            <Users className="h-7 w-7 text-gold-dark" strokeWidth={1.5} />
          </span>
          <h2 className="text-base font-bold">فرصة التغيير انتهت</h2>
          <p className="text-xs leading-relaxed text-mute">
            لقد استخدمت فرصة تغيير الشفت هذا الأسبوع. شفتك الحالي: <b className="text-gold-dark">{currentName || 'لم يُحدد'}</b>. يمكنك التغيير الأسبوع القادم.
          </p>
          <button className="btn-secondary w-full" onClick={() => navigate('/home')}>رجوع</button>
        </div>
      ) : (
        <>
          <div className="animate-fade-up flex-1 space-y-3 px-5 py-6">
            {shifts.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setSelected(i)}
                className={`card flex w-full items-center gap-4 p-4 text-right transition-all ${selected === i ? 'border-gold shadow-md' : ''}`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${selected === i ? 'bg-gold text-white' : 'bg-page'}`}>
                  <s.icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold">{s.name}</span>
                  <span className="mt-0.5 block text-xs text-mute">{s.time}</span>
                  <span className="mt-1.5 flex items-center gap-1 text-[10px] text-faint">
                    <Users className="h-3 w-3" /> عدد الكباتن الحاليين: 0
                  </span>
                </span>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected === i ? 'border-gold' : 'border-line'}`}>
                  {selected === i && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-line bg-white px-5 py-4">
            <button className="btn-primary w-full" disabled={selected === null} onClick={() => setConfirm(true)}>
              تأكيد اختيار الشفت
            </button>
          </div>

          {confirm && selected !== null && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
              <div className="animate-fade-up mx-auto w-full max-w-[430px] rounded-t-3xl bg-white p-6 sm:mx-6 sm:rounded-3xl">
                <h3 className="text-base font-bold">تأكيد اختيار الشفت</h3>
                <p className="mt-2 text-xs leading-relaxed text-mute">
                  هل تريد اختيار {shifts[selected].name} ({shifts[selected].time})؟ {alreadyHas ? 'ستُستهلك فرصة التغيير الوحيدة لهذا الأسبوع.' : 'لن تتمكن من تغييره إلا مرة واحدة هذا الأسبوع.'}
                </p>
                <div className="mt-5 flex gap-2">
                  <button className="btn-primary flex-1" onClick={confirmChoice}>تأكيد</button>
                  <button className="btn-secondary flex-1" onClick={() => setConfirm(false)}>إلغاء</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
