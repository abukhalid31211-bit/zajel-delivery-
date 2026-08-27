/** مفتاح تبديل (Toggle) */
export default function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6.5 w-11.5 shrink-0 rounded-full transition-colors ${checked ? 'bg-gold' : 'bg-line'} ${disabled ? 'opacity-50' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow transition-all ${checked ? 'right-0.5' : 'right-[23px]'}`}
      />
    </button>
  )
}
