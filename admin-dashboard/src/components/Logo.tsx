export default function Logo({ size = 40, light = false }: { size?: number; light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`flex items-center justify-center rounded-xl ${light ? 'bg-white' : 'bg-black'}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" width={size * 0.6} height={size * 0.6}>
          <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill={light ? '#000' : '#fff'} />
          <circle cx="50" cy="16" r="4" fill={light ? '#000' : '#fff'} />
        </svg>
      </div>
      <div className="leading-tight">
        <p className={`font-bold ${light ? 'text-white' : 'text-black'}`} style={{ fontSize: size * 0.38 }}>
          زاجل ديلفري
        </p>
        <p className={`${light ? 'text-white/60' : 'text-mute'} font-medium`} style={{ fontSize: size * 0.24 }}>
          Zajel Delivery
        </p>
      </div>
    </div>
  )
}
