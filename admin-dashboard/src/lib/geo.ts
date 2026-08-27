/* ============================================================
   Zajel Admin — أدوات جغرافية حقيقية للعراق
   - العرض الافتراضي: حدود العراق الفعلية كاملة (كل المحافظات الـ18)
   - البحث الجغرافي: Nominatim / OpenStreetMap (بدون مفاتيح API)
   لا توجد هنا أي إحداثيات وهمية لمحلات أو كباتن أو مناطق؛
   إحداثيات المحافظات تُجلب وقت الاستخدام من بحث جغرافي حقيقي.
   ============================================================ */
import L from 'leaflet'
import type { LatLng } from './types'

/** مركز تقريبي للعراق — يُستخدم فقط كنقطة بداية قبل ضبط العرض الكامل */
export const IRAQ_CENTER: LatLng = { lat: 33.2, lng: 43.3 }

/** الحدود الجغرافية الفعلية لدولة العراق (أقصى الجنوب/الغرب/الشمال/الشرق) */
const IRAQ_SOUTH_WEST: [number, number] = [29.02, 38.72]
const IRAQ_NORTH_EAST: [number, number] = [37.38, 48.68]
export const IRAQ_BOUNDS: L.LatLngBoundsExpression = [IRAQ_SOUTH_WEST, IRAQ_NORTH_EAST]

/** عرض العراق كاملاً بأكبر تكبير ممكن مهما كان حجم حاوية الخريطة */
export function fitIraq(map: L.Map) {
  // حساب التكبير يدوياً (بدون تقريب للأعلى) حتى تظهر الدولة كاملة في أي حجم حاوية
  const size = map.getSize()
  const sw = map.project(IRAQ_SOUTH_WEST, 0)
  const ne = map.project(IRAQ_NORTH_EAST, 0)
  const scale = Math.min((size.x - 8) / (ne.x - sw.x), (size.y - 8) / (sw.y - ne.y))
  const zoom = Math.max(4, Math.min(7, Math.floor(Math.log2(scale))))
  map.setView([IRAQ_CENTER.lat, IRAQ_CENTER.lng], zoom)
}

export interface GeoResult {
  /** اسم المكان كما أعاده مزود البحث */
  label: string
  center: LatLng
  /** حدود المكان إن وفرها Nominatim (فارغة إذا كانت النتيجة نقطة فقط) */
  bounds: L.LatLngBoundsExpression | null
}

interface NominatimItem {
  lat?: string
  lon?: string
  display_name?: string
  boundingbox?: string[]
}

/* ذاكرة مؤقتة داخل الجلسة لتجنب تكرار نفس طلب البحث */
const cache = new Map<string, GeoResult | null>()

/** بحث جغرافي حقيقي عبر Nominatim (OpenStreetMap) مقتصر على العراق */
export async function geocodeIraq(query: string): Promise<GeoResult | null> {
  const key = query.trim()
  if (!key) return null
  const cached = cache.get(key)
  if (cached !== undefined) return cached

  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ar' +
    '&countrycodes=iq&q=' +
    encodeURIComponent(key)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal })
    if (!res.ok) {
      cache.set(key, null)
      return null
    }
    const items = (await res.json()) as NominatimItem[]
    const item = items?.[0]
    if (!item?.lat || !item?.lon) {
      cache.set(key, null)
      return null
    }
    const center: LatLng = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) }
    let bounds: L.LatLngBoundsExpression | null = null
    if (Array.isArray(item.boundingbox) && item.boundingbox.length === 4) {
      const [south, north, west, east] = item.boundingbox.map(Number)
      if ([south, north, west, east].every((v) => Number.isFinite(v))) {
        const area = (north - south) * (east - west)
        // الحدود النقطية (مساحة ضئيلة) لا تصلح للتكبير عليها
        if (area > 0.004) bounds = [[south, west], [north, east]]
      }
    }
    const result: GeoResult = { label: item.display_name || key, center, bounds }
    cache.set(key, result)
    return result
  } catch {
    cache.set(key, null)
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** تحريك الخريطة بسلاسة إلى مكان عراقي حسب نتيجة بحث حقيقي (بدون إحداثيات صلبة) */
export async function flyToIraqPlace(map: L.Map, query: string): Promise<boolean> {
  const result = await geocodeIraq(query)
  if (!result) return false
  if (result.bounds) {
    map.fitBounds(result.bounds, { padding: [24, 24], maxZoom: 12 })
  } else {
    map.setView([result.center.lat, result.center.lng], 11, { animate: true })
  }
  return true
}
