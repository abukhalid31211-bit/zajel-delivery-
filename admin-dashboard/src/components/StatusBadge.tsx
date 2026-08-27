export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    نشط: 'bg-black text-white',
    مفعّلة: 'bg-black text-white',
    مكتمل: 'bg-black text-white',
    محلولة: 'bg-black text-white',
    منشورة: 'bg-black text-white',
    'مُسوَّى': 'bg-black text-white',
    نجاح: 'bg-black text-white',
    'بانتظار الموافقة': 'bg-faint text-white',
    بانتظار: 'bg-faint text-white',
    مفتوحة: 'bg-[#333] text-white',
    'قيد المراجعة': 'bg-[#666] text-white',
    مهم: 'bg-[#666] text-white',
    عاجل: 'bg-[#333] text-white',
    موقوف: 'border border-dashed border-black text-black bg-white',
    متوقفة: 'border border-dashed border-black text-black bg-white',
    ملغي: 'border border-dashed border-black text-black bg-white',
    مرفوض: 'bg-[#333] text-white',
    مسودة: 'bg-page text-mute border border-line',
    'لم تُسوَّ': 'bg-page text-mute border border-line',
    فشل: 'bg-[#333] text-white',
  }
  return <span className={`badge ${map[status] || 'border border-line bg-page text-mute'}`}>{status}</span>
}
