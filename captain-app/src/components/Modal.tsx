export default function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose?: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="animate-fade-up mx-auto w-full max-w-[430px] rounded-t-3xl bg-white p-6 sm:mx-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold">{title}</h3>
        {children}
      </div>
    </div>
  )
}
