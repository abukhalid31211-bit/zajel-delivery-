export default function Toggle({
  on,
  onChange,
  disabled = false,
}: {
  on: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-black' : 'bg-line'} ${disabled ? 'opacity-60' : ''}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'right-0.5' : 'right-[22px]'}`} />
    </button>
  )
}
