/* ============================================================
   Zajel Store App — مكونات الخريطة الحقيقية (Leaflet + OSM)
   خريطة تفاعلية حقيقية: عرض العراق كاملاً افتراضياً، موقع المستخدم
   (GPS) عند الموافقة، الانتقال لأي محافظة عبر بحث جغرافي حقيقي
   (Nominatim/OSM)، تثبيت دبوس، مضلعات مناطق التغطية (Geofencing)،
   وعرض حركة الكابتن. بدون مفاتيح API وبدون إحداثيات وهمية.
   ============================================================ */
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { GOVERNORATES, SERVICE_ZONES, lerp, type LatLng } from './data'
import { IRAQ_CENTER, fitIraq, flyToIraqPlace } from './geo'

/** المركز الافتراضي: العراق (تُضبط الخريطة على كامل الدولة عند الفتح) */
export const DEFAULT_CENTER: LatLng = { lat: 33.2, lng: 43.3 }

const DEFAULT_ZOOM = 6

const isDefaultPos = (p: LatLng) => p.lat === IRAQ_CENTER.lat && p.lng === IRAQ_CENTER.lng

function pin(emoji: string, kind: 'store' | 'dropoff' | 'captain') {
  return L.divIcon({
    className: '',
    html: `<div class="zajel-pin ${kind}"><span>${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 30],
  })
}

export interface MapMarker {
  pos: LatLng
  kind: 'store' | 'dropoff' | 'captain'
  label?: string
}

export function MapView({
  center = DEFAULT_CENTER,
  markers = [],
  zones = [],
  height = 240,
  zoom = 13,
  interactive = false,
  fit = false,
}: {
  center?: LatLng
  markers?: MapMarker[]
  zones?: LatLng[][]
  height?: number
  zoom?: number
  interactive?: boolean
  fit?: boolean
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const lastFitKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!divRef.current || mapRef.current) return
    const map = L.map(divRef.current, {
      center: [center.lat, center.lng],
      zoom,
      minZoom: 4,
      maxZoom: 19,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: interactive,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* العرض الافتراضي: العراق كاملاً — إلا إذا كان هناك محتوى يُركَّز عليه */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const hasContent = markers.length > 0 || zones.some((z) => z.length > 2)
    if (!(fit && hasContent)) fitIraq(map)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    // مفتاح المحتوى: يُعاد الرسم/التركيز فقط عند تغيّر فعلي في المحتوى،
    // حتى لا تُقاطع إعادة التصيير حركة التمرير والتكبير اليدوية
    const contentKey =
      markers.map((m) => `${m.pos.lat.toFixed(5)},${m.pos.lng.toFixed(5)},${m.kind}`).join('|') +
      '#' +
      zones.map((z) => z.length).join(',')
    const changed = lastFitKeyRef.current !== contentKey

    if (changed) {
      layer.clearLayers()

      zones.forEach((ring) => {
        if (ring.length > 2) {
          L.polygon(ring, {
            color: '#c9a227',
            weight: 2,
            dashArray: '6 6',
            fillColor: '#c9a227',
            fillOpacity: 0.08,
          }).addTo(layer)
        }
      })

      markers.forEach((m) => {
        const mk = L.marker([m.pos.lat, m.pos.lng], { icon: pin(m.kind === 'store' ? '🏪' : m.kind === 'captain' ? '🛵' : '🏠', m.kind) }).addTo(layer)
        if (m.label) mk.bindTooltip(m.label, { direction: 'top', offset: [0, -24] })
      })

      if (fit && markers.length > 0) {
        const group = L.featureGroup(markers.map((m) => L.marker([m.pos.lat, m.pos.lng])))
        map.fitBounds(group.getBounds().pad(0.35))
      } else if (fit && zones.length > 0) {
        const group = L.featureGroup(zones.map((ring) => L.polygon(ring)))
        map.fitBounds(group.getBounds().pad(0.25))
      }
    }

    lastFitKeyRef.current = contentKey
  }, [markers, zones, fit])

  return <div ref={divRef} className="zajel-map" style={{ height, width: '100%' }} />
}

/** منتقي موقع: خريطة العراق الحقيقية — GPS اختياري عند الفتح + الانتقال لأي محافظة */
export function LocationPicker({
  value,
  onChange,
  locked = false,
  height = 240,
  zones = [],
  children,
  gps = false,
  governorates = GOVERNORATES,
}: {
  value: LatLng
  onChange?: (pos: LatLng) => void
  locked?: boolean
  height?: number
  zones?: LatLng[][]
  children?: React.ReactNode
  /** محاولة تحديد موقع المستخدم (GPS) تلقائياً عند فتح الخريطة */
  gps?: boolean
  /** قائمة المحافظات (أسماء من بيانات النظام) للانتقال إليها عبر بحث جغرافي حقيقي */
  governorates?: string[]
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const zonesLayerRef = useRef<L.LayerGroup | null>(null)
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  const lockedRef = useRef(locked)
  const gpsRef = useRef(gps)
  const lastEmittedRef = useRef<LatLng | null>(value)
  const suppressRef = useRef(0)
  const govReqRef = useRef(0)

  valueRef.current = value
  onChangeRef.current = onChange
  lockedRef.current = locked
  gpsRef.current = gps

  const [gov, setGov] = useState('')
  const [govStatus, setGovStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const suppressMove = () => {
    suppressRef.current += 1
  }

  useEffect(() => {
    if (!divRef.current || mapRef.current) return
    const map = L.map(divRef.current, {
      center: [IRAQ_CENTER.lat, IRAQ_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      minZoom: 4,
      maxZoom: 19,
      scrollWheelZoom: !lockedRef.current,
      dragging: !lockedRef.current,
      zoomControl: !lockedRef.current,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map)
    zonesLayerRef.current = L.layerGroup().addTo(map)

    // الحركات البرمجية (تمركز/انتقال) لا تُعتبر اختيار موقع من المستخدم
    map.on('moveend', () => {
      if (suppressRef.current > 0) {
        suppressRef.current -= 1
        return
      }
      const c = map.getCenter()
      const pos: LatLng = { lat: c.lat, lng: c.lng }
      lastEmittedRef.current = pos
      onChangeRef.current?.(pos)
    })
    // أي تفاعل يدوي يُصفي أي كبت معلّق (حماية من فقدان أول حركة للمستخدم)
    const clearSuppress = () => {
      suppressRef.current = 0
    }
    map.on('mousedown', clearSuppress)
    map.on('touchstart', clearSuppress)
    map.on('wheel', clearSuppress)
    mapRef.current = map

    /* ---------- العرض الافتتاحي: GPS إن أمكن، ثم الموقع المحفوظ، ثم العراق كاملاً ---------- */
    const startPos = valueRef.current
    if (lockedRef.current) {
      suppressMove()
      if (isDefaultPos(startPos)) fitIraq(map)
      else map.setView([startPos.lat, startPos.lng], 15)
    } else if (gpsRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const user: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          suppressMove()
          map.setView([user.lat, user.lng], 15)
          // يُؤجَّل الإصدار خطوة واحدة حتى لا تتعارض مزامنة القيمة مع التحرك البرمجي
          queueMicrotask(() => {
            lastEmittedRef.current = user
            onChangeRef.current?.(user)
          })
        },
        () => {
          // لا إذن/تعذر التحديد → عرض العراق كاملاً مع التنقل اليدوي الحر
          suppressMove()
          fitIraq(map)
        },
        { timeout: 8000, maximumAge: 120000 },
      )
    } else if (!isDefaultPos(startPos)) {
      suppressMove()
      map.setView([startPos.lat, startPos.lng], 15)
    } else {
      suppressMove()
      fitIraq(map)
    }

    return () => {
      map.remove()
      mapRef.current = null
      zonesLayerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* مزامنة الحالة المقفلة/المفتوحة */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.dragging[locked ? 'disable' : 'enable']()
    map.scrollWheelZoom[locked ? 'disable' : 'enable']()
  }, [locked])

  /* قيمة خارجية جديدة (مثل زر GPS في الشاشة) → تتحرك الخريطة إليها */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const last = lastEmittedRef.current
    if (last && last.lat === value.lat && last.lng === value.lng) return
    suppressMove()
    map.flyTo([value.lat, value.lng], map.getZoom() < 12 ? 15 : map.getZoom(), { duration: 0.9 })
    lastEmittedRef.current = value
  }, [value])

  /* مضلعات مناطق التغطية (Geofencing) — تُحدَّث مباشرة مع حركة الدبوس */
  useEffect(() => {
    const layer = zonesLayerRef.current
    if (!layer) return
    layer.clearLayers()
    zones.forEach((ring) => {
      if (ring.length > 2) {
        L.polygon(ring, { color: '#c9a227', weight: 2, dashArray: '6 6', fillColor: '#c9a227', fillOpacity: 0.08 }).addTo(layer)
      }
    })
  }, [zones])

  /* إخفاء رسالة الخطأ بعد لحظات */
  useEffect(() => {
    if (govStatus !== 'error') return
    const t = setTimeout(() => setGovStatus('idle'), 4000)
    return () => clearTimeout(t)
  }, [govStatus])

  const recenter = () => {
    const map = mapRef.current
    if (!map) return
    suppressMove()
    if (isDefaultPos(valueRef.current)) fitIraq(map)
    else map.setView([valueRef.current.lat, valueRef.current.lng], 15, { animate: true })
  }

  /* الانتقال لمحافظة عبر بحث جغرافي حقيقي (Nominatim/OSM) */
  const flyToGov = async (name: string) => {
    const map = mapRef.current
    if (!map) return
    const req = ++govReqRef.current
    if (!name) {
      setGov('')
      setGovStatus('idle')
      suppressMove()
      fitIraq(map)
      return
    }
    setGov(name)
    setGovStatus('loading')
    suppressMove()
    const ok = await flyToIraqPlace(map, name)
    if (govReqRef.current !== req) return
    if (!ok) suppressRef.current = Math.max(0, suppressRef.current - 1)
    setGovStatus(ok ? 'done' : 'error')
  }

  const hasValue = locked || !isDefaultPos(value)

  return (
    <div className="relative">
      <div ref={divRef} className="zajel-map" style={{ height, width: '100%' }} />
      {!locked && hasValue && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="zajel-pin store -translate-y-3.5" style={{ transform: 'rotate(-45deg)' }}>
            <span style={{ transform: 'rotate(45deg)' }}>📍</span>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={recenter}
        className="absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-xl border border-gold/40 bg-white/95 px-3 py-2 text-[11px] font-bold text-gold-strong shadow"
      >
        ⌖ إعادة التمركز
      </button>
      {!locked && governorates.length > 0 && (
        <div className="absolute right-3 top-3 z-[500] flex items-center gap-1.5">
          <select
            className="cursor-pointer rounded-xl border border-line bg-white/95 px-2.5 py-2 text-[11px] font-bold text-ink shadow-sm outline-none"
            dir="rtl"
            value={gov}
            onChange={(e) => {
              void flyToGov(e.target.value)
            }}
          >
            <option value="">🗺️ العراق كامل</option>
            {governorates.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {govStatus === 'loading' && (
            <span className="rounded-xl border border-line bg-white/95 px-2 py-2 text-[10px] font-bold text-mute shadow-sm">…</span>
          )}
          {govStatus === 'error' && (
            <span
              className="rounded-xl border border-line bg-white/95 px-2 py-2 text-[10px] font-bold text-mute shadow-sm"
              title="تعذر تحديد موقع المحافظة تلقائياً — حرّك الخريطة يدوياً"
            >
              ⚠️
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

/** مضلع منطقة التغطية التقريبية حول نقطة (تمثيل Geofencing) */
export function zoneRing(center: LatLng, radiusKm: number, points = 24): LatLng[] {
  const ring: LatLng[] = []
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2
    const dLat = (radiusKm / 111) * Math.sin(angle)
    const dLng = (radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180))) * Math.cos(angle)
    ring.push({ lat: center.lat + dLat, lng: center.lng + dLng })
  }
  return ring
}

/** موقع الكابتن التقديري على المسار حسب مرحلة الطلب */
export function captainPosFor(store: LatLng, dropoff: LatLng, status: string): LatLng | null {
  switch (status) {
    case 'heading':
      return lerp(store, dropoff, 0.18)
    case 'arrived':
      return lerp(store, dropoff, 0.03)
    case 'picked_up':
      return lerp(store, dropoff, 0.05)
    case 'on_way':
      return lerp(store, dropoff, 0.62)
    case 'delivered':
    case 'completed':
      return dropoff
    default:
      return null
  }
}

export { SERVICE_ZONES }
